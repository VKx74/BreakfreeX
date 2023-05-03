import {Component, ElementRef, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import { IdentityService } from '@app/services/auth/identity.service';
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';
import { DefaultCheckoutComponent } from '../default-checkout/default-checkout.component';
import { Intercom } from 'ng-intercom';

@Component({
    selector: 'guest-checkout-component',
    templateUrl: './guest-checkout.component.html',
    styleUrls: ['./guest-checkout.component.scss']
})
export class GuestCheckoutComponent extends DefaultCheckoutComponent {
    constructor(protected _identityService: IdentityService, protected _localStorageService: LocalStorageService, protected _intercom: Intercom) {
        super(_identityService, _localStorageService, _intercom);
    }
}
