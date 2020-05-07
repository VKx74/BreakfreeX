import {Injectable} from "@angular/core";
import {ApplicationType} from "../enums/ApplicationType";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable()
export class ApplicationTypeService {
    // private _applicationType: ApplicationType;
    applicationTypeChanged = new BehaviorSubject(ApplicationType.All);

    get applicationType() {
        return this.applicationTypeChanged.value;
    }

    constructor() {
        // Todo review
        // this._applicationType = ApplicationType.Crypto;
        // this.setApplicationType(ApplicationType.Crypto);
    }

    setApplicationType(appType: ApplicationType) {
        if (!ApplicationType[appType]) {
            return;
        }

        if (appType && this.applicationType !== appType) {
            // this._applicationType = appType;
            this.applicationTypeChanged.next(appType);
            // this.applicationTypeChanged.next(this._applicationType);
        }
    }
}
