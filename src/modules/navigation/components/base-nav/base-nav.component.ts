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
import { LayoutStorageService } from '@app/services/layout-storage.service';
import { SaveStateAction } from '@app/store/actions/platform.actions';
import { Store } from "@ngrx/store";
import { AppState } from '@app/store/reducer';
import { SocialReactionsService } from 'modules/BreakfreeTradingSocial/services/social.reactions.service';
import { SportCountService } from 'modules/navigation/services/sport.count.service';
import { BlackFridayPremiumVideoComponent } from 'modules/BreakfreeTrading/components/blackFridayPremiumVideo/blackFridayPremiumVideo.component';

@Component({
    selector: 'base-nav',
    templateUrl: './base-nav.component.html',
    styleUrls: ['./base-nav.component.scss']
})
export class BaseNavComponent implements OnInit {
    private _spotsCount: string;

    readonly avatarShape = UserAvatarShape.Rounded;
    @Input() showUserDashboard = false;
    @Input() showUserAvatar = false;
    @Input() isAdminPanel = false;
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
    reactionMenuOpened: boolean = false;

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

    public get saveNeeded(): boolean {
        return !!this._layoutStorageService.lastUpdateTime;
    }

    public get autoSaveInitialized(): boolean {
        return this._layoutStorageService.autoSaveInitialized;
    }

    public get socialFeedRoute(): string {
        return AppRoutes.SocialFeed;
    }

    public get academyRoute(): string {
        return AppRoutes.Academy;
    }
    
    public get isUnreadMessages(): boolean {
        return this._socialRealtimeNotificationsService.unreadExists;
    }

    public get spotsCount(): string {
        return this._spotsCount;
    }

    public get isBlackFridayDeal(): boolean {
        return this._identityService.isBlackFridayDeal;
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
        private _layoutStorageService: LayoutStorageService,
        private _store: Store<AppState>,
        private _socialRealtimeNotificationsService: SocialReactionsService,
        private _sportCountService: SportCountService,
        private _inlineService: InlineService) {
        this.showStaticLogin = this._identityService.isGuestMode;
        // _sportCountService.getSpotsAvailable().subscribe((data) => {
        //     this._spotsCount = data;
        // });
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
        // this._inlineService.track();
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

    saveLayout() {
        this._store.dispatch(new SaveStateAction());
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

    onNotificationsMenuOpened() {
        this.reactionMenuOpened = true;
    }

    onNotificationsMenuClosed() {
        this.reactionMenuOpened = false;
        this._socialRealtimeNotificationsService.setAsRead();
    }

    // openBlackFridayDeal() {
    //     window.open("https://breakfreetrading.com/blackfriday/", '_blank').focus();
    // }

    showPremiumAcademyContent() {
        this._dialog.open(BlackFridayPremiumVideoComponent, { backdropClass: 'backdrop-background' });
    }

    private _save() {
        const settings: UserSettings = {
            theme: this._themeService.activeTheme,
            locale: this._localizationService.locale,
        } as UserSettings;

        this._userSettingsService.saveSettings(settings, true).subscribe();
    }
}
