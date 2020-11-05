import {Component} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {first} from 'rxjs/operators';
import {IdentityService} from "@app/services/auth/identity.service";
import {AppRoutes} from "AppRoutes";

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
                private _activatedRoute: ActivatedRoute) {
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
        if (this.provider || !this.code) {
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
                        this._router.navigate([AppRoutes.Platform], {
                            relativeTo: this._route.root
                        });
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
