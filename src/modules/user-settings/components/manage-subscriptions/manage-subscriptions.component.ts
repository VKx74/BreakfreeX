import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import { ISubscription, PersonalInfoService, IBillingDashboard, IPaymentAccount } from '@app/services/personal-info/personal-info.service';
import { AlertService } from '@alert/services/alert.service';
import { IdentityService } from '@app/services/auth/identity.service';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";

@Component({
    selector: 'manage-subscriptions',
    templateUrl: './manage-subscriptions.component.html',
    styleUrls: ['./manage-subscriptions.component.scss']
})
export class ManageSubscriptionsComponent implements OnInit {
    @Input() subscriptions: ISubscription[] = null;
    @Input() accounts: IPaymentAccount[] = null;
    public loading: boolean = false;

    public get IsLifetime(): boolean {
        return this._identityService.isLifetimeAccess;
    }

    constructor(private _personalInfoService: PersonalInfoService, private _dialog: MatDialog, private _identityService: IdentityService, private _alertService: AlertService) {
    }

    ngOnInit() {
    }

    cancelSubscription(sub: ISubscription) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
              message: `Cancel subscription "${sub.name}"?`,
              onConfirm: () => {
                this.loading = true;
                this._personalInfoService.cancelNowPaymentsSubscription(sub.id).subscribe(() => {
                    this._alertService.info("Subscription canceled");    
                    this.loading = false;
                }, (error) => {
                    this._alertService.error("Failed to cancel subscription");
                    this.loading = false;
                });
              }
            }
          });
    }

    manageSubscription(id: string) {
        this.loading = true;
        this._personalInfoService.getUserBillingDashboard(id).subscribe((result: IBillingDashboard) => {
            if (result) {
                if (result.url) {
                    let popUp = window.open(result.url, "_blank");
                    if (!popUp || popUp.closed || typeof popUp.closed === 'undefined') { 
                        // POPUP BLOCKED
                        window.location.assign(result.url);
                    }
                } else {
                    this._alertService.info("Subscriptions not found for current user");    
                }
            } else {
                this._alertService.info("Subscriptions not found for current user");    
            }
            this.loading = false;
        }, (error) => {
            this._alertService.error("Failed to get subscription details");
            this.loading = false;
        });
    }

    getSubscriptions(account: IPaymentAccount): ISubscription[] {
        if (!this.subscriptions) {
            return null;
        }

        const res: ISubscription[] = [];

        for (const subscriptionId of account.subscriptions) {
            for (const sub of this.subscriptions) {
                if (sub.id === subscriptionId) {
                    res.push(sub);
                }
            }
        }

        return res;
    }

    relogin() {
        this._identityService.signOut().subscribe(success => {
            window.location.reload();
        }, error => {
            console.log(error);
        });
    }
}
