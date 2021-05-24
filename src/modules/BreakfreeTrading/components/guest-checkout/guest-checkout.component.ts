import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';
import { DefaultCheckoutComponent } from '../default-checkout/default-checkout.component';

@Component({
    selector: 'guest-checkout-component',
    templateUrl: './guest-checkout.component.html',
    styleUrls: ['./guest-checkout.component.scss']
})
export class GuestCheckoutComponent extends DefaultCheckoutComponent {
    constructor(protected _identityService: IdentityService) {
        super(_identityService);
    }
}
