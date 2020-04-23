import {Component, Injector} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";
import {Modal} from "Shared";
import {forkJoin, Observable} from "rxjs";
import {JsUtil} from "../../../../utils/jsUtil";

export interface IConfirmModalConfig {
    title?: string | Observable<string>;
    message?: string | Observable<string>;
    acceptCaption?: string | Observable<string>;
    rejectCaption?: string | Observable<string>;
    onConfirm?: () => void;
}

@Component({
    selector: 'confirm-modal',
    templateUrl: 'confirm-modal.component.html',
    styleUrls: ['confirm-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class ConfirmModalComponent extends Modal<IConfirmModalConfig> {
    title: string | Observable<string>;
    message: string | Observable<string>;
    acceptCaption: string | Observable<string>;
    rejectCaption: string | Observable<string>;
    onConfirm: () => void;

    constructor(private _translateService: TranslateService,
                injector: Injector) {
        super(injector);
    }

    ngOnInit() {
        const data = Object.assign({}, this.data);
        const observables = [
            data.title ? JsUtil.getAsObservable(data.title) : this._translateService.get('areYouSure'),
            data.acceptCaption ? JsUtil.getAsObservable(data.acceptCaption) : this._translateService.get('yes'),
            data.rejectCaption ? JsUtil.getAsObservable(data.rejectCaption) : this._translateService.get('no'),
            data.message ? JsUtil.getAsObservable(data.message) : JsUtil.getAsObservable(null)
        ];

        this.onConfirm = data.onConfirm ? data.onConfirm : null;

        forkJoin(observables)
            .subscribe((captions: string[]) => {
                this.title = captions[0];
                this.acceptCaption = captions[1];
                this.rejectCaption = captions[2];
                this.message = captions[3];
            });
    }

    accept() {
        if (this.onConfirm) {
            this.onConfirm();
        }
        this.close(true);
    }

    reject() {
        this.close(false);
    }
}
