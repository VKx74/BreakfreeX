import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import { IdentityService, SubscriptionType } from '@app/services/auth/identity.service';
import { AppConfigService } from '@app/services/app.config.service';
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { AttachPhoneNumberModel, PersonalInfoService, SendCodeViaSMSToAttachPhoneNumberModel } from '@app/services/personal-info/personal-info.service';
import { AlertService } from '@alert/services/alert.service';

enum CheckoutTab {
    Monthly,
    Month3,
    Month12
}

@Component({
    templateUrl: './phoneNumberPopUp.component.html',
    styleUrls: ['./phoneNumberPopUp.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: BreakfreeTradingTranslateService
        }
    ]
})
export class PhoneNumberPopUpComponent extends Modal<PhoneNumberPopUpComponent> implements OnInit {
    public phoneNumber: string;
    public verificationCode: string;

    public showVerification = false;
    public loading = false;

    constructor(private _injector: Injector, private _identityService: IdentityService, 
        private _personalInfoService: PersonalInfoService, private _alertService: AlertService,
        @Inject(BreakfreeTradingTranslateService) private _translateService) {
        super(_injector);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    continueFree() {
        this.close();
    }

    handleAddPhoneNumberButtonClick() {
        this.loading = true;
        const sendCodeViaSMSToAttachPhoneNumberModel: SendCodeViaSMSToAttachPhoneNumberModel = {
            email: this._identityService.email,
            phoneNumber: this.phoneNumber,
            isFreeTrial: this._identityService.subscriptionType === SubscriptionType.Trial
        };
        this._personalInfoService.sendCodeViaSMSToAttachPhoneNumber(sendCodeViaSMSToAttachPhoneNumberModel)
            .subscribe(() => {
                this._alertService.info(this._translateService.get('verificationCodeSent'));
                this.loading = false;
                this.showVerification = true;
            }, e => {
                if (e.error && e.error.description) {
                    this._alertService.error(e.error.description);
                } else {
                    this._alertService.error(this._translateService.get('verificationCodeNotSent'));
                }

                this.loading = false;
                console.log(e);
            });
    }

    handleVerifyCodeButtonClick() {
        this.loading = true;
        const attachPhoneNumberModel: AttachPhoneNumberModel = {
            code: this.verificationCode,
            email: this._identityService.email,
            phone: this.phoneNumber
        };
        this._personalInfoService.attachPhoneNumber(attachPhoneNumberModel)
            .subscribe(() => {
                this._alertService.success(this._translateService.get('phoneAdded'));
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }, e => {
                this._alertService.error(this._translateService.get('failedAddPhone'));
                this.loading = false;
                console.log(e);
            });
    }
}
