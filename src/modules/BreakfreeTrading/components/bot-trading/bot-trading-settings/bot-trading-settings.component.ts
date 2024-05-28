import { Component, Inject, Injector, OnInit } from '@angular/core';
import { Modal } from "Shared";
import { IdentityService, SubscriptionType } from '@app/services/auth/identity.service';
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { AuthenticationService } from '@app/services/auth/auth.service';
import { UserAutoTradingAccountResponse } from '@app/models/auto-trading-bot/models';
import { AlertService } from '@alert/services/alert.service';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { PrivacyPolicyTradingModalComponent } from 'modules/Shared/components/privacy-policy-trading/privacy-policy-trading.component';
import { LiabilityPolicyTradingModalComponent } from 'modules/Shared/components/liability-policy-trading/liability-policy-trading.component';
import { ProfitPolicyTradingModalComponent } from 'modules/Shared/components/profit-policy-trading/profit-policy-trading.component';
import { LinkModalComponent } from '@app/link-modal/link-modal.component';

@Component({
    selector: 'bot-trading-settings',
    templateUrl: './bot-trading-settings.component.html',
    styleUrls: ['./bot-trading-settings.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: BreakfreeTradingTranslateService
        }
    ]
})


export class BotTradingSettingsComponent extends Modal<BotTradingSettingsComponent> implements OnInit {

    public existingAccounts: UserAutoTradingAccountResponse[];
    public accountId: string;
    public loading: boolean = true;
    public policyAccepted: boolean = false;
    // public profitPolicyAccepted: boolean = false;
    public liabilityWaiverAccepted: boolean = false;
    public subscriptionType: SubscriptionType;



    public downloadLink: string = '/assets/NeuralAgent_3.19.ex5?+2';
    public downloadUserDocLink: string = '/assets/NA 3.19 user doc.pdf?+2';
    // public downloadLink2: string = '/assets/NA2_2.0_beta.ex5';
    // public downloadLink3: string = 'https://forms.gle/wSJNCdN1ahYkosmq9';

    public get isAllowed(): boolean {
        // return true;
        return this._identityService.isAuthorizedCustomer;
    }

    constructor(private _injector: Injector,
        private _identityService: IdentityService,
        private _authService: AuthenticationService,
        private _alertService: AlertService,
        protected _dialog: MatDialog,
        @Inject(BreakfreeTradingTranslateService) private _translateService) {
        super(_injector);
    }

    ngOnInit() {
        this._reload();
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    submit() {
        if (!this.isAllowed) {
            this._alertService.info("Subscription required to use auto trading bot");
            return;
        }

        let trimmed = this.accountId.trim();
        this.loading = true;
        this._authService.addMyAutoTradingAccount(trimmed).subscribe((accts) => {
            this._reload();
            this._identityService.updateMyAutoTradingAccount();
        }, (error) => {
            this.loading = false;
            if (error.status === 403 && error.error) {
                this._alertService.error(error.error);
            } else {
                this._alertService.error("Failed to save trading accounts info");
            }
        });
    }

    openModal(link: string) {
        this._dialog.open(LinkModalComponent, {
            data: { link: link },
            width: '80%',
            height: '80%',
        });
    }

    remove(acct: UserAutoTradingAccountResponse) {
        this.loading = true;
        this._authService.removeMyAutoTradingAccount(acct.id).subscribe((accts) => {
            this._reload();
            this._identityService.updateMyAutoTradingAccount();
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed to remove trading accounts info");
        });
    }

    selectDefault(acct: UserAutoTradingAccountResponse) {
        this._identityService.setMyAutoTradingAccount(acct.accountId);
    }

    isActive(acct: UserAutoTradingAccountResponse) {
        return this._identityService.myTradingAccount && this._identityService.myTradingAccount === acct.accountId;
    }

    onClose() {
        this.close();
    }

    canSave() {
        if (!this.policyAccepted || !this.liabilityWaiverAccepted) {
            return false;
        }

        if (!this.accountId) {
            return false;
        }

        let trimmed = this.accountId.trim();
        return trimmed.length >= 4 && trimmed.length <= 16;
    }

    privacyPolicy() {
        this._dialog.open(PrivacyPolicyTradingModalComponent, {
            backdropClass: 'backdrop-background'
        });
    }

    profitPolicy() {
        this._dialog.open(ProfitPolicyTradingModalComponent, {
            backdropClass: 'backdrop-background'
        });
    }

    liabilityWaiver() {
        this._dialog.open(LiabilityPolicyTradingModalComponent, {
            backdropClass: 'backdrop-background'
        });
    }

    private _reload() {
        this.loading = true;
        this._authService.getMyAutoTradingAccount().subscribe((accts) => {
            this.existingAccounts = accts;
            this.loading = false;
        }, (error) => {
            this._alertService.error("Failed to load trading accounts info");
        });
    }
}
