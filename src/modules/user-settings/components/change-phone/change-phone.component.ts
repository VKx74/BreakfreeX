import { Component, EventEmitter, Inject, Injector, Input, OnInit, Output } from '@angular/core';
import {
    SendCodeViaSMSToAttachPhoneNumberModel,
    PersonalInfoService,
    AttachPhoneNumberModel,
    SendCodeViaSMSToRemovePhoneNumberModel,
    SendCodeViaSMSToChangePhoneNumberModel,
    RemovePhoneNumberModel, ChangePhoneNumberModel
} from "@app/services/personal-info/personal-info.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AlertService } from "@alert/services/alert.service";
import { TranslateService } from "@ngx-translate/core";
import { digitValidator, phoneNumberValidator } from "Validators";
import { AppTranslateService } from "@app/localization/token";
import { OrderBookTranslateService } from "@order-book/localization/token";
import { IdentityService, SubscriptionType } from '@app/services/auth/identity.service';
import { SettingsStorageService } from '@app/services/settings-storage.servic';

enum ChangePhoneNumberStage {
    None,
    Add,
    Change,
    Remove,
}

@Component({
    selector: 'change-phone',
    templateUrl: './change-phone.component.html',
    styleUrls: ['./change-phone.component.scss'],
})
export class ChangePhoneComponent implements OnInit {
    _useTradeGuard = false;
    _activeTradingFeedback = false;
    loading = false;
    phoneNumberStep: ChangePhoneNumberStage = ChangePhoneNumberStage.None;
    isVerifyingCode = false;
    phone: string;

    formGroup: FormGroup;

    @Input() email: string;
    @Input() set phoneNumber(phone: string) {
        this.phone = phone;
        this.formGroup = this._getFormGroup();
    }

    @Output() onPhoneNumberUpdated = new EventEmitter<() => void>();

    get ChangePhoneNumberStep() {
        return ChangePhoneNumberStage;
    }

    get subscriptionExists() {
        return this._identity.isAuthorizedCustomer;
    }

    get useTradeGuard() {
        return this._useTradeGuard;
    }

    set useTradeGuard(value: boolean) {
        this._useTradeGuard = value;
        this._setUseTradeGuard();
    }

    get activeTradingFeedback() {
        return this._activeTradingFeedback;
    }

    set activeTradingFeedback(value: boolean) {
        this._activeTradingFeedback = value;
        this._setActiveTradingFeedback();
    }

    constructor(private _personalInfoService: PersonalInfoService,
        private _identity: IdentityService,
        private _alertService: AlertService,
        private _settingsStorageService: SettingsStorageService,
        @Inject(AppTranslateService) private _appTranslateService
    ) {
        _settingsStorageService.getSettings().subscribe((_) => {
            this._activeTradingFeedback = _.ActiveTradingFeedback;
            this._useTradeGuard = _.UseTradeGuard;
        });
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();
    }

    close() {
        this.phoneNumberStep = ChangePhoneNumberStage.None;
    }

    toggleChangeNumber() {
        if (this.phoneNumberStep === ChangePhoneNumberStage.None) {
            this.phoneNumberStep = ChangePhoneNumberStage.Change;
            this.formGroup.controls['phone'].enable();
        } else {
            this.phoneNumberStep = ChangePhoneNumberStage.None;
            this.isVerifyingCode = false;
            this.formGroup = this._getFormGroup();
        }
    }

    handleAddPhoneNumberButtonClick() {
        this.loading = true;
        const sendCodeViaSMSToAttachPhoneNumberModel: SendCodeViaSMSToAttachPhoneNumberModel = {
            email: this.email,
            phoneNumber: this.formGroup.controls['addPhone'].value,
            isFreeTrial: this._identity.subscriptionType === SubscriptionType.Trial
        };
        this._personalInfoService.sendCodeViaSMSToAttachPhoneNumber(sendCodeViaSMSToAttachPhoneNumberModel)
            .subscribe(() => {
                this._alertService.info(this._appTranslateService.get('verificationCodeSent'));
                this.loading = false;
                this.isVerifyingCode = true;
            }, e => {
                this._alertService.error(this._appTranslateService.get('verificationCodeNotSent'));
                this.loading = false;
                console.log(e);
            });
    }

    handleChangePhoneNumberButtonClick() {
        this.loading = true;
        const sendCodeViaSMSToChangePhoneNumberModel: SendCodeViaSMSToChangePhoneNumberModel = {
            email: this.email,
            currentPhoneNumber: this.phone,
            newPhoneNumber: this.formGroup.controls['phone'].value,
            viaSms: true
        };
        this._personalInfoService.sendCodeViaSMSToChangePhoneNumber(sendCodeViaSMSToChangePhoneNumberModel)
            .subscribe(() => {
                this._alertService.info(this._appTranslateService.get('verificationCodeSent'));
                this.loading = false;
                this.isVerifyingCode = true;
                this.formGroup.controls['phone'].disable();
            }, e => {
                this._alertService.error(this._appTranslateService.get('verificationCodeNotSent'));
                this.loading = false;
                console.log(e);
            });
    }

    handleRemovePhoneNumberButtonClick() {
        this.phoneNumberStep = ChangePhoneNumberStage.Remove;
        this.loading = true;
        const sendCodeViaSMSToRemovePhoneNumberModel: SendCodeViaSMSToRemovePhoneNumberModel = {
            email: this.email,
            phoneNumber: this.phone,
            viaSms: true
        };
        this._personalInfoService.sendCodeViaSMSToRemovePhoneNumber(sendCodeViaSMSToRemovePhoneNumberModel)
            .subscribe(() => {
                this._alertService.info(this._appTranslateService.get('verificationCodeSent'));
                this.loading = false;
                this.isVerifyingCode = true;
            }, e => {
                this._alertService.error(this._appTranslateService.get('verificationCodeNotSent'));
                this.loading = false;
                console.log(e);
            });
    }

    handleVerifyCodeButtonClick() {
        switch (this.phoneNumberStep) {
            case ChangePhoneNumberStage.Add: {
                this._addPhone();
                break;
            }
            case ChangePhoneNumberStage.Remove: {
                this._removePhone();
                break;
            }
            case ChangePhoneNumberStage.Change: {
                this._changePhone();
                break;
            }
        }
    }

    private _setActiveTradingFeedback() {
        this._settingsStorageService.updateActiveTradingFeedback(this._activeTradingFeedback).subscribe();
    }

    private _setUseTradeGuard() {
        this._settingsStorageService.updateUseTradeGuard(this._useTradeGuard).subscribe();
    }

    private _removePhone() {
        this.loading = true;
        const removePhoneNumberModel: RemovePhoneNumberModel = {
            email: this.email,
            code: this.formGroup.controls['code'].value
        };
        this._personalInfoService.removePhoneNumber(removePhoneNumberModel)
            .subscribe(() => {
                this.onPhoneNumberUpdated.emit(() => {
                    this._alertService.success(this._appTranslateService.get('phoneRemoved'));
                    this.loading = false;
                    this.toggleChangeNumber();
                });
            }, e => {
                this._alertService.error(this._appTranslateService.get('failedRemovePhone'));
                this.loading = false;
                console.log(e);
            });
    }

    private _addPhone() {
        this.loading = true;
        const attachPhoneNumberModel: AttachPhoneNumberModel = {
            code: this.formGroup.controls['code'].value,
            email: this.email,
            phone: this.formGroup.controls['addPhone'].value
        };
        this._personalInfoService.attachPhoneNumber(attachPhoneNumberModel)
            .subscribe(() => {
                this.onPhoneNumberUpdated.emit(() => {
                    this._alertService.success(this._appTranslateService.get('phoneAdded'));
                    this.loading = false;
                    this.toggleChangeNumber();
                });
            }, e => {
                this._alertService.error(this._appTranslateService.get('failedAddPhone'));
                this.loading = false;
                console.log(e);
            });
    }

    private _changePhone() {
        this.loading = true;
        const changePhoneNumberModel: ChangePhoneNumberModel = {
            email: this.email,
            code: this.formGroup.controls['code'].value,
            phoneNumber: this.formGroup.controls['phone'].value
        };
        this._personalInfoService.changePhoneNumber(changePhoneNumberModel)
            .subscribe(() => {
                this.onPhoneNumberUpdated.emit(() => {
                    this._alertService.success(this._appTranslateService.get('phoneChanged'));
                    this.loading = false;
                    this.toggleChangeNumber();
                });
            }, e => {
                this._alertService.error(this._appTranslateService.get('failedChangePhone'));
                this.loading = false;
                console.log(e);
            });
    }

    private _getFormGroup(): FormGroup {
        return new FormGroup({
            phone: new FormControl({ value: this.phone, disabled: true }, [Validators.required, phoneNumberValidator(), Validators.minLength(10)]),
            addPhone: new FormControl('', [Validators.required, phoneNumberValidator(), Validators.minLength(10)]),
            code: new FormControl('', [Validators.required, Validators.minLength(6)]),
        });
    }

}
