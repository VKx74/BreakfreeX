import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';
import { AppConfigService } from '@app/services/app.config.service';
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';
import { Intercom } from 'ng-intercom';

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

    constructor(protected _identityService: IdentityService, protected _localStorageService: LocalStorageService, protected _intercom: Intercom) {
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

    checkoutStarter1M() {
        this.checkout("price_1JG3FNBI1GhkUGQt0OL7FuIC");
    }

    checkoutStarter3M() {
        this.checkout("price_1JFWNBBI1GhkUGQtPG8qjP7m");
    }

    checkoutStarter12M() {
        this.checkout("price_1JFWOBBI1GhkUGQtY0uhaBYi");
    }

    checkoutDiscovery1M() {
        this.checkout("subscription_plan_246666");
        // window.open("https://checkout.breakfreetrading.com/products/breakfree-trading-disovery-1-month-access", '_blank').focus();
    }

    checkoutDiscovery3M() {
        this.checkout("subscription_plan_200729");
    }

    checkoutDiscovery12M() {
        this.checkout("subscription_plan_212126");
    }

    checkoutPro1M() {
        // window.open("https://checkout.breakfreetrading.com/products/breakfree-trading-pro-1-month-access", '_blank').focus();
        this.checkout("price_1Jr22xBI1GhkUGQthrKBOAzq");
        // this.checkout("subscription_plan_206914");
    }

    checkoutPro3M() {
        this.checkout("price_1Jr24ZBI1GhkUGQtGjsmg2Jk");
        // this.checkout("subscription_plan_200724");
    }

    checkoutPro12M() {
        this.checkout("price_1Jr25GBI1GhkUGQtB1lKwVhy");
        // this.checkout("subscription_plan_251974");
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

    checkoutStarter1MNonTrial() {
        this.checkout("price_1JFWJpBI1GhkUGQt0DQyHJvw");
    }

    checkoutPro1MNonTrial() {
        this.checkout("price_1Jr2J4BI1GhkUGQtY9aGGAdF");
        // this.checkout("subscription_plan_183584");
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
            customerEmail: this._identityService.email || "",
            clientReferenceId: this.getClientReferenceId()
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

    showSupport() {
        this._intercom.show();
    }

    private getClientReferenceId() {
        return (window as any).Rewardful && (window as any).Rewardful.referral || ('checkout_' + (new Date).getTime());
    }
}
