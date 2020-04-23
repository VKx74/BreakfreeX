import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {RestorePasswordModel} from "@app/models/auth/auth.models";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {passwordsMatchValidator, passwordValidator} from "Validators";
import {AuthRoutes} from "../../auth.routes";
import {CrossFieldErrorMatcher} from "@app/Utils/crossFieldErrorMatcher";

@Component({
    selector: 'new-password-page',
    templateUrl: 'new-password-page.component.html',
    styleUrls: ['new-password-page.component.scss'],
})
export class NewPasswordPageComponent {
    processing = false;
    errorNotification = null;
    email = '';
    token = '';
    errorMatcher = new CrossFieldErrorMatcher();

    formGroup: FormGroup;

    constructor(private _router: Router,
                private _authService: AuthenticationService,
                private _activatedRoute: ActivatedRoute) {

        this.formGroup = new FormGroup({
            password: new FormControl('', [Validators.required, passwordValidator()]),
            confirmPassword: new FormControl('', [Validators.required])
        }, {
            validators: [passwordsMatchValidator('password', 'confirmPassword')]
        });
    }

    ngOnInit() {
        this._activatedRoute.url
            .subscribe(segments => {
                if (segments && segments.length) {
                    const params = segments[0].parameters;

                    if (params['email']) {
                        this.email = params['email'];
                    }

                    if (params['token']) {
                        this.token = params['token'];
                    }
                }
            });
    }

    doPasswordRestoring() {
        const model: RestorePasswordModel = {
            email: this.email,
            password: this.formGroup.controls['password'].value,
            token: this.token,
        };

        this.processing = true;
        this.errorNotification = null;
        this._authService.restorePassword(model).subscribe(
            data => {
                this.processing = false;
                this._router.navigate([AuthRoutes.Login], {
                    relativeTo: this._activatedRoute.parent,
                    queryParams: {passwordChanged: true}
                });
            },
            error => {
                this.processing = false;
                this.errorNotification = 'Restoration failed: ' + error.error;
            });
    }

    doLogin() {
        this._router.navigate([AuthRoutes.Login], {
            relativeTo: this._activatedRoute.parent
        });
    }
}
