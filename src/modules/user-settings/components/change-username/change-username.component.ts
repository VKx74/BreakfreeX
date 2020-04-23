import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {passwordsMatchValidator, passwordValidator} from "Validators";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {AlertService} from "@alert/services/alert.service";
import {finalize} from "rxjs/operators";
import {ErrorStateMatcher} from "@angular/material/core";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {SettingsTranslateService} from "../../../broker/localization/token";

export class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control.invalid || form.hasError('mismatchPasswords');
    }
}

@Component({
    selector: 'change-username',
    templateUrl: './change-username.component.html',
    styleUrls: ['./change-username.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SettingsTranslateService
        }
    ]
})
export class ChangeUsernameComponent implements OnInit {
    @Input() username: string;
    @Output() onUsernameChanged = new EventEmitter<() => void>();
    isUsernameChanging = false;
    usernameControl: FormControl;
    processing = false;

    get isChangeButtonDisabled(): boolean {
        return this.processing
            || this.usernameControl.invalid
            || this.usernameControl.value.value === this.username;
    }

    constructor(private _alertService: AlertService,
                private _translateService: TranslateService,
                private _personalInfoService: PersonalInfoService) {
    }

    ngOnInit(): void {
        this.usernameControl = new FormControl({
            value: this.username,
        }, [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(32)
        ]);
    }

    toggleChangeUsername() {
      this.isUsernameChanging = !this.isUsernameChanging;
    }

    changeUserName() {
        this.processing = true;
        const newUserName = this.usernameControl.value;

        this._personalInfoService.changeUserName({
            oldUserName: this.username,
            newUserName: newUserName
        }).subscribe(() => {
            this.onUsernameChanged.emit(() => {
                this._alertService.success(this._translateService.get('usernameChangedSuccess'));
                this.username = newUserName;
                this.processing = false;
                this.toggleChangeUsername();
            });
        }, error => {
            console.error(error);
            this._alertService.error(this._translateService.get('usernameChangedFailed'));
            this.processing = false;
        });
    }
}
