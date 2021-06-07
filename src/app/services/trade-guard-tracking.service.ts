import { Injectable } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { NotificationsService, NotificationType } from "@alert/services/notifications.service";
import { IBFTMission, TradingProfileService } from "modules/BreakfreeTrading/services/tradingProfile.service";
import { Subject, Subscription } from "rxjs";
import { BrokerService } from "./broker.service";
import { MTBroker } from "./mt/mt.broker";
import { OrderTypes } from "modules/Trading/models/models";
import { MTCurrencyRiskType } from "modules/Trading/models/forex/mt/mt.models";
import { TradeGuardService } from "modules/BreakfreeTrading/services/tradeGuard.service";

@Injectable()
export class TradeGuardTrackingService {
    private _timeout: number = 1000 * 60 * 1.5; // 1.5 min
    private _count: number = 0;
    private _score: number = 10;
    
    constructor(private _notificationsService: NotificationsService,
                private _tradeGuardService: TradeGuardService) {
    }

    initTimer() {
        setInterval(() => {
            this._checkTradeGuardItems();
        }, this._timeout);
    }

    private _checkTradeGuardItems() {
        const tradeGuardItems = this._tradeGuardService.GetRiskOverview();

        if (tradeGuardItems) {
            if (tradeGuardItems.Score <= 5 && tradeGuardItems.Score < this._score) {
                this._notificationsService.show("Account trading score very low. Review your 'TradeGuard' suggestions.", "Trade Guard", NotificationType.Info);
            } else if (tradeGuardItems.Items.length > this._count) {
                this._notificationsService.show("You have new 'TradeGuard' suggestions. Please take care of your trades.", "Trade Guard", NotificationType.Info);
            }
            this._score = tradeGuardItems.Score;
            this._count = tradeGuardItems.Items.length;
        }
    }

}
