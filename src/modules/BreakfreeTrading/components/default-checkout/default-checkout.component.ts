import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';
import { AppConfigService } from '@app/services/app.config.service';
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';

enum CheckoutTab {
    Monthly,
    Month3,
    Month12
}

@Component({
    selector: 'default-checkout-component',
    templateUrl: './default-checkout.component.html',
    styleUrls: ['./default-checkout.component.scss']
})
export class DefaultCheckoutComponent implements OnInit {
    public SelectedTab: CheckoutTab = CheckoutTab.Monthly;
    public CheckoutTab: any = CheckoutTab;

    constructor(protected _identityService: IdentityService, protected _localStorageService: LocalStorageService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    guestStartFreeNow() {
        this._localStorageService.setGuest();
        window.location.href = "/#/auth/registration";
        window.location.reload();
    }

    checkoutDiscovery1M() {
        this.checkout("subscription_plan_246666");
    }

    checkoutDiscovery3M() {
        this.checkout("subscription_plan_200729");
    }

    checkoutDiscovery12M() {
        this.checkout("subscription_plan_212126");
    }

    checkoutPro1M() {
        this.checkout("subscription_plan_206914");
    }

    checkoutPro3M() {
        this.checkout("subscription_plan_200724");
    }

    checkoutPro12M() {
        this.checkout("subscription_plan_251974");
    }

    checkoutPro1MNonTrial() {
        this.checkout("subscription_plan_183584");
    }

    checkoutDiscovery1MNonTrial() {
        this.checkout("subscription_plan_192806");
    }

    checkout(subscription_id: string) {
        const redirectUrl = AppConfigService.config.apiUrls.successCheckoutRedirect;
        console.log(redirectUrl);
        (window as any).stripe.redirectToCheckout({
            lineItems: [{price: subscription_id, quantity: 1}],
            mode: 'subscription',
            successUrl: redirectUrl + "?sub=" + subscription_id + "&session_id={CHECKOUT_SESSION_ID}",
            cancelUrl: window.location.origin,
            customerEmail: this._identityService.email || ""
          })
          .then(function (result) {
           
          });
    }

    monthlyClicked() {
        this.SelectedTab = CheckoutTab.Monthly;
    }

    month3Clicked() {
        this.SelectedTab = CheckoutTab.Month3;
    }

    month12Clicked() {
        this.SelectedTab = CheckoutTab.Month12;
    }
}
