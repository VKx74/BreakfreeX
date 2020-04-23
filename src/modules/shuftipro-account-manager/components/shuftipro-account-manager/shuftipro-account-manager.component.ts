import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PersonalInfoService, ShuftiproAccountCredentialsModel} from "@app/services/personal-info/personal-info.service";

export interface ShuftiproAccountManagerConfig {
    currentEmail: string;
}

export interface ShuftiproAccountManagerResult {
    newEmail: string;
}

@Component({
    selector: 'shuftipro-account-manager',
    templateUrl: './shuftipro-account-manager.component.html',
    styleUrls: ['./shuftipro-account-manager.component.scss']
})
export class ShuftiproAccountManagerComponent extends Modal<ShuftiproAccountManagerConfig, ShuftiproAccountManagerResult> {
    processing = false;
    formGroup: FormGroup;

    constructor(injector: Injector,
                private _personalInfoService: PersonalInfoService) {
        super(injector);
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();
    }

    submit() {
        this.processing = true;
        const controls = this.formGroup.controls;
        const newAccountCredentials: ShuftiproAccountCredentialsModel = {
            email: controls['email'].value,
            apikey: controls['apikey'].value,
            secret: controls['secret'].value
        };
        this._personalInfoService.changeShuftiproAccount(newAccountCredentials)
            .subscribe(() => {
                this.processing = false;
                this.close({
                    newEmail: newAccountCredentials.email
                });
            }, e => {
                console.log(e);
                this.processing = false;
            });
    }


    private _getFormGroup(): FormGroup {
        return new FormGroup({
            email: new FormControl(this.data.currentEmail, [Validators.required, Validators.email]),
            apikey: new FormControl('', [Validators.required]),
            secret: new FormControl('', [Validators.required])
        });
    }

}
