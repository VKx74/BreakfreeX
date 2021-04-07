import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { AlertRestClient } from "./alert.rest.client";

@Injectable()
export class AlertsService {
    public onAlertTriggered: Subject<string> = new Subject<string>();
    public onAlertShowPopup: Subject<string> = new Subject<string>();
    public onAlertPlaySound: Subject<string> = new Subject<string>();

    constructor (private _alertRestClient: AlertRestClient)
    {
        
    }
}