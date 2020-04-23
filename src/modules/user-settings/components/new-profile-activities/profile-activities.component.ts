import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {
    ActionStatus,
    IdentityActivityLogInfo,
    IdentityLogsService,
    IdentityUserActivityAction
} from "@app/services/identity-logs.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {IdentityService} from "@app/services/auth/identity.service";
import {catchError, map} from "rxjs/operators";
import {Observable, of} from "rxjs";
import bind from "bind-decorator";
import {TranslateService} from "@ngx-translate/core";
import {ProfileActivitiesModuleMode, ProfileActivitiesModuleModeToken} from "../../profile-activities-mode.token";
import {ActivatedRoute} from "@angular/router";
import {IActivityResolverData} from "../../models/models";

@Component({
    selector: 'user-activities',
    templateUrl: './profile-activities.component.html',
    styleUrls: ['./profile-activities.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileActivitiesComponent implements OnInit {
    @Input() userId: string;
    ComponentIdentifier = ComponentIdentifier;
    activities$: Observable<IdentityActivityLogInfo[]> = of([]);

    identityActivityActionMap = {
        [IdentityUserActivityAction.SignOut]: 'Log out',
        [IdentityUserActivityAction.CreateAPIKey]: 'Create API key',
        [IdentityUserActivityAction.DeleteAPIKey]: 'Delete API key',
        [IdentityUserActivityAction.PhoneNumberAdd]: 'Add phone number',
        [IdentityUserActivityAction.PhoneNumberChange]: 'Change phone number',
        [IdentityUserActivityAction.PhoneNumberDeleteByUser]: 'Delete phone number by user',
        [IdentityUserActivityAction.PhoneNumberDeleteBySupport]: 'Delete phone number by support',
        [IdentityUserActivityAction.PasswordChange]: 'Change password by user',
        [IdentityUserActivityAction.PasswordForgot]: 'Password forgot',
        [IdentityUserActivityAction.PasswordRestore]: 'Restore password',
        [IdentityUserActivityAction.PasswordChangeBySupport]: 'Change password by support',
        [IdentityUserActivityAction.TwoFAEnable]: 'Enable 2FA',
        [IdentityUserActivityAction.TwoFADisable]: 'Disable 2FA',
        [IdentityUserActivityAction.TwoFASupportDisable]: 'Disable 2FA by support',
        [IdentityUserActivityAction.TwoFAConfirm]: 'Confirm 2FA',
        [IdentityUserActivityAction.TwoFARestore]: 'Restore 2FA',
        [IdentityUserActivityAction.UserUpdate]: 'User updated',
        [IdentityUserActivityAction.UserActivate]: 'User activated',
        [IdentityUserActivityAction.UserDeactivate]: 'User deactivated',
        [IdentityUserActivityAction.UserRestorePassword]: 'Restore password',
        [IdentityUserActivityAction.UserTagsChange]: 'Change user tags',
    };

    actionStatusMap = {
        [ActionStatus.Success]: 'Success',
        [ActionStatus.Failed]: 'Failed',
        [ActionStatus.Undefined]: 'Undefined',
    };

    constructor(private _identityService: IdentityService,
                private _identityLogsService: IdentityLogsService,
                private _translateService: TranslateService,
                private _route: ActivatedRoute,
                @Inject(ProfileActivitiesModuleModeToken) public mode: ProfileActivitiesModuleMode
    ) {
    }

    ngOnInit() {
        const activities = (this._route.snapshot.data as IActivityResolverData).activities;
        this.activities$ = activities ? activities : this._getActivities();
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._translateService.get(columnName);
    }

    private _getActivities(): Observable<IdentityActivityLogInfo[]> {
        const userId = this.userId ? this.userId : this._identityService.id;
        return this._identityLogsService.getActivityLogs(userId)
            .pipe(
                map(logs => logs.sort((a, b) => a.time > b.time ? -1 : a.time < b.time ? 1 : 0)),
                catchError(() => [])
            );
    }
}
