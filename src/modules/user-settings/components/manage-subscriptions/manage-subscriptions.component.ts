import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import bind from "bind-decorator";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {IActivityResolverData} from "../../models/models";
import { ISubscription, PersonalInfoService, IBillingDashboard } from '@app/services/personal-info/personal-info.service';
import { AlertService } from '@alert/services/alert.service';
import { IdentityService } from '@app/services/auth/identity.service';

@Component({
    selector: 'manage-subscriptions',
    templateUrl: './manage-subscriptions.component.html',
    styleUrls: ['./manage-subscriptions.component.scss']
})
export class ManageSubscriptionsComponent implements OnInit {
    @Input() subscriptions: ISubscription[] = null;
    public loading: boolean = false;

    constructor(private _personalInfoService: PersonalInfoService, private _identityService: IdentityService, private _alertService: AlertService) {
    }

    ngOnInit() {
    }

    manageSubscription() {
        this.loading = true;
        this._personalInfoService.getUserBillingDashboard().subscribe((result: IBillingDashboard) => {
            if (result) {
                if (result.url) {
                    window.open(result.url, "_blank");
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

    relogin() {
        this._identityService.signOut().subscribe(success => {
            window.location.reload();
        }, error => {
            console.log(error);
        });
    }
}
