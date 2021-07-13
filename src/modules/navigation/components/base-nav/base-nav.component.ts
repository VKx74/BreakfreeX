import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UserAvatarShape } from "../../../UI/components/name-avatar/name-avatar.component";
import { AppRoutes } from "AppRoutes";
import { IdentityService } from "@app/services/auth/identity.service";
import { UsersProfileService } from "@app/services/users-profile.service";
import { SidebarService } from "@app/services/sidebar.service";
import { ActivatedRoute } from "@angular/router";
import { debounceTime, takeUntil } from "rxjs/operators";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { MissionsComponent } from 'modules/BreakfreeTrading/components/missions/missions.component';
import { ThemeService } from '@app/services/theme.service';
import { Theme } from '@app/enums/Theme';
import { UserSettings, UserSettingsService } from '@app/services/user-settings/user-settings.service';
import { LocalizationService } from 'Localization';
import { InlineService } from '@app/services/inline-manual.service';
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';

@Component({
    selector: 'base-nav',
    templateUrl: './base-nav.component.html',
    styleUrls: ['./base-nav.component.scss']
})
export class BaseNavComponent implements OnInit {
    readonly avatarShape = UserAvatarShape.Rounded;
    @Input() showUserDashboard = false;
    @Input() showUserAvatar = false;
    @Input() logoutConfirm: Function;
    sidebarState$ = this._sidebarService.state$;
    debouncedSidebarState$ = this._sidebarService.state$
        .pipe(
            debounceTime(300)
        );
    logoRedirectRoute = `/${AppRoutes.Platform}`;
    avatarId: string;
    login: string;
    firstName = this._identityService.firstName;
    role = this._identityService.role;
    email = this._identityService.email;
    opened: Subject<void> = new Subject<void>();

    presentationMode: boolean;
    showStaticLogin: boolean;

    get userNameWithLevel(): string {
        if (this.level) {
            return `${this.firstName} ${this.level}`;
        }

        return this.firstName;
    }

    get isDarkTheme() {
        return this._themeService.activeTheme === Theme.Dark;
    }

    get isGuest() {
        return this._identityService.isGuestMode;
    }

    get currentUserFullName() {
        return this._identityService.fullName;
    }

    public get score(): number {
        return this._tradingProfileService.score;
    }

    public get isAuthorizedCustomer(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    public get levelName(): string {
        return this._tradingProfileService.levelName || "";
    }

    public get isLoaded(): boolean {
        return !!this._tradingProfileService.missions;
    }

    public get scoreForLevel(): number {
        return this._tradingProfileService.scoreForLevel;
    }

    public get level(): number {
        return this._tradingProfileService.level;
    }

    constructor(private _identityService: IdentityService,
        private _usersProfileService: UsersProfileService,
        private _cdRef: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _tradingProfileService: TradingProfileService,
        private _sidebarService: SidebarService,
        private _localizationService: LocalizationService,
        private _themeService: ThemeService,
        private _userSettingsService: UserSettingsService,
        private _route: ActivatedRoute,
        private _inlineService: InlineService) {
        this.showStaticLogin = this._identityService.isGuestMode;
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
                if (userProfileModel) {
                    this.avatarId = userProfileModel.avatarId;
                    this.login = userProfileModel.userName;
                } else {
                    this.avatarId = '';
                }

                if (!this.login) {
                    this.login = this._identityService.firstName;
                }
                this._cdRef.markForCheck();
            }, e => {
                this.avatarId = '';
                console.log(e);
            });

        // this._inlineService.createPlayer();
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

    private _logout() {
        this._identityService.signOut().subscribe(success => {
            window.location.reload();
        }, error => {
            console.log(error);
        });
    }

    ngOnDestroy() {
    }

    openMissionDialog() {
        let scrHeight = window.innerHeight;
        this._dialog.open(MissionsComponent, {
            backdropClass: 'backdrop-background', position: {
                top: scrHeight > 667 ? "100px" : null
            }
        });
    }
    switchToPresentationMode() {
        console.log('run');
        this._inlineService.activateTopic('89442'); // activate/deactivate any topic
        this.presentationMode = !this.presentationMode;
    }

    changeTheme() {
        this._themeService.setActiveTheme(this.isDarkTheme ? Theme.Light : Theme.Dark);
        this._save();
    }

    getOverviewClass() {

    }

    iconClick() {
        window.location.href = "/";
    }

    register() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }

    showSettings() {

    }

    private _save() {
        const settings: UserSettings = {
            theme: this._themeService.activeTheme,
            locale: this._localizationService.locale,
        } as UserSettings;

        this._userSettingsService.saveSettings(settings, true).subscribe();
    }
}
