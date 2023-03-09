import { Injectable } from "@angular/core";
import { NotificationsService, NotificationType } from "@alert/services/notifications.service";
import { TradeGuardService } from "modules/BreakfreeTrading/services/tradeGuard.service";
import { SettingsStorageService } from "./settings-storage.servic";

@Injectable()
export class TradeGuardTrackingService {
    private _timeout: number = 1000 * 60 * 1.5; // 1.5 min
    private _count: number = 0;
    private _score: number = 10;
    private _initialized: boolean = false;

    constructor(private _notificationsService: NotificationsService,
        protected _settingsStorageService: SettingsStorageService,
        private _tradeGuardService: TradeGuardService) {
    }

    initTimer() {
        if (this._initialized) {
            return;
        }

        this._initialized = true;

        setInterval(() => {
            this._settingsStorageService.getSettings().subscribe((_) => {
                if (_.ActiveTradingFeedback) {
                    this._checkTradeGuardItems();
                }
            });
        }, this._timeout);
    }

    private _checkTradeGuardItems() {
        const tradeGuardItems = this._tradeGuardService.GetRiskOverview();


        if (tradeGuardItems) {
            if (tradeGuardItems.Items.length > this._count || tradeGuardItems.Score < this._score) {
                if (tradeGuardItems.Score <= 5) {
                    this._notificationsService.show("I have found some major issues with your trades, please open the TradeGuard Dashboard and review now.", "TradeGuard", NotificationType.Info);
                } else {
                    this._notificationsService.show("I have some ideas to improve your current trades, check out the TradeGuard Dashboard now.", "TradeGuard", NotificationType.Info);
                }
            }
            this._score = tradeGuardItems.Score;
            this._count = tradeGuardItems.Items.length;
        }
    }

}
