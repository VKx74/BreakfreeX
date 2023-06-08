import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';
import { AppConfigService } from '@app/services/app.config.service';
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'neural-checkout-component',
    templateUrl: './neural-checkout.component.html',
    styleUrls: ['./neural-checkout.component.scss']
})
export class NeuralCheckoutComponent implements OnInit {

    constructor(protected _identityService: IdentityService, protected _localStorageService: LocalStorageService, protected _intercom: Intercom) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
    
    checkoutML1M() {
        this.checkout("price_1N2Xq3BI1GhkUGQtQDnZBWIs");
    }

    checkoutML3M() {
        this.checkout("price_1N2XtNBI1GhkUGQtGZhftPcU");
    }

    checkoutML12M() {
        this.checkout("price_1N2XsKBI1GhkUGQtf2U6H5Hw");
    }

    checkout(subscription_id: string) {
        const redirectUrl = AppConfigService.config.apiUrls.successCheckoutRedirect;
        console.log(redirectUrl);
        (window as any).stripe.redirectToCheckout({
            lineItems: [{price: subscription_id, quantity: 1}],
            mode: 'subscription',
            successUrl: redirectUrl + "?sub=" + subscription_id + "&session_id={CHECKOUT_SESSION_ID}",
            cancelUrl: window.location.origin,
            customerEmail: this._identityService.email || "",
            clientReferenceId: this.getClientReferenceId()
          })
          .then(function (result) {
           
          });
    }

    showSupport() {
        this._intercom.show();
    }

    private getClientReferenceId() {
        return (window as any).Rewardful && (window as any).Rewardful.referral || ('checkout_' + (new Date).getTime());
    }
}
