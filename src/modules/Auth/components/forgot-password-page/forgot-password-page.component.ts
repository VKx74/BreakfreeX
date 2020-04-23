import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {ForgotPasswordModel} from "@app/models/auth/auth.models";
import {AuthRoutes} from "../../auth.routes";
import {UrlsManager} from "@app/Utils/UrlManager";

@Component({
    selector: 'forgot-password-page',
    templateUrl: 'forgot-password-page.component.html',
    styleUrls: ['forgot-password-page.component.scss'],
})
export class ForgotPasswordPageComponent {
    formGroup: FormGroup;
    processing = false;
    serverError: string;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _authService: AuthenticationService) {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email])
        });
    }

    restorePassword() {
        const model: ForgotPasswordModel = {
            email: this.formGroup.controls['email'].value,
            redirectUrl: UrlsManager.restorePasswordRedirectUrl()
        };

        this.processing = true;
        this.serverError = null;

        this._authService.forgotPassword(model).subscribe(
            data => {
                this.processing = false;
                this._router.navigate([AuthRoutes.Login], {
                    relativeTo: this._route.parent,
                    queryParams: {forgot: true}
                });
            },
            error => {
                this.processing = false;
                this.serverError = 'Restoration failed: ' + error.error.description;
            });
    }

    doLogin() {
        this._router.navigate([AuthRoutes.Login], {
            relativeTo: this._route.parent
        });
    }
}
