import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import { IdentityService } from '@app/services/auth/identity.service';

enum CheckoutTab {
    Monthly,
    Month3,
    Month12
}

@Component({
    selector: 'checkout-component',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent extends Modal<CheckoutComponent> implements OnInit {
    public SelectedTab: CheckoutTab = CheckoutTab.Monthly;
    public CheckoutTab: any = CheckoutTab;

    constructor(private _injector: Injector, private _identityService: IdentityService) {
        super(_injector);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
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

    checkout(subscription_id: string) {
        (window as any).stripe.redirectToCheckout({
            lineItems: [{price: subscription_id, quantity: 1}],
            mode: 'subscription',
            successUrl: window.location.origin + "/#/pages/success-checkout",
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
