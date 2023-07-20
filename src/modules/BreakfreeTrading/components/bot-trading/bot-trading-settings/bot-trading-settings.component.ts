import { Component, Inject, Injector, OnInit } from '@angular/core';
import { Modal } from "Shared";
import { IdentityService, SubscriptionType } from '@app/services/auth/identity.service';
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';
import { AuthenticationService } from '@app/services/auth/auth.service';
import { UserAutoTradingAccountResponse } from '@app/models/auto-trading-bot/models';
import { AlertService } from '@alert/services/alert.service';

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
    public existingAccount: UserAutoTradingAccountResponse;
    public accountId: string;
    public loading: boolean = true;

    public get isAllowed(): boolean {
        return this._identityService.subscriptionType === SubscriptionType.AI;
    }

    constructor(private _injector: Injector,
        private _identityService: IdentityService,
        private _authService: AuthenticationService,
        private _alertService: AlertService,
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
            this._alertService.info("Neural subscription required to use auto trading bot");
            return;
        }

        let trimmed = this.accountId.trim();
        this.loading = true;
        this._authService.addMyAutoTradingAccount(trimmed).subscribe((accts) => {
            this._reload();
        }, (error) => {
            this._alertService.error("Failed to save trading accounts info");
        });
    }

    remove() {
        this.loading = true;
        this._authService.removeMyAutoTradingAccount(this.existingAccount.id).subscribe((accts) => {
            this._reload();
        }, (error) => {
            this._alertService.error("Failed to remove trading accounts info");
        });
    }

    onClose() {
        this.close();
    }

    canSave() {
        if (!this.accountId) {
            return false;
        }

        let trimmed = this.accountId.trim();
        return trimmed.length >= 4 && trimmed.length <= 16;
    }

    private _reload() {
        this.loading = true;
        this._authService.getMyAutoTradingAccount().subscribe((accts) => {
            this.existingAccounts = accts;
            if (this.existingAccounts && this.existingAccounts.length) {
                this.existingAccount = this.existingAccounts[0];

                if (!this.isAllowed && this.existingAccount) {
                    this.existingAccount.isActive = false;
                }
            } else {
                this.existingAccount = null;
            }
            this.loading = false;
        }, (error) => {
            this._alertService.error("Failed to load trading accounts info");
        });
    }
}
