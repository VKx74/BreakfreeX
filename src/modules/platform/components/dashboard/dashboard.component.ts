import { ChangeDetectorRef, Component, Inject, Injector, ViewChild } from "@angular/core";
import { of, Subject } from "rxjs";
import { IdentityService } from "@app/services/auth/identity.service";
import { TranslateService } from "@ngx-translate/core";
import { LayoutTranslateService } from "@layout/localization/token";
import { LocalizationService } from "Localization";
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
    private _intervalLink: any;
    private _saveLayout = true;
    private _lastExceptionTime: number = 0;
    layoutChanged = false;
    readonly openBottomPanel = 150;
    readonly minimizeBottomPanel = 26;

    @ViewChild(GoldenLayoutComponent, { static: true }) layout: GoldenLayoutComponent;
    @ViewChild('verticalSplit', { read: SplitComponent, static: false }) verticalSplit: SplitComponent;

    layoutSettings: IGoldenLayoutComponentSettings = {};
    destroy$ = new Subject();
    showExceptionPopup = false;

    get isBrokerConnected(): boolean {
        return this._brokerService.isConnected;
    }

    get bottomPanelMinSize() {
        return 160;
    }

    public get showTradingPanel(): boolean {
        return this._brokerService.showTradingPanel;
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
        @Inject(LayoutTranslateService) private _layoutTranslateService: TranslateService,
        private _layoutManager: LayoutManagerService,
        private _workspaceRepository: WorkspaceRepository,
        private _alertService: AlertService,
        private _singleSessionService: SingleSessionService,
        public bottomPanelSizeService: ToggleBottomPanelSizeService,
        private _overlay: Overlay,
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

        this._intervalLink = setInterval(this._autoSave.bind(this), this._updateInterval);
    }

    ngAfterViewInit() {
        this._loadLayoutState();

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
        try {
            this._replaceBFTPanelWithSonar(state.content);
        } catch (e) {

        }
        this.layout.loadState(state);
        this._processLayoutReady();
    }

    private _replaceBFTPanelWithSonar(content: any) {
        if (content instanceof Array) {
            content.forEach((item) => {
                this._replaceBFTPanelWithSonar(item);
            });
        } else {
            if (content.type !== "component" && content.content instanceof Array) {
                content.content.forEach((item) => {
                    this._replaceBFTPanelWithSonar(item);
                });
            } else if (content.type === "component" && content.componentName === "breakfreeTradingScanner") {
                content.componentName = "breakfreeTradingNavigator";
                content.componentState = null;
            }
        }
    }

    private _saveLayoutState(async: boolean = true) {
        if (this._identityService.isAuthorized && this._saveLayout) {
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
    }

    private _autoSave() {
        if (this._identityService.isAuthorized && this._identityService.isAuthorizedCustomer && this._saveLayout) {
            const layoutState = this.layout.saveState();
            this._layoutStorageService.saveLayoutState(layoutState, true).subscribe();
        }
    }
}
