import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {passwordsMatchValidator, passwordValidator} from "Validators";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {AlertService} from "@alert/services/alert.service";
import {finalize} from "rxjs/operators";
import {ErrorStateMatcher} from "@angular/material/core";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";

export class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control.invalid || form.hasError('mismatchPasswords');
    }
}

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService
        }
    ]
})
export class ChangePasswordComponent implements OnInit {
    isPasswordChanging = false;
    formGroup: FormGroup;
    processing: boolean;
    errorMatcher = new CustomErrorStateMatcher();

    constructor(private _authService: AuthenticationService,
                private _alertService: AlertService,
                private _identity: IdentityService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();
    }

    passwordChanging() {
       this.isPasswordChanging = !this.isPasswordChanging;
    }

    changePassword() {
        const controls = this.formGroup.controls;
        this.processing = true;
        this._authService.changePassword({
            currentPassword: controls['currentPassword'].value,
            newPassword: controls['newPassword'].value
        })
            .pipe(finalize(() => this.processing = false))
            .subscribe({
                next: () => {
                    this.formGroup.reset();
                    this._alertService.success(this._translateService.get('passwordChangedSuccess'));
                },
                error: (e) => {
                    this._alertService.error(this._translateService.get('passwordChangeFailed'));
                    console.error(e);
                }
            });
    }

    toggleChangePassword() {
        if (this.isPasswordChanging) {
            this.isPasswordChanging = false;
            this.formGroup = this._getFormGroup();
        } else {
            this.isPasswordChanging = true;
        }
    }

    private _getFormGroup(): FormGroup {
        return new FormGroup({
            currentPassword: new FormControl('', [Validators.required]),
            newPassword: new FormControl('', [Validators.required, passwordValidator()]),
            confirmPassword: new FormControl('', [Validators.required, passwordValidator()])
        }, {
            validators: [passwordsMatchValidator('newPassword', 'confirmPassword')]
        });
    }
}
