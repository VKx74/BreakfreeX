import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {Restore2FactorAuthRequest} from "@app/models/auth/auth.models";
import {UrlsManager} from "@app/Utils/UrlManager";
import {AuthRoutes} from "../../auth.routes";

interface Notification {
    isError: boolean;
    message: string;
}

@Component({
    selector: 'reset-two-step-auth',
    templateUrl: './reset-two-step-auth.component.html',
    styleUrls: ['./reset-two-step-auth.component.scss']
})
export class ResetTwoStepAuthComponent {
    formGroup: FormGroup;
    processing = false;
    notification: Notification;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _authService: AuthenticationService) {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email])
        });
    }

    reset() {
        const email = this.formGroup.controls['email'].value;
        const model: Restore2FactorAuthRequest = {
            email: email,
            redirectUrl: UrlsManager.restore2FactorAuthRedirectUrl(email)
        };

        this.processing = true;
        this.notification = null;

        this._authService.restore2FactorAuth(model).subscribe(
            data => {
                this.notification = {
                    isError: false,
                    message: 'Verification link is sent on your email. Please confirm that you want to reset two step auth.'
                };
            },
            error => {
                this.processing = false;
                this.notification = {
                    isError: true,
                    message: 'Reset failed: ' + error.error.description
                };
            });
    }

    doLogin() {
        this._router.navigate([AuthRoutes.Login], {
            relativeTo: this._route.parent
        });
    }
}
