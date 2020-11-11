import {Component} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
@Component({
    selector: 'success-checkout-page',
    templateUrl: 'success-checkout-page.component.html',
    styleUrls: ['success-checkout-page.component.scss']
})
export class SuccessCheckoutPageComponent {
    private timeout: any;
   
    constructor(private _identity: IdentityService) {
    }

    ngOnInit() {
        // this._identity.signOutSilently().subscribe();
        // this.timeout = setTimeout(() => {
        //     window.location.href = "/";
        // }, 15 * 1000);
    }

    ngOnDestroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    backToPlatform() {
        window.location.href = "/";
    }
}
