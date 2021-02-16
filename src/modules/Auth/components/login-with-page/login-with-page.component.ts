import {Component} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {first} from 'rxjs/operators';
import {IdentityService} from "@app/services/auth/identity.service";
import {AppRoutes} from "AppRoutes";
import { Angulartics2Facebook } from "angulartics2/facebook";
import { FBPixelTrackingService } from "@app/services/traking/fb.pixel.tracking.service";

@Component({
    selector: 'login-with-page',
    templateUrl: 'login-with-page.component.html',
    styleUrls: ['login-with-page.component.scss']
})
export class LoginWithPageComponent {
    private provider: string;
    private code: string;

    constructor(private _identity: IdentityService,
                private _router: Router,
                private _route: ActivatedRoute,
                private _activatedRoute: ActivatedRoute,
                private _angulartics2Facebook: Angulartics2Facebook,
                private _fbPixelTrackingService: FBPixelTrackingService) {
    }

    ngOnInit() {
        this._activatedRoute.queryParams
            .pipe(first())
            .subscribe(params => {
                if (params['provider'] && params['code']) {
                    this.provider = params['provider'];
                    this.code = params['code'];
                }

                this.doLogin();
            });
    }

    doLogin() {
        if (this.provider && !this.code) {
            this._router.navigate([AppRoutes.Auth], {
                relativeTo: this._route.root
            });
            return;
        }

        this._identity.signInWithThirdPartyProvider({
            authCode: this.code,
            authProvider: this.provider
        }).subscribe({
                next: (value) => {
                    if (value) {
                        if (value.isUserCreated) {
                            this._fbPixelTrackingService.load();
                            this._angulartics2Facebook.eventTrack("CompleteRegistration");
                        }
                        
                        setTimeout(() => {
                            this._router.navigate([AppRoutes.Platform], {
                                relativeTo: this._route.root
                            });
                        }, value.isUserCreated ? 3 * 1000 : 1);

                    } else {
                        this._router.navigate([AppRoutes.Auth], {
                            relativeTo: this._route.root
                        });
                    }
                },
                error: (error) => {
                    this._router.navigate([AppRoutes.Auth], {
                        relativeTo: this._route.root
                    });
                }
            });
    }
}
