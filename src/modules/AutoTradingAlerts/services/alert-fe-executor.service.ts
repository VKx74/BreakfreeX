import {Injectable} from "@angular/core";
import {Observable, of, Subject, Subscription} from "rxjs";
import {IAlertCloudExecutorService} from "../models/IAlertCloudExecutorService";
import {EAlertState} from "../models/AlertBase";
import {FEAlertBase} from "../models/FEAlertBase";
import {JsUtil} from "../../../utils/jsUtil";
import {AlertStateEvtData} from "../models/AlertStateEvtData";

@Injectable()
export class AlertFEExecutorService implements IAlertCloudExecutorService {
    protected _subscriptions:  { [id: string]: Subscription; } = {};

    public onAlertStarted: Subject<AlertStateEvtData> = new Subject<AlertStateEvtData>();
    public onAlertStopped: Subject<AlertStateEvtData> = new Subject<AlertStateEvtData>();
    public onAlertFailed: Subject<AlertStateEvtData> = new Subject<AlertStateEvtData>();
    public onAlertTriggered: Subject<string> = new Subject<string>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();

    constructor() {

    }

    public startAlert(alert: FEAlertBase): Observable<any> {
        this._subscriptions[alert.externalId] = alert.onAlertTriggered.subscribe((value: FEAlertBase) => {
            if (!value.isStarted || value.isOnCloud) {
                return;
            }

            if (value.showPopup) {
                this.onAlertShowPopup.next(value.getDescription());
            }

            if (value.playSound) {
                this.onAlertPlaySound.next(value.soundId);
            }

            this.onAlertTriggered.next(value.alertName);

            this.stopAlert(value);
        });

        alert.start();
        alert.setFEExecution();
        const runningId =  JsUtil.generateGUID();
        alert.setState(EAlertState.Started, runningId);
        this.onAlertStarted.next({
            alertName: alert.alertName,
            runningId: runningId
        });
        return of(null);
    }

    public stopAlert(alert: FEAlertBase): Observable<any> {
        if (this._subscriptions[alert.externalId]) {
            this._subscriptions[alert.externalId].unsubscribe();
            this._subscriptions[alert.externalId] = null;
        }

        const runningId = alert.runningId;
        alert.stop();
        alert.setState(EAlertState.Stopped);
        this.onAlertStopped.next({
            alertName: alert.alertName,
            runningId: runningId
        });
        return of(null);
    }

}