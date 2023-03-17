import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, Injector, NgZone, ViewChild } from "@angular/core";
import { Observable, of, Subject, Subscription } from "rxjs";
import { IdentityService, SubscriptionType } from "@app/services/auth/identity.service";
import { TranslateService } from "@ngx-translate/core";
import { LayoutTranslateService } from "@layout/localization/token";
import { catchError, first, map, takeUntil, tap } from "rxjs/operators";
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
    GoldenLayoutState,
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
import { RightPanelComponent } from "../right-panel/right-panel.component";
import { InstrumentSearchDialogComponent } from "@instrument-search/components/instrument-search-dialog/instrument-search-dialog.component";
import { LayoutNameModalComponent } from "../layout-name-component/layout-name.component";
import { OpenLayoutModalComponent } from "../open-layout-component/open-layout.component";
import { ILayoutState } from "@app/models/layout-state";
import { Components, RightSidePanelStateService } from "@platform/services/right-side-panel-state.service";
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { InMemoryStorageService } from "modules/Storage/services/in-memory-storage.service";
import { LinkingAction } from "@linking/models";
import { ChartTrackerService } from "modules/BreakfreeTrading/services/chartTracker.service";
import { Console } from "console";
import { ThemeService } from "@app/services/theme.service";
import { ChartOptionsStorageService } from "@app/services/chart-options-storage.servic";


@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
    private _updateInterval = 1000 * 10;
    private _freeUserPopup = 1000 * 60 * 5;
    private _rightPanelMaxSize = 1100;
    private _rightPanelSize = 600;
    private _isRightPanelCollapsed: boolean = false;
    private _intervalLink: any;
    private _freeUserPopupTimer: any;
    private _saveLayout = true;
    private _lastExceptionTime: number = 0;
    private _showPhoneNumberPopupInterval: any;
    private _hardRefreshTimer: any;
    private _hardRefreshNeeded: boolean = false;
    private _rightSideResizing: boolean = false;
    private _lastRightPanelSize: number = 0;
    private _minRightSidePanelSize = 370;
    readonly openBottomPanel = 150;
    readonly minimizeBottomPanel = 30;
    readonly minRightSidePanelCollapsedSize = 45;
    readonly minRightPanelFullSize = 768;

    private get _isPro(): boolean {
        return this._identityService.subscriptionType === SubscriptionType.Pro ||
            this._identityService.subscriptionType === SubscriptionType.Trial;
    }

    @ViewChild(GoldenLayoutComponent, { static: true }) layout: GoldenLayoutComponent;
    @ViewChild('verticalSplit', { read: SplitComponent, static: false }) verticalSplit: SplitComponent;
    @ViewChild('horizontalSplit', { read: SplitComponent, static: false }) horizontalSplit: SplitComponent;

    layoutSettings: IGoldenLayoutComponentSettings = {};
    destroy$ = new Subject();
    showExceptionPopup = false;
    showStaticLogin = false;

    get isBrokerConnected(): boolean {
        return this._brokerService.isConnected;
    }

    get rightSideResizing(): boolean {
        return this._rightSideResizing;
    }

    get bottomPanelMinSize() {
        return 160;
    }

    get rightPanelMinSize() {
        if (this.isRightPanelCollapsed) {
            return this.minRightSidePanelCollapsedSize;
        }

        return this._minRightSidePanelSize;
    }

    get rightPanelMaxSize() {
        return this._rightPanelMaxSize;
    }

    get rightPanelSize() {
        return this._rightPanelSize;
    }

    set rightPanelSize(value: number) {
        this._rightPanelSize = value;
    }

    get isRightPanelCollapsed(): boolean {
        return this._isRightPanelCollapsed;
    }

    set isRightPanelCollapsed(value: boolean) {
        this._isRightPanelCollapsed = value;

        if (this._isRightPanelCollapsed) {
            this.rightPanelCollapsed();
        } else {
            this.rightPanelOpened();
        }
    }

    constructor(private _store: Store<AppState>,
        private _ref: ChangeDetectorRef,
        private _chartTrackerService: ChartTrackerService,
        private _actions: Actions,
        private _intercom: Intercom,
        private _dialog: MatDialog,
        private _identityService: IdentityService,
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
        public _rightSidePanelStateService: RightSidePanelStateService,
        private _overlay: Overlay,
        private _themeService: ThemeService,
        private _chartOptionsStorageService: ChartOptionsStorageService,
        private _instrumentMappingService: InstrumentMappingService
    ) {
        // this._setRightPanelRestrictions();
        this._setRightPanelInitialSize();
    }

    ngOnInit() {
        this._brokerService.activeBroker$.pipe(
            takeUntil(componentDestroyed(this))
        )
            .subscribe(() => {
                this._ref.detectChanges();
                console.log(">>> Broker state changed");
            });

        this._actions
            .pipe(
                ofType(ActionTypes.AppTypeChanged, ActionTypes.DeleteSession),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._saveLayout = false;
                this._layoutStorageService.removeDashboard().subscribe(data => { });
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
                ofType(ActionTypes.SaveLayoutAsNew),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._saveLayoutAsNew();
            });

        this._actions
            .pipe(
                ofType(ActionTypes.OpenNewLayout),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._openNewLayout();
            });

        this._actions
            .pipe(
                ofType(ActionTypes.LoadLayout),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this._loadLayout();
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

        this._themeService.activeThemeChange$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => this._handleThemeChange());

        // this._actions
        //     .pipe(
        //         ofType(AppActionTypes.LogoutSuccess),
        //         first()
        //     )
        //     .subscribe((action: LogoutSuccessAction) => {
        //         this._saveLayoutState();
        //     });

        if (!this._identityService.isAdmin) {
            this._singleSessionService.watchSessions();
        }

        if (this._identityService.isAuthorizedCustomer) {
            this._missionTrackingService.initMissions();
            this._missionTrackingService.watchMissions();
            this._tradeGuardTrackingService.initTimer();
        }

        this._freeUserPopupTimer = setTimeout(this._showFreeUserPopup.bind(this), this._freeUserPopup);

        if (this._identityService.subscriptionType === SubscriptionType.Trial || this._identityService.isTrialNumberRequired()) {
            this._hardRefreshNeeded = !this._identityService.isTrialNumberRequired();
            this._showPhoneNumberPopupInterval = setInterval(this._showPhoneNumberPopup.bind(this), 1000 * 15);
        }
    }

    ngAfterViewInit() {
        this._loadLayoutState();
        // this._instrumentMappingService.getAllMapping();

        this._layoutManager.layout.$onAddComponent
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe({
                next: (parent) => {
                    this.addChartComponent(parent);
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

        this._layoutManager.layout.$stateChanged
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this._ref.markForCheck();
            });

        document.addEventListener('gl-drag-started', () => {
            this._detach();
        }, false);

        document.addEventListener('gl-drag-ended', () => {
            this._attach();
        }, false);

        // set min size for chart GL area
        this.horizontalSplit.displayedAreas[0].minSize = 200;

        this._chartOptionsStorageService.getOptions().subscribe((chartOptions) => {
            if (chartOptions) {
                this._chartTrackerService.setGlobalChartOptions(chartOptions);
            }

            this._subscribeToChartOptionsStateChange();
        });
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
                    this._layoutStorageService.removeDashboard().subscribe(data => {
                        this._identityService.signOut().subscribe(data1 => {
                            this._coockieService.deleteAllCookie();
                            window.location.reload(true);
                        });
                    });
                }
            });
    }

    rightPanelCollapsed() {
        this.rightPanelSize = this.minRightSidePanelCollapsedSize;
        EventsHelper.triggerWindowResize();
    }

    rightPanelOpened() {
        this.rightPanelSize = this._lastRightPanelSize >= this.rightPanelMinSize ? this._lastRightPanelSize : this.rightPanelMinSize;
        EventsHelper.triggerWindowResize();
    }

    getGoldenLayoutState(): GoldenLayoutState {
        return this.layout.saveState();
    }

    getLayoutState(): ILayoutState {
        const glState = this.getGoldenLayoutState();
        let name = "Default";
        let id = "";
        if (this._layoutStorageService.currentDashboardName) {
            name = this._layoutStorageService.currentDashboardName;
        }
        if (this._layoutStorageService.currentDashboardId) {
            id = this._layoutStorageService.currentDashboardId;
        }
        return {
            state: glState,
            name: name,
            layoutId: id,
            savedTime: new Date().getTime(),
            description: this._getLayoutDescription(glState),
            rightSidePanelState: this._rightSidePanelStateService.getState(),
            globalChartOptions: this._chartTrackerService.chartOptions
        };
    }

    private _getLayoutDescription(state: GoldenLayoutState): string {
        return this._getComponentDescription(state.content);
    }

    private _getComponentDescription(component: any): string {
        if (Array.isArray(component)) {
            let res: string[] = [];
            for (const i of component) {
                let description = this._getComponentDescription(i.content || i);
                if (description) {
                    res.push(description);
                }
            }

            if (res.length) {
                return res.join(', ');
            }

            return "";
        }

        if (component.componentName === "chart" && component.componentState && component.componentState.componentState) {
            const state = component.componentState.componentState;
            const instrument = state.instrument;
            const timeFrame = state.timeFrame;

            if (!instrument || !timeFrame) {
                return "";
            }

            return `${instrument.symbol} ${this._getTimeframeDescription(timeFrame)}`;
        }
    }

    private _getTimeframeDescription(timeFrame: any): string {
        let interval = timeFrame.interval;
        let periodicity = timeFrame.periodicity;

        if (!interval || !periodicity) {
            return "";
        }

        periodicity = periodicity.toUpperCase();

        if (!periodicity) {
            periodicity = "Min(s)";
        } else if (periodicity === "H") {
            periodicity = "Hour(s)";
        } else if (periodicity === "D") {
            periodicity = "Days(s)";
        } else if (periodicity === "W") {
            periodicity = "Week(s)";
        }

        return `${interval} ${periodicity}`;
    }

    private _isGuestMode(): boolean {
        return this._identityService.isGuestMode;
    }

    private _loadLayoutState() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        let isSmallScreen = w <= 768 || h <= 768;
        if (this._isGuestMode()) {
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

        this._layoutStorageService.getDashboard()
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
            .subscribe((data: IGoldenLayoutComponentState | ILayoutState) => {
                this._initializeLayout(data);
            });
    }

    private _initializeLayout(state: IGoldenLayoutComponentState | ILayoutState) {
        this._applyLayout(state);
        setTimeout(() => {
            this._initAutoSave();
        }, this._updateInterval);
    }

    private _applyLayout(state: IGoldenLayoutComponentState | ILayoutState) {
        this._saveLayout = false;
        try {
            if ((state as ILayoutState).state) {
                const layout = (state as ILayoutState);
                const rightSidePanelState = layout.rightSidePanelState;
                const GLState = (layout.state as IGoldenLayoutComponentState);
                this.layout.loadState(GLState, false).then(() => {
                    this._actualizeLayout();
                }, () => {
                    this._resetLayout();
                }).catch(() => {
                    this._resetLayout();
                });
                this._layoutStorageService.setCurrentDashboard(layout.name, layout.layoutId);
                this._rightSidePanelStateService.initialize(rightSidePanelState);
                if (layout.globalChartOptions) {
                    this._chartTrackerService.setGlobalChartOptions(layout.globalChartOptions);
                }
            } else {
                const GLState = (state as IGoldenLayoutComponentState);
                this.layout.loadState(GLState, false).then(() => {
                    this._actualizeLayout();
                }, () => {
                    this._resetLayout();
                }).catch(() => {
                    this._resetLayout();
                });
                this._rightSidePanelStateService.initialize(RightSidePanelStateService.GetDefaultState(Components.SonarFeed));
            }
        } catch (error) {
            this._rightSidePanelStateService.initialize(RightSidePanelStateService.GetDefaultState(Components.SonarFeed));
        }
        setTimeout(() => {
            this._saveLayout = true;
        }, this._updateInterval);
    }

    private _actualizeLayout() {
        const layoutComponents = this._layoutManager.layout.getAllComponents();

        if (!layoutComponents || !layoutComponents.length) {
            this._resetLayout();
            return;
        }

        for (const layoutComponent of layoutComponents) {
            const component = (layoutComponent as any);
            const componentName = component.componentName;
            if (componentName && componentName !== "chart" && component.close) {
                component.close();
            }
        }

        this._trySetLinking();
    }

    private _trySetLinking() {
        const action = InMemoryStorageService.getLinking() as LinkingAction;
        InMemoryStorageService.deleteLinking();

        if (action) {
            const instrument = action.data.instrument;
            const timeInterval = (action.data.timeframe as number) * 1000;
            this._layoutManager.layout.addComponentAsColumn(
                "chart",
                {
                    instrument: instrument,
                    timeFrame: TradingChartDesigner.TimeFrame.intervalTimeFrame(timeInterval)
                }
            );
        }

        this._ref.markForCheck();
    }

    private _initAutoSave() {
        this._layoutManager.layout.$stateChanged
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this._ref.markForCheck();
                if (!this._saveLayout) {
                    return;
                }

                this._layoutStorageService.lastUpdateTime = new Date().getTime();
            });

        this._layoutStorageService.autoSaveInitialized = true;
        this._intervalLink = setInterval(this._autoSave.bind(this), this._updateInterval);
        this._rightSidePanelStateService.stateChanged
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this._layoutStorageService.lastUpdateTime = new Date().getTime();
            });
    }

    private _saveLayoutState() {
        this._layoutStorageService.lastUpdateTime = 0;
        if (this._identityService.isAuthorized && this._saveLayout && !this._isGuestMode()) {
            this._saveLayout = false;
            const layoutState = this.getLayoutState();
            this._layoutStorageService.updateActiveLayout(layoutState)
                .subscribe(
                    (data) => {
                        this._saveLayout = true;
                        this._alertService.success(this._layoutTranslateService.get("savedLayout"));
                    });
        }
    }

    private _resetLayout$(): Observable<any> {
        return this._workspaceRepository.loadWorkspaces()
            .pipe(tap((workspaces) => {
                for (const w of workspaces) {
                    if (w.id === "empty") {
                        this._layoutManager.loadState(w.layoutState, true);
                        break;
                    }
                }
            }));
    }

    private _resetLayout() {
        this._resetLayout$().subscribe(() => {
            this._trySetLinking();
        });
    }

    // needSaveConfirm() {
    //     return (() => {
    //         return new Promise((resolve, reject) => {
    //             if (this.layoutChanged)
    //                 this._dialog.open<ConfirmModalComponent, IConfirmModalConfig>(ConfirmModalComponent, {
    //                     data: {
    //                         title: 'Logout',
    //                         message: 'Layout is not saved. Do you want to continue?'
    //                     }
    //                 }).afterClosed()
    //                     .subscribe(res => {
    //                         if (res)
    //                             resolve();
    //                         else
    //                             reject();
    //                     });
    //             else
    //                 resolve();
    //         });
    //     });
    // }

    handleVerticalSplitDragEnd(c) {
        if (c.sizes[1] >= this.openBottomPanel) {
            this.bottomPanelSizeService.setBottomPanelSize(c.sizes[1]);
        } else if (this.bottomPanelSizeService.sizeBottomPanel() >= this.openBottomPanel) {
            this.bottomPanelSizeService.setBottomPanelSize(this.minimizeBottomPanel);
        } else if (this.bottomPanelSizeService.sizeBottomPanel() === this.minimizeBottomPanel) {
            this.bottomPanelSizeService.setBottomPanelSize(this.openBottomPanel);
        }

        EventsHelper.triggerWindowResize();
    }

    handleVerticalSplitDbClick() {
        this.isRightPanelCollapsed = !this.isRightPanelCollapsed;
        EventsHelper.triggerWindowResize();
    }

    handleHorizontalSplitDragEnd(c) {
        this._rightSideResizing = false;
        this._lastRightPanelSize = c.sizes[1];

        if (this.isRightPanelCollapsed) {
            if (c.sizes[1] > this.minRightSidePanelCollapsedSize) {
                this.isRightPanelCollapsed = false;
            }
        }

        EventsHelper.triggerWindowResize();
    }

    handleHorizontalSplitDragStart(c) {
        this._rightSideResizing = true;
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

    private _detach() {
        this._chartTrackerService.detach();
        this._ref.detach();
    }

    private _attach() {
        this._ref.detectChanges();
        this._chartTrackerService.attach();

        setTimeout(() => {
            this._ref.reattach();
            // this._ref.markForCheck();
        }, 1);
    }

    private addChartComponent(parent: any) {
        if (!this._canAddComponent()) {
            this._shoCheckoutPopup();
            return;
        }

        if (!this._canAddMoreComponents()) {
            this._alertService.info(this._layoutTranslateService.get("createComponentsRestriction"));
            return;
        }

        this._dialog.open(InstrumentSearchDialogComponent, {
            backdropClass: 'backdrop-background',
            data: {
            }
        }).afterClosed().subscribe((data) => {
            if (data) {
                this._detach();
                this._layoutManager.addComponent({
                    layoutItemName: "chart",
                    parent: parent,
                    state: {
                        instrument: data
                    }
                });

                this._attach();
            }
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

    // @HostListener('window:resize', ['$event'])
    // onResize(event) {
    //     this._setRightPanelRestrictions();
    // }

    // private _setRightPanelRestrictions() {
    //     const width = window.innerWidth * 0.7;

    //     if (this.rightPanelSize > width) {
    //         this.rightPanelSize = width;
    //         this._ref.detectChanges();
    //         EventsHelper.triggerWindowResize();
    //     }

    // }

    private _setRightPanelInitialSize() {
        const width = window.innerWidth;
        if (width < this.minRightPanelFullSize) {
            this.isRightPanelCollapsed = true;
        }
    }

    private _autoSave() {
        const lastUpdateTime = this._layoutStorageService.lastUpdateTime;
        if (!lastUpdateTime || new Date().getTime() - lastUpdateTime < this._updateInterval) {
            return;
        }

        this._layoutStorageService.lastUpdateTime = 0;

        if (this._identityService.isAuthorized && this._identityService.isAuthorizedCustomer && this._saveLayout) {
            this._saveLayout = false;
            const layoutState = this.getLayoutState();
            this._layoutStorageService.updateActiveLayout(layoutState).subscribe(() => {
                this._saveLayout = true;
            });
        }
    }

    private _showFreeUserPopup() {
        if (this._isGuestMode()) {
            return;
        }

        if (!this._identityService.isAuthorizedCustomer) {
            this._shoCheckoutPopup();
        }
    }

    private _shoCheckoutPopup() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
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

    private _loadLayout() {
        if (!this._canUseLayout()) {
            this._shoCheckoutPopup();
            return;
        }

        this._dialog.open(OpenLayoutModalComponent, {}).afterClosed().subscribe((id) => {
            if (!id) {
                return;
            }

            this._layoutStorageService.loadLayout(id).subscribe((savedLayout) => {
                if (savedLayout) {
                    this._applyLayout(savedLayout);
                }
            });
        });
    }

    private _openNewLayout() {
        if (!this._canUseLayout()) {
            this._shoCheckoutPopup();
            return;
        }

        this._canSaveMoreLayouts().subscribe((value) => {
            if (!value) {
                this._alertService.info(this._layoutTranslateService.get("createLayoutRestriction"));
                return;
            }

            this._dialog.open(LayoutNameModalComponent, {
                data: {}
            }).afterClosed().subscribe((name) => {
                if (!name) {
                    return;
                }

                this._resetLayout$().subscribe(() => {
                    this._saveCurrentLayout(name);
                });
            });
        });
    }
    private _saveLayoutAsNew() {
        if (!this._canUseLayout()) {
            this._shoCheckoutPopup();
            return;
        }

        this._canSaveMoreLayouts().subscribe((value) => {
            if (!value) {
                this._alertService.info(this._layoutTranslateService.get("createLayoutRestriction"));
                return;
            }

            this._dialog.open(LayoutNameModalComponent, {
                data: {
                    isSave: true
                }
            }).afterClosed().subscribe((name) => {
                if (!name) {
                    return;
                }

                this._saveCurrentLayout(name);
            });
        });
    }

    private _saveCurrentLayout(name: string) {
        const state = this.getGoldenLayoutState();
        const description = this._getComponentDescription(state.content);
        this._layoutStorageService.createLayout(state, name, description).subscribe((savedLayout) => {
            if (savedLayout) {
                this._layoutStorageService.setCurrentDashboard(savedLayout.name, savedLayout.layoutId);
                this._saveLayoutState();
            }
        });
    }

    private _canUseLayout(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    private _canAddComponent(): boolean {
        return this._identityService.isAuthorizedCustomer;
    }

    private _canSaveMoreLayouts(): Observable<boolean> {
        return this._layoutStorageService.loadLayouts().pipe(map((layouts) => {
            if (!layouts) {
                return true;
            }

            if (this._isPro) {
                return layouts.length < 10;
            } else if (this._identityService.subscriptionType === SubscriptionType.Discovery) {
                return layouts.length < 5;
            } else {
                return layouts.length < 3;
            }
        }));
    }
    private _canAddMoreComponents(): boolean {
        const count = this._layoutManager.layout.getAllComponents().length;

        if (this._isPro) {
            return count < 8;
        } else if (this._identityService.subscriptionType === SubscriptionType.Discovery) {
            return count < 4;
        } else {
            return count < 2;
        }
    }

    private _handleThemeChange() {
        this._chartTrackerService.setGlobalChartOptions(null);
    }

    private _subscribeToChartOptionsStateChange() {
        this._chartTrackerService.chartOptionsSubject.subscribe((options) => {
            if (options) {
                this._chartOptionsStorageService.saveSettings(options).subscribe(() => {
                    console.log("Chart options saved");
                });
            } else {
                this._chartOptionsStorageService.removeSettings().subscribe(() => {
                    console.log("Chart options removed");
                });
            }
        });
    }
}
