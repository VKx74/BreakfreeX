import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {JsUtil} from "../../../utils/jsUtil";

@Injectable()
export class ProgressBarManager {
    private _currentAttemptId: string;
    show$ = new BehaviorSubject(false);

    constructor() {
    }

    show(): string {
        this.show$.next(true);
        return this._currentAttemptId = JsUtil.generateGUID();
    }

    hide(attemtpId: string) {
        if (attemtpId === this._currentAttemptId) {
            this.show$.next(false);
        }
    }
}