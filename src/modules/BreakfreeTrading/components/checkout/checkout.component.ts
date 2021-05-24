import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import { IdentityService } from '@app/services/auth/identity.service';
import { AppConfigService } from '@app/services/app.config.service';

enum CheckoutType {
    Default,
    Guest
}

@Component({
    selector: 'checkout-component',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent extends Modal<CheckoutComponent> implements OnInit {
    CheckoutType = CheckoutType;

    public selectedCheckoutType: CheckoutType = CheckoutType.Default;
    constructor(protected _injector: Injector, protected _identityService: IdentityService) {
        super(_injector);

        if (_identityService.isGuestMode) {
            this.selectedCheckoutType = CheckoutType.Guest;
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
