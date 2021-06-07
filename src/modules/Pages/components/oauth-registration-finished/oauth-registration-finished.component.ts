import {Component} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {first} from 'rxjs/operators';
import {IdentityService} from "@app/services/auth/identity.service";
import {AppRoutes} from "AppRoutes";
import { Angulartics2Facebook } from "angulartics2/facebook";
import { FBPixelTrackingService } from "@app/services/traking/fb.pixel.tracking.service";
import { AuthRoutes } from "modules/Auth/auth.routes";
import { GTMTrackingService } from "@app/services/traking/gtm.tracking.service";

@Component({
    selector: 'oauth-registration-finished-page',
    templateUrl: 'oauth-registration-finished.component.html',
    styleUrls: ['oauth-registration-finished.component.scss']
})
export class OAuthRegistrationFinishedComponent {

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _angulartics2Facebook: Angulartics2Facebook,
                private _fbPixelTrackingService: FBPixelTrackingService,
                private _gtmTrackingService: GTMTrackingService) {
    }

    ngOnInit() {
        this._fbPixelTrackingService.load();
        this._gtmTrackingService.processRegistration("/oauth-registration-finished");
        this._angulartics2Facebook.eventTrack("CompleteRegistration", {currency: "USD", value: 0});

        setTimeout(() => {
            this._router.navigate([AppRoutes.Platform], {
                relativeTo: this._route.root
            });
        }, 5000);
    }
}
