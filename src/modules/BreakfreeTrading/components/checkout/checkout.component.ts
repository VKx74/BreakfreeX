import {Component, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import {ThemeService} from "@app/services/theme.service";
import {LocalizationService} from "Localization";
import {LayoutTranslateService} from "@layout/localization/token";
import {TranslateService} from "@ngx-translate/core";
import {InstrumentService} from "@app/services/instrument.service";
import {RealtimeService} from "@app/services/realtime.service";
import {HistoryService} from "@app/services/history.service";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {ActivatedRoute} from "@angular/router";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {GoldenLayoutPopupComponent} from "angular-golden-layout";
import { IdentityService } from '@app/services/auth/identity.service';

@Component({
    selector: 'checkout-component',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent extends Modal<CheckoutComponent> implements OnInit {

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
}
