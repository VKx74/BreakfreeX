import {
    Component,
    EventEmitter,
    Injector,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import {Theme} from "@app/enums/Theme";
import {IdentityService} from "@app/services/auth/identity.service";
import {AppRoutes} from "@app/app.routes";
import {HealthCheckService} from "@app/services/health-check.service";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {Roles} from "@app/models/auth/auth.models";
import {RolesHelper} from "@app/helpers/role.helper";
import {forkJoin, Observable, of, Subject} from "rxjs";
import {ComponentIdentifier} from "@app/models/app-config";
import {UsersProfileService} from "@app/services/users-profile.service";
import {ExchangeStatusConfiguratorComponent} from "../exchange-status-configurator/exchange-status-configurator.component";
import {ExchangeStatus, SystemNotificationsService} from "../../../Notifications/services/system-notifications.service";
import {ThemeService} from "@app/services/theme.service";
import {UserAvatarShape} from "../../../UI/components/name-avatar/name-avatar.component";
import {Workspace} from "@platform/data/workspaces";
import {WorkspaceIds, WorkspaceRepository} from "@platform/services/workspace-repository.service";
import {ProcessState} from "@app/helpers/ProcessState";
import {
    ShuftiproAccountManagerComponent,
    ShuftiproAccountManagerConfig, ShuftiproAccountManagerResult
} from "../../../shuftipro-account-manager/components/shuftipro-account-manager/shuftipro-account-manager.component";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {catchError, delay} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {SidebarService} from "@app/services/sidebar.service";

export enum NavigationMode {
    User,
    Admin,
    Forum,
}

@Component({
    selector: 'navigation',
    templateUrl: 'navigation.component.html',
    styleUrls: ['navigation.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService
        }
    ]
})
export class NavigationComponent implements OnInit {
    private _healthCheckService: HealthCheckService;
    @Input() mode = NavigationMode.User;
    @Input() logoutConfirm: Function;
    @Output() onAddComponent = new EventEmitter();
    walletsMenuState = false;
    Roles = Roles;
    UserAvatarShape = UserAvatarShape;
    WorkspaceIds = WorkspaceIds;
    workspaces: Workspace[];
    opened: Subject<void> = new Subject<void>();

    avatarId: string;
    logoRedirectRoute = `/${AppRoutes.Admin}`;
    NavigationMode = NavigationMode;
    ComponentIdentifier = ComponentIdentifier;
    shuftiproAccountEmail = '';
    shuftiproStatus = '';
    isShuftiproHealthy: boolean;

    login: string;
    role: string;

    exchangeStatusesTitles: { [name: number]: string } = {
        [ExchangeStatus.OpenNormal]: 'Open normal',
        [ExchangeStatus.OpenRestricted]: 'Open restricted',
        [ExchangeStatus.PreOpen]: 'Pre open',
        [ExchangeStatus.Maintenance]: 'Maintenance',
        [ExchangeStatus.Closed]: 'Closed',
    };

    get exchangeStatus() {
        return this._systemNotificationsService.exchangeStatus;
    }

    get healthyClass(): string {
        switch (this.exchangeStatus) {
            case ExchangeStatus.Closed:
                return 'health-status-bad';
            case ExchangeStatus.OpenNormal:
                return 'health-status-ok';
            default:
                return 'health-status-warn';
        }
    }

    get userLastName() {
        return this._identityService.lastName;
    }

    get Theme() {
        return Theme;
    }

    get isHealthy(): boolean {
        return this._healthCheckService && this._healthCheckService.isHealthy;
    }

    get loadWorkspacesProcessState(): ProcessState {
        return this._workspaceRepository.loadWorkspacesState;
    }

    get isPlatformRoot() {
        return this._router.url === `/${AppRoutes.Platform}`;
    }

    get currentUserId() {
        return this._identityService.id;
    }

    get currentUserFullName() {
        return this._identityService.fullName;
    }

    get sidebarOpen() {
        return this._sidebarService.shown;
    }

    constructor(private _injector: Injector,
                private _identityService: IdentityService,
                private _systemNotificationsService: SystemNotificationsService,
                private _usersProfileService: UsersProfileService,
                private _dialog: MatDialog,
                private _router: Router,
                public _themeService: ThemeService,
                private _personalInfoService: PersonalInfoService,
                private _workspaceRepository: WorkspaceRepository,
                private _sidebarService: SidebarService,
                private _rolesHelper: RolesHelper) {
    }

    toggleSidebar() {
        this._sidebarService.toggle();
    }

    ngOnInit() {
        if (this.mode === NavigationMode.User) {
            this._healthCheckService = this._injector.get(HealthCheckService);
            this.logoRedirectRoute = '/';
        }


        this.login = this._identityService.email;
        if (!this.login) {
            this.login = 'Logged In';
        }
        this.role = this._identityService.role;


        this._usersProfileService.getUserProfileById(this._identityService.id)
            .subscribe(userProfileModel => {
                this.avatarId = userProfileModel ? userProfileModel.avatarId : '';
            }, e => {
                this.avatarId = '';
                console.log(e);
            });

        if (this.mode === NavigationMode.Admin) {
            forkJoin(
                this._personalInfoService.getShuftiproAccountEmail().pipe(catchError(error => of(error))),
                this._personalInfoService.getHealthStatus().pipe(catchError(error => of(error)))
            )
                .subscribe(val => {
                    this.shuftiproAccountEmail = val[0] instanceof HttpErrorResponse ? null : val[0];
                    if (val[1] instanceof HttpErrorResponse) {
                        this.isShuftiproHealthy = false;
                        this.shuftiproStatus = val[1].error;
                    } else {
                        this.isShuftiproHealthy = true;
                        this.shuftiproStatus = val[1];
                    }
                });
        }
    }

    onMenuOpen() {
        this.opened.next();
    }

    logout() {
        if (this.logoutConfirm)
            this.logoutConfirm()
                .then(() => {
                    this._logout();
                })
                .catch(() => {
                });
        else
            this._logout();
    }

    changeShuftiproAccount() {
        const shuftiproAccountManagerConfig: ShuftiproAccountManagerConfig = {
            currentEmail: this.shuftiproAccountEmail
        };
        this._dialog.open(ShuftiproAccountManagerComponent, {
            data: shuftiproAccountManagerConfig
        })
            .afterClosed()
            .subscribe((result: ShuftiproAccountManagerResult) => {
                if (result && result.newEmail) {
                    this.shuftiproAccountEmail = result.newEmail;
                }
            }, e => {
                console.log(e);
            });
    }


    showForum() {
        this._router.navigateByUrl(`/${AppRoutes.Landing}`);
    }

    showExchangeStatusSetting() {
        this._dialog.open(ExchangeStatusConfiguratorComponent);
    }

    showAdminPanel() {
        this._router.navigateByUrl(`/${AppRoutes.Admin}`);
    }

    showPlatform() {
        this._router.navigateByUrl(`/${AppRoutes.Platform}`);
    }


    roleToStr(role: string): Observable<string> {
        return this._rolesHelper.roleLocalizedStr(role as Roles);
    }

    openModalWithdraw() {
        // not used
    }

    openModalDeposit() {
        // not used
    }

    private _logout() {
        this._identityService.signOut().subscribe(success => {
            window.location.reload();
        }, error => {
            console.log(error);
        });
    }
}
