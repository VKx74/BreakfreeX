import { ChangeDetectorRef, Component, Inject, Injector, ViewChild } from "@angular/core";
import { of, Subject } from "rxjs";
import { IdentityService } from "@app/services/auth/identity.service";
import { TranslateService } from "@ngx-translate/core";
import { LayoutTranslateService } from "@layout/localization/token";
import { catchError, first, map, takeUntil } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { NavigationStart, Router } from "@angular/router";
import { SplitComponent } from "angular-split";
import { EventsHelper } from "@app/helpers/events.helper";
import { DefaultState } from "@platform/components/dashboard/default-layout-state";
import { Store } from "@ngrx/store";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { ActionTypes } from "@platform/store/actions/platform.actions";
import { AppState } from "@app/store/reducer";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes, LogoutSuccessAction } from "@app/store/actions";
import { LayoutStorageService } from '@app/services/layout-storage.service';
import { ConfirmModalComponent, IConfirmModalConfig } from 'UI';
import { WorkspaceRepository } from "@platform/services/workspace-repository.service";
import { Workspace } from "@platform/data/workspaces";
import { AlertService } from "@alert/services/alert.service";
import { BrokerService } from "@app/services/broker.service";
import { ToggleBottomPanelSizeService } from "@platform/components/dashboard/toggle-bottom-panel-size.service";
import {
    GoldenLayoutComponent,
    IGoldenLayoutComponentSettings,
    IGoldenLayoutComponentState,
    LayoutManagerService
} from "angular-golden-layout";
import { ComponentPortal } from "@angular/cdk/portal";
import { ComponentSelectorComponent } from "@platform/components/component-selector/component-selector.component";
import { Overlay } from "@angular/cdk/overlay";
import { SingleSessionService } from '@app/services/single-session.service';
import { Intercom } from 'ng-intercom';
import { CookieService } from '@app/services/сookie.service';
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';
import { MissionTrackingService } from "@app/services/missions-tracking.service";
import { InstrumentMappingService } from "../../../../app/services/instrument-mapping.service";
import { AlertsService } from "modules/AutoTradingAlerts/services/alerts.service";
import { PhoneNumberPopUpComponent } from "modules/BreakfreeTrading/components/phoneNumberPopUp/phoneNumberPopUp.component";
import { LocalStorageService } from "modules/Storage/services/local-storage.service";
import { GTMTrackingService } from "@app/services/traking/gtm.tracking.service";
import { TradeGuardTrackingService } from "@app/services/trade-guard-tracking.service";


@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    providers: [
        LayoutStorageService
    ]
})
export class DashboardComponent {
    private _updateInterval = 1000 * 60 * 5;
    private _autoSaveChecker = 1000 * 10;
    private _freeUserPopup = 1000 * 60 * 3;
    private _intervalLink: any;
    private _freeUserPopupTimer: any;
    private _saveLayout = true;
    private _lastExceptionTime: number = 0;
    private _showPhoneNumberPopupInterval: any;
    private _hardRefreshTimer: any;
    private _hardRefreshNeeded: boolean = false;
    layoutChanged = false;
    readonly openBottomPanel = 150;
    readonly minimizeBottomPanel = 26;

    @ViewChild(GoldenLayoutComponent, { static: true }) layout: GoldenLayoutComponent;
    @ViewChild('verticalSplit', { read: SplitComponent, static: false }) verticalSplit: SplitComponent;

    layoutSettings: IGoldenLayoutComponentSettings = {};
    destroy$ = new Subject();
    showExceptionPopup = false;
    showStaticLogin = false;

    get isBrokerConnected(): boolean {
        return this._brokerService.isConnected;
    }

    get bottomPanelMinSize() {
        return 160;
    }

    constructor(private _store: Store<AppState>,
        private _actions: Actions,
        private _intercom: Intercom,
        private _dialog: MatDialog,
        private _identityService: IdentityService,
        private _router: Router,
        private _coockieService: CookieService,
        private _layoutStorageService: LayoutStorageService,
        private _brokerService: BrokerService,
        private _alertsService: AlertsService,
        protected _localStorageService: LocalStorageService,
        @Inject(LayoutTranslateService) private _layoutTranslateService: TranslateService,
        private _layoutManager: LayoutManagerService,
        private _workspaceRepository: WorkspaceRepository,
        private _alertService: AlertService,
        private _singleSessionService: SingleSessionService,
        private _missionTrackingService: MissionTrackingService,
        private _tradeGuardTrackingService: TradeGuardTrackingService,
        public bottomPanelSizeService: ToggleBottomPanelSizeService,
        private _overlay: Overlay,
        private _instrumentMappingService: InstrumentMappingService
    ) {

    }

    ngOnInit() {
        this._actions
            .pipe(
                ofType(ActionTypes.AppTypeChanged, ActionTypes.DeleteSession),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._saveLayout = false;
                this._layoutStorageService.removeLayoutState().subscribe(data => { });
            });

        this._actions
            .pipe(
                ofType(ActionTypes.SaveState),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._saveLayoutState();
            });

        this._actions
            .pipe(
                ofType(ActionTypes.ResetLayout),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._resetLayout();
            });

        this._actions
            .pipe(
                ofType(ActionTypes.ClearSession),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._clearLayout();
            });

        this._actions
            .pipe(
                ofType(ActionTypes.GlobalError),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                const currentTime = Date.now();
                const differenceInSeconds = (currentTime - this._lastExceptionTime) / 1000;

                // show every 5 minute
                if (differenceInSeconds > 60 * 1) {
                    this.showExceptionPopup = true;
                    this._lastExceptionTime = currentTime;
                }
            });

        this._actions
            .pipe(
                ofType(AppActionTypes.LogoutSuccess),
                first()
            )
            .subscribe((action: LogoutSuccessAction) => {
                this._saveLayoutState();
            });

        if (!this._identityService.isAdmin) {
            this._singleSessionService.watchSessions();
        }

        if (this._identityService.isAuthorizedCustomer) {
            this._missionTrackingService.initMissions();
            this._missionTrackingService.watchMissions();
            this._tradeGuardTrackingService.initTimer();
        }

        this._intervalLink = setInterval(this._autoSave.bind(this), this._updateInterval);
        this._freeUserPopupTimer = setTimeout(this._showFreeUserPopup.bind(this), this._freeUserPopup);

        if (this._identityService.isTrial) {
            this._hardRefreshNeeded = !this._identityService.isTrialNumberRequired();
            this._showPhoneNumberPopupInterval = setInterval(this._showPhoneNumberPopup.bind(this), 1000 * 30);
        }
    }

    ngAfterViewInit() {
        this._loadLayoutState();
        this._instrumentMappingService.getAllMapping();

        this._layoutManager.layout.$onAddComponent
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe({
                next: (parent) => {
                    this.setUpComponentSelectorDialog(parent);
                }
            });

        this._intercom.boot({
            app_id: "sv09ttz9",
            hide_default_launcher: true
        });

        const loader = document.getElementById("initial-loader");
        if (loader) {
            loader.remove();
        }

        const os = (window as any).OneSignal;
        if (os && os.push && os.setExternalUserId) {
            const userId = this._identityService.id;
            if (userId) {
                os.push(function () {
                    os.setExternalUserId(userId);
                });
            }
        }

        try {
            this._alertsService.init();
        } catch (error) {
            console.error(error);
        }
    }

    clearSession() {
        this._clearLayout();
    }

    hideExceptionPopup() {
        this.showExceptionPopup = false;
    }

    _clearLayout() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._layoutTranslateService.get(`clearSessionConfirmation`)
            }
        } as any)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (isConfirmed) {
                    this._saveLayout = false;
                    this._localStorageService.remove(LocalStorageService.IsSpreadAutoProcessing);
                    this._layoutStorageService.removeLayoutState().subscribe(data => {
                        this._identityService.signOut().subscribe(data1 => {
                            this._coockieService.deleteAllCookie();
                            window.location.reload(true);
                        });
                    });
                }
            });
    }
    _processLayoutReady() {
        this._router.events
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: any) => {
                if (event instanceof NavigationStart) {
                    this._saveLayoutState();
                }
            });
    }

    private _loadLayoutState() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        let isSmallScreen = w <= 768 || h <= 768;
        if (this._identityService.isGuestMode) {
            if (isSmallScreen) {
                this._workspaceRepository.getGuestMobileWorkspace()
                    .subscribe((data: Workspace) => {
                        this._initializeLayout(data.layoutState);
                    });
            } else {
                this._workspaceRepository.getGuestWorkspace()
                    .subscribe((data: Workspace) => {
                        this._initializeLayout(data.layoutState);
                    });
            }

            return;
        }

        this._layoutStorageService.getLayoutState()
            .pipe(
                catchError(() => { // no saved workspace
                    return this._workspaceRepository.getDefaultWorkspaceByUserTags(this._identityService.tags)
                        .pipe(
                            map((workspace: Workspace) => {
                                return workspace.layoutState;
                            }),
                            catchError((e) => {
                                console.error('Failed to load workspace by tag', e);
                                return of(DefaultState);
                            })
                        );
                })
            )
            .subscribe((data: IGoldenLayoutComponentState) => {
                this._initializeLayout(data);
            });
    }

    private _initializeLayout(state: IGoldenLayoutComponentState) {
        this.layout.loadState(state);
        this._processLayoutReady();
    }

    private _saveLayoutState(async: boolean = true) {
        if (this._identityService.isAuthorized && this._saveLayout && !this._identityService.isGuestMode) {
            const layoutState = this.layout.saveState();
            this._layoutStorageService.saveLayoutState(layoutState, async)
                .subscribe(
                    (data) => {
                        this.layoutChanged = true;
                        this._alertService.success(this._layoutTranslateService.get("savedLayout"));
                    });
        }
    }

    private _resetLayout() {
        this._workspaceRepository.loadWorkspaces()
            .subscribe({
                next: (workspaces: Workspace[]) => {
                    for (const w of workspaces) {
                        if (w.id === "empty") {
                            this._layoutManager.loadState(w.layoutState, true);
                            break;
                        }
                    }
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }

    needSaveConfirm() {
        return (() => {
            return new Promise((resolve, reject) => {
                if (this.layoutChanged)
                    this._dialog.open<ConfirmModalComponent, IConfirmModalConfig>(ConfirmModalComponent, {
                        data: {
                            title: 'Logout',
                            message: 'Layout is not saved. Do you want to continue?'
                        }
                    }).afterClosed()
                        .subscribe(res => {
                            if (res)
                                resolve();
                            else
                                reject();
                        });
                else
                    resolve();
            });
        });
    }

    saveLayoutState() {
        this._saveLayoutState();
    }

    handleSplitDragEnd(c) {
        if (c.sizes[1] >= this.openBottomPanel) {
            this.bottomPanelSizeService.setBottomPanelSize(c.sizes[1]);
        } else if (this.bottomPanelSizeService.sizeBottomPanel() >= this.openBottomPanel) {
            this.bottomPanelSizeService.setBottomPanelSize(this.minimizeBottomPanel);
        } else if (this.bottomPanelSizeService.sizeBottomPanel() === this.minimizeBottomPanel) {
            this.bottomPanelSizeService.setBottomPanelSize(this.openBottomPanel);
        }

        EventsHelper.triggerWindowResize();
    }

    private setUpComponentSelectorDialog(parent: any) {
        const addComponentElement = parent.element[0].getElementsByClassName('lm_add-component')[0];
        const componentSelectorPortal = new ComponentPortal(ComponentSelectorComponent);
        const positionStrategy = this._overlay.position()
            .flexibleConnectedTo(addComponentElement)
            .withPositions([
                {
                    originX: "center",
                    originY: "center",
                    overlayX: "start",
                    overlayY: "top"
                }
            ]);

        const overlayRef = this._overlay.create({
            positionStrategy,
            hasBackdrop: true
        });

        overlayRef.backdropClick()
            .subscribe(() => {
                overlayRef.detach();
            });

        const component = overlayRef.attach(componentSelectorPortal);
        component.instance.onComponentSelected
            .pipe(
                first(),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((componentIdentifier: string) => {
                overlayRef.detach();
                this._layoutManager.addComponent({
                    layoutItemName: componentIdentifier,
                    parent: parent,
                    state: null
                });
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.layout.destroy();

        if (this._intervalLink) {
            clearInterval(this._intervalLink);
        }
        if (this._freeUserPopupTimer) {
            clearTimeout(this._freeUserPopupTimer);
        }  
        if (this._showPhoneNumberPopupInterval) {
            clearInterval(this._showPhoneNumberPopupInterval);
        }
        if (this._hardRefreshTimer) {
            clearTimeout(this._hardRefreshTimer);
        }
    }

    private _autoSave() {
        if (this._identityService.isAuthorized && this._identityService.isAuthorizedCustomer && this._saveLayout) {
            const layoutState = this.layout.saveState();
            this._layoutStorageService.saveLayoutState(layoutState, true).subscribe();
        }
    }

    private _showFreeUserPopup() {
        if (this._identityService.isGuestMode) {
            return;
        }

        if (!this._identityService.isAuthorizedCustomer) {
            this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
        }
    }

    private _showPhoneNumberPopup() {
        this._identityService.updateTrialExpiration();
        if (this._identityService.isTrialNumberRequired()) {
            if (this._showPhoneNumberPopupInterval) {
                clearInterval(this._showPhoneNumberPopupInterval);
                this._showPhoneNumberPopupInterval = null;
            }
            this._dialog.closeAll();
            this._dialog.open(PhoneNumberPopUpComponent, { backdropClass: 'backdrop-background', disableClose: true });

            if (this._hardRefreshNeeded) {
                this._hardRefreshTimer = setTimeout(() => {
                    window.location.reload();
                }, 1000 * 60 * 10);
            }
        }
    }
}
