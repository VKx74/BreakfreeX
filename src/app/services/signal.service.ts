import {Injectable} from "@angular/core";
import {AutoTradingAlertService} from "../../modules/AutoTradingAlerts/services/auto-trading-alert.service";
import {Subject} from "rxjs";
import {TradeSettings} from "../../modules/AutoTradingAlerts/models/TradeSettingsBase";
import {ScriptCloudExecutorService} from "../../modules/Scripting/services/script-cloud-executor.service";

export interface PopupSignal {
    title: string;
    message: string;
}

export interface SoundSignal {
    soundId: string;
}

@Injectable()
export class SignalService {

    public onTradeSignal = new Subject<TradeSettings>();
    public onPopupSignal = new Subject<PopupSignal>();
    public onSoundSignal = new Subject<SoundSignal>();

    constructor(private _alertService: AutoTradingAlertService,
                private _scriptCloudExecutorService: ScriptCloudExecutorService) {
        this._alertService.onAlertTriggered.subscribe(alert => {
            if (alert && alert.configuredTrade && !alert.isOnCloud) {
                this.onTradeSignal.next(alert.configuredTrade);
            }
        });

        this._alertService.onAlertPlaySound.subscribe(value => {
            this.onSoundSignal.next({
                soundId: value
            });
        });

        this._alertService.onAlertShowPopup.subscribe(value => {
            this.onPopupSignal.next({
                message: value,
                title: 'Alert'
            });
        });

        this._scriptCloudExecutorService.onScriptPlaySound.subscribe(value => {
            this.onSoundSignal.next({
                soundId: value
            });
        });

        this._scriptCloudExecutorService.onScriptShowPopup.subscribe(value => {
            this.onPopupSignal.next({
                message: value,
                title: 'Script'
            });
        });
    }
}
