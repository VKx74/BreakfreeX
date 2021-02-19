import {Component} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {first} from 'rxjs/operators';
import {EAuthErrorStatus, ReconfirmEmailModel} from "@app/models/auth/auth.models";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {AuthRoutes} from "../../auth.routes";
import {UrlsManager} from "@app/Utils/UrlManager";
import {SignInRequestModel} from "@app/models/auth/auth.models";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {AccountType} from "../../models/models";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {concat} from "@decorators/concat";
import {Subscription} from "rxjs";
import {AppRoutes} from "AppRoutes";
import { SessionStorageService } from 'Storage';
import { Angulartics2Facebook } from "angulartics2/facebook";
import { FBPixelTrackingService } from "@app/services/traking/fb.pixel.tracking.service";
import { GTMTrackingService } from "@app/services/traking/gtm.tracking.service";

export interface IRecaptchaConfig {
    siteKey: string;
    useGlobalDomain: boolean;
    size: 'compact' | 'normal';
    language: string;
    theme: 'light' | 'dark';
}

const CaptchaSiteKey: string = '6LdjZO8UAAAAAHGv_NDMGFokppoHHFQwAUlMkOjt';
const CaptchaSecretKey: string = '6LdjZO8UAAAAAJ0mbMNvaI6TkWPv4BBTiz9B9F9O';

interface Notification {
    isError: boolean;
    message: string;
}

@Component({
    selector: 'login-page',
    templateUrl: 'login-page.component.html',
    styleUrls: ['login-page.component.scss']
})
export class LoginPageComponent {
    processing = false;
    notification: Notification;
    showReconfirmButton: boolean = false;
    showFillInfoButton: boolean = false;
    pwd: string;
    email: string;
    sessionStorageKey1: string = "Asfskdjfu43fa";
    sessionStorageKey2: string = "Asfskdjfu43fb";

    readonly RecaptchaConfig: IRecaptchaConfig = {
        language: 'en',
        size: 'normal',
        theme: 'light',
        useGlobalDomain: false,
        siteKey: CaptchaSiteKey
    };

    formGroup: FormGroup;

    get loginBtnEnabled(): boolean {
        return this.formGroup.valid && !this.processing;
    }

    resendConfirmHandler: () => Subscription;
    fillPersonalInfoHandler: () => Subscription;


    constructor(private _authService: AuthenticationService,
                private _identity: IdentityService,
                private _personalInfoService: PersonalInfoService,
                private _router: Router,
                private _route: ActivatedRoute,
                private _sessionStorage: SessionStorageService,
                private _activatedRoute: ActivatedRoute,
                private _angulartics2Facebook: Angulartics2Facebook,
                private _fbPixelTrackingService: FBPixelTrackingService,
                private _gtmTrackingService: GTMTrackingService) {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(25)
            ]),
            captcha: new FormControl(null, [/*Validators.required*/]),
            pin: new FormControl(''),
            rememberMe: new FormControl(false, [])
        });

        this._activatedRoute.queryParams
            .pipe(first())
            .subscribe(params => {
                this.notification = this._getNotification(params);

                if (params['email'] && params['confirmed'] && params['confirmed'] === 'True') {
                    this.formGroup.controls['email'].setValue(params['email']);

                    this._fbPixelTrackingService.load();
                    this._gtmTrackingService.load();
                    this._angulartics2Facebook.eventTrack("CompleteRegistration", {currency: "USD", value: 0});
                }
            });
    }

    doLoginWithGoogle() {
        this._clearNotifications();
        window.location.href = this._authService.signInWithGoogleEndpoint;
    }

    doLoginWithFB() {
        this._clearNotifications();
        window.location.href = this._authService.signInWithFBEndpoint;
    }

    doLogin() {
        if (this.formGroup.invalid || this.processing) {
            return;
        }

        // if (!this.formGroup.controls['captcha'].value) {
        //     this.notification = {
        //         isError: true,
        //         message: 'CAPTCHA is required'
        //     };
        //     return;
        // }

        this._clearNotifications();

        const model = this._getFormData();
        this.pwd = model.password;
        this.email = model.email;

        this._identity.signIn(model)
            .subscribe({
                next: (value) => {
                    if (value) {
                        this._router.navigate([AppRoutes.Platform], {
                            relativeTo: this._route.root
                        });
                    } else {
                        this.notification = {
                            isError: true,
                            message: 'Authorization failed'
                        };

                        this.processing = false;
                    }
                },
                error: (error) => {
                    this._processLoginError(error, model);
                    this.processing = false;
                }
            });
    }

    @concat()
    handleFillPersonalInfo() {
        return this.fillPersonalInfoHandler();
    }

    fillPersonalInfo(email: string) {
        return this._personalInfoService.getUserAccountTypeByEmail(email)
            .subscribe((accountType: AccountType) => {
                let route = this._getPersonalInfoRoute(accountType);

                this._router.navigate([route], {
                    relativeTo: this._activatedRoute.parent,
                    queryParams: {
                        email: email
                    }
                });
            }, e => {
                console.log(e);
            });
    }

    @concat()
    handleResendConfirm() {
        return this.resendConfirmHandler();
    }

    resendConfirm(email: string): Subscription {
        const model: ReconfirmEmailModel = {
            email: email,
            redirectUri: UrlsManager.reconfirmEmailRedirectUrl(email)
        };

        return this._authService.reconfirmEmail(model).subscribe(
            data => {
                this.showReconfirmButton = false;
                this.notification = {
                    isError: false,
                    message: 'Verification link is sent on your registration email'
                };
            },
            error => {
                this.notification = {
                    isError: true,
                    message: 'Failed: ' + (typeof (error.error) === 'string' ? error.error : error.error.description)
                };
            });
    }

    doRegistration() {
        this._router.navigate([AuthRoutes.Registration], {relativeTo: this._activatedRoute.parent});
    }

    doPasswordRestoration() {
        this._router.navigate([AuthRoutes.ForgotPassword], {relativeTo: this._activatedRoute.parent});
    }

    resetTwoStepAuth() {
        this._router.navigate([AuthRoutes.ResetTwoStepAuth], {relativeTo: this._activatedRoute.parent});
    }

    private _clearNotifications() {
        this.notification = null;
        this.processing = true;
        this.showFillInfoButton = false;
        this.showReconfirmButton = false;
    }

    private _getNotification(params: Params): Notification {
        let notificationMessage = null;

        if (params['registered']) {
            notificationMessage = 'Verification link is sent on your registration email';
        }

        if (params['forgot']) {
            notificationMessage = 'Please check your email for password restoration details';
        }

        if (params['passwordChanged']) {
            notificationMessage = 'Password changed, use new password for authentication';
        }

        if (params['infoFilled']) {
            
            this.pwd = this._sessionStorage.get(this.sessionStorageKey1);
            this.email = this._sessionStorage.get(this.sessionStorageKey2);
            this._sessionStorage.remove(this.sessionStorageKey1);
            this._sessionStorage.remove(this.sessionStorageKey2);

            if (this.pwd && this.email) {
                try {
                    this.pwd = atob(this.pwd);
                    this.email = atob(this.email);

                    const model: SignInRequestModel = {
                        email: this.email,
                        password: this.pwd,
                        rememberMe: false
                    };

                    this.processing = true;
                    this._identity.signIn(model)
                    .subscribe({
                        next: (value) => {
                            if (value) {
                                this._router.navigate([AppRoutes.Platform], {
                                    relativeTo: this._route.root
                                });
                            } else {
                                this.notification = {
                                    isError: true,
                                    message: 'Authorization failed'
                                };
        
                                this.processing = false;
                            }
                        },
                        error: (error) => {
                            this._processLoginError(error, model);
                            this.processing = false;
                        }
                    });

                } catch (e) {
                    notificationMessage = 'Your personal information is sent and account activated. Please login.';
                }
            } else {
                // notificationMessage = 'Your personal information is sent. Please wait until administrator check it.';
                notificationMessage = 'Your personal information is sent and account activated. Please login.';
            }
        }

        if (params['email'] && params['confirmed']) {
            notificationMessage = params['confirmed'] === 'True'
                ? 'Email address ' + params['email'] + ' confirmed'
                : 'Email address ' + params['email'] + ' NOT confirmed';
        }

        if (notificationMessage) {
            return {
                isError: false,
                message: notificationMessage
            } as Notification;
        }

        return null;
    }

    private _processLoginError(error: any, model: SignInRequestModel) {
        if (error.status === 403 || error.status === 400) {
            const errorMessage = error.error;

            switch (errorMessage.code) {
                case EAuthErrorStatus.KycNone:
                case EAuthErrorStatus.KycNotSent: {
                    this._router.navigate([AuthRoutes.PersonalAccount], {
                        relativeTo: this._activatedRoute.parent,
                        queryParams: {
                            email: model.email
                        }
                    });

                    if (this.pwd && this.email) {
                        this._sessionStorage.set(this.sessionStorageKey1, btoa(this.pwd));
                        this._sessionStorage.set(this.sessionStorageKey2, btoa(this.email));
                    }
                    break;
                }
                case EAuthErrorStatus.KycRejected: {
                    this.notification = {
                        isError: true,
                        message: errorMessage.description
                    };

                    this.showFillInfoButton = true;
                    this.fillPersonalInfoHandler = this.fillPersonalInfo.bind(this, model.email);

                    break;
                }
                case EAuthErrorStatus.KycPending: {
                    this.notification = {
                        isError: false,
                        message: 'Administrator checking your documents. Wait a little bit.'
                    };
                    break;
                }
                case EAuthErrorStatus.UserNotFound:
                case EAuthErrorStatus.InvalidPassword: {
                    this.notification = {
                        isError: true,
                        message: 'Authorization failed: Incorrect username or password.'
                    };
                    break;
                }
                case EAuthErrorStatus.InvalidPin: {
                    this.notification = {
                        isError: true,
                        message: 'Authorization failed: Incorrect two factor auth code.'
                    };
                    break;
                }
                case EAuthErrorStatus.EmailNotConfirmed: {
                    this.notification = {
                        isError: true,
                        message: 'This account is not confirmed. Confirm letter has already been sent on your email.'
                    };
                    this.showReconfirmButton = true;
                    this.resendConfirmHandler = this.resendConfirm.bind(this, model.email);

                    break;
                }
                case EAuthErrorStatus.UserDeactivated: {
                    this.notification = {
                        isError: true,
                        message: 'Authorization failed: This account is deactivated.'
                    };
                    break;
                }
                default: {
                    this.notification = {
                        isError: true,
                        message: `Authorization failed: ${errorMessage.description}`
                    };
                }
            }
        } else {
            let e = error.error;
            if (!e) {
                e = error.message;
            }
            this.notification = {
                isError: true,
                message: 'Authorization failed' + (typeof (e) === 'string' ? e + ': ' : '.')
            };
            console.log(error);
        }
    }

    private _getFormData(): SignInRequestModel {
        const controls = this.formGroup.controls;

        return {
            email: controls['email'].value,
            password: controls['password'].value,
            rememberMe: controls['rememberMe'].value,
            pin: controls['pin'].value
        } as SignInRequestModel;
    }

    private _getPersonalInfoRoute(accountType: AccountType): string {
        switch (accountType) {
            case AccountType.Personal:
                return AuthRoutes.PersonalAccount;
            case AccountType.Business:
                return AuthRoutes.BusinessAccount;
            case AccountType.Institutional:
                return AuthRoutes.InstitutionalAccount;
        }
    }
}
