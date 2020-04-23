import {Observable, Subject} from "rxjs";
import {AlertBase} from "./AlertBase";
import {AlertStateEvtData} from "./AlertStateEvtData";

export interface IAlertCloudExecutorService {
    onAlertStarted: Subject<AlertStateEvtData>;
    onAlertStopped: Subject<AlertStateEvtData>;
    onAlertFailed: Subject<AlertStateEvtData>;
    onAlertTriggered: Subject<string>;

    startAlert(alert: AlertBase): Observable<any>;

    stopAlert(alert: AlertBase): Observable<any>;
}