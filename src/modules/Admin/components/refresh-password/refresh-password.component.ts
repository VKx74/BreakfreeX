import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {passwordValidator} from "Validators";
import {ResetPasswordBySupportModel, UpdateUserModel, UserModel} from "@app/models/auth/auth.models";
import {UsersService} from "@app/services/users.service";
import {MemberConfiguratorModalResultType} from "../app-member-configurator/app-member-configurator.component";
import {AlertService} from "@alert/services/alert.service";

export interface ResetPasswordConfig {
    isEmailRefreshing: boolean;
    user: UserModel;
}

@Component({
    selector: 'reset-password',
    templateUrl: './refresh-password.component.html',
    styleUrls: ['./refresh-password.component.scss']
})
export class RefreshPasswordComponent extends Modal<ResetPasswordConfig, MemberConfiguratorModalResultType> {
    processing: boolean = false;
    formGroup: FormGroup;

    get isEmailRefreshing(): boolean {
        return this.data.isEmailRefreshing;
    }

    constructor(_injector: Injector,
                private _usersService: UsersService,
                private _alertService: AlertService) {
        super(_injector);
        this.formGroup = this._getFormGroup();
    }

    ngOnInit() {
    }

    submit() {
        this.isEmailRefreshing ? this._refreshEmail() : this._refreshPassword();
    }

    private _refreshEmail() {
        this.processing = true;
        const user = this.data.user;
        const newEmail = this.formGroup.controls['email'].value;
        const updateUserModel: UpdateUserModel = {
            role: user.role,
            userName: user.userName,
            id: user.id,
            stripeId: user.stripeId,
            email: newEmail,
            phoneNumber: user.phone
        };
        this._usersService.updateUser(updateUserModel)
            .subscribe({
                next: (newUser: UserModel) => {
                    this.processing = false;
                    this._alertService.success('Email refreshed');
                    this.close(newUser as MemberConfiguratorModalResultType);
                },
                error: () => {
                    this.processing = false;
                    this._alertService.error('Failed to refresh email');
                }
            });
    }

    private _refreshPassword() {
        this.processing = true;
        const email = this.data.user.email;
        const password = this.formGroup.controls['password'].value;
        const updateUserModel: ResetPasswordBySupportModel = {
            newPassword: password,
            email: email
        };
        this._usersService.refreshPassword(updateUserModel)
            .subscribe({
                next: () => {
                    this.processing = false;
                    this._alertService.success('Password refreshed');
                    this.close(true as MemberConfiguratorModalResultType);
                },
                error: () => {
                    this.processing = false;
                    this._alertService.error('Failed to refresh password');
                }
            });

    }

    private _getFormGroup(): FormGroup {
        if (this.isEmailRefreshing) {
            return new FormGroup({
                email: new FormControl(this.data.user.email, [Validators.required, Validators.email])
            });
        } else {
            return new FormGroup({
                password: new FormControl('', [Validators.required, passwordValidator()])
            });
        }
    }

}
