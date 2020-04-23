import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {ComponentIdentifier} from "@app/models/app-config";
import {catchError, map} from "rxjs/operators";
import {ActionStatus, IdentityActivityLogInfo, IdentityLogsService} from "@app/services/identity-logs.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {TranslateService} from "@ngx-translate/core";
import bind from "bind-decorator";
import {Observable} from "rxjs";
import {ProfileActivitiesModuleMode, ProfileActivitiesModuleModeToken} from "../../profile-activities-mode.token";
import {ActivatedRoute} from "@angular/router";
import {IActivityResolverData} from "../../models/models";

@Component({
    selector: 'user-activities-login',
    templateUrl: './profile-activities-login.component.html',
    styleUrls: ['./profile-activities-login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileActivitiesLoginComponent implements OnInit {
    @Input() userId: string;
    ComponentIdentifier = ComponentIdentifier;
    activities$: Observable<IdentityActivityLogInfo[]>;

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

        return this.activities$ = this._identityLogsService.getLoginLogs(userId)
            .pipe(
                map(logs => logs.sort((a, b) => a.time > b.time ? -1 : a.time < b.time ? 1 : 0)),
                catchError(() => [])
            );
    }
}
