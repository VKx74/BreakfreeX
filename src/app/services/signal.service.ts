import {Injectable} from "@angular/core";
import { AlertsService } from "modules/AutoTradingAlerts/services/alerts.service";
import {Subject} from "rxjs";

export interface PopupSignal {
    title: string;
    message: string;
}

export interface SoundSignal {
    soundId: string;
}

@Injectable()
export class SignalService {

    public onPopupSignal = new Subject<PopupSignal>();
    public onSoundSignal = new Subject<SoundSignal>();

    constructor(private _alertsService: AlertsService) {
        this._alertsService.onAlertTriggered.subscribe(alert => {
           
        });

        this._alertsService.onAlertPlaySound.subscribe(value => {
            this.onSoundSignal.next({
                soundId: value
            });
        });

        this._alertsService.onAlertShowPopup.subscribe(value => {
            this.onPopupSignal.next({
                message: value,
                title: 'Alert'
            });
        });
    }
}
