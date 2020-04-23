import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {UserAvatarShape} from "../../../UI/components/name-avatar/name-avatar.component";
import {AppRoutes} from "AppRoutes";
import {SystemNotificationsService} from "../../../Notifications/services/system-notifications.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {UsersProfileService} from "@app/services/users-profile.service";
import {SidebarService} from "@app/services/sidebar.service";
import {ActivatedRoute} from "@angular/router";
import {debounceTime, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";

@Component({
    selector: 'base-nav',
    templateUrl: './base-nav.component.html',
    styleUrls: ['./base-nav.component.scss']
})
export class BaseNavComponent implements OnInit {
    readonly avatarShape = UserAvatarShape.Rounded;
    @Input() showUserAvatar = false;
    @Input() logoutConfirm: Function;
    sidebarState$ = this._sidebarService.state$;
    debouncedSidebarState$ = this._sidebarService.state$
        .pipe(
            debounceTime(300)
        );
    logoRedirectRoute = `/${AppRoutes.Platform}`;
    avatarId: string;
    firstName = this._identityService.firstName;
    role = this._identityService.role;
    email = this._identityService.email;
    // login: string;
    // role: string;

    // get exchangeStatus() {
    //     return this._systemNotificationsService.exchangeStatus;
    // }

    get currentUserFullName() {
        return this._identityService.fullName;
    }

    // get sidebarOpen() {
    //     return this._sidebarService.shown;
    // }

    constructor(private _identityService: IdentityService,
                private _systemNotificationsService: SystemNotificationsService,
                private _usersProfileService: UsersProfileService,
                private _cdRef: ChangeDetectorRef,
                private _sidebarService: SidebarService,
                private _route: ActivatedRoute) {
    }

    toggleSidebar() {
        this._sidebarService.toggle();
    }

    ngOnInit() {
        this._route.parent.url.pipe(
            takeUntil(componentDestroyed(this))
        ).subscribe(urlPath => {
            let rootPath = urlPath[urlPath.length - 1].path;
            if (rootPath !== AppRoutes.Admin) {
                rootPath = AppRoutes.Platform;
            }
            this.logoRedirectRoute = `/${rootPath}`;
        });

        // this.login = this._identityService.email;
        // if (!this.login) {
        //     this.login = 'Logged In';
        // }
        // this.role = this._identityService.role;

        this._usersProfileService.getUserProfileById(this._identityService.id)
            .subscribe(userProfileModel => {
                this.avatarId = userProfileModel ? userProfileModel.avatarId : '';
                // TODO: Review
                this._cdRef.markForCheck();
            }, e => {
                this.avatarId = '';
                console.log(e);
            });
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

    private _logout() {
        this._identityService.signOut().subscribe(success => {
            window.location.reload();
        }, error => {
            console.log(error);
        });
    }

    ngOnDestroy() {
    }
}
