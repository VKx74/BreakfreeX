import {Component, Injector, OnInit} from '@angular/core';
import {AbstractControlOptions, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Modal} from "Shared";
import {forkJoin, Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {JsUtil} from "../../../../utils/jsUtil";
import {UITranslateService} from "../../localization/token";

export interface IInputModalConfig {
    value?: string | number;
    title?: string | Observable<string>;
    inputCaption?: string | Observable<string>;
    inputPlaceholder?: string | Observable<string>;
    buttonCaption?: string | Observable<string>;
    errorText?: string | Observable<string>;
    validators?: ValidatorFn | ValidatorFn[] | AbstractControlOptions;
    submitHandler?: (value: string) => Observable<boolean>; // close modal
    modalClass?: string;
}

@Component({
    selector: 'input-modal',
    templateUrl: './input-modal.component.html',
    styleUrls: ['./input-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class InputModalComponent extends Modal<IInputModalConfig> implements OnInit {
    public title?: string | Observable<string>;
    public inputCaption?: string | Observable<string>;
    public inputPlaceholder?: string | Observable<string>;
    public buttonCaption?: string | Observable<string>;
    public errorText?: string | Observable<string>;
    public formGroup: FormGroup;
    processingSubmit: boolean = false;

    constructor(private _translateService: TranslateService,
                injector: Injector) {
        super(injector);
    }

    public ngOnInit() {
        const data = Object.assign({}, this.data);

        this.formGroup = new FormGroup({
            value: new FormControl(data.value || '', data.validators || [Validators.required, Validators.minLength(3), Validators.maxLength(255)]),
        });

        const observables = [
            data.title ? JsUtil.getAsObservable(data.title) : this._translateService.get('inputModal.title'),
            data.inputCaption ? JsUtil.getAsObservable(data.inputCaption) : this._translateService.get('inputModal.inputCaption'),
            data.buttonCaption ? JsUtil.getAsObservable(data.buttonCaption) : this._translateService.get('inputModal.buttonCaption'),
            data.inputPlaceholder ? JsUtil.getAsObservable(data.inputPlaceholder) : this._translateService.get('inputModal.inputPlaceholder'),
            data.errorText ? JsUtil.getAsObservable(data.errorText) : this._translateService.get('inputModal.errorText'),
        ];

        forkJoin(observables)
            .subscribe((captions: string[]) => {
                this.title = captions[0];
                this.inputCaption = captions[1];
                this.buttonCaption = captions[2];
                this.inputPlaceholder = captions[3];
                this.errorText = captions[4];
            });
    }

    public reject() {
        this.close();
    }

    public enterValue() {
        if (this.processingSubmit) {
            return;
        }

        const value = this.formGroup.value.value;

        if (this.formGroup.valid) {
            if (this.data.submitHandler) {
                this.processingSubmit = true;
                this.data.submitHandler(value)
                    .subscribe((closeModal: boolean = true) => {
                        this.processingSubmit = false;

                        if (closeModal) {
                            this.close(value);
                        }
                    });

                return;
            }


            this.close(this.formGroup.value.value);
        }
    }
}
