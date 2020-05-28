import {ChangeDetectorRef, Component, Inject, Injector, ViewChild} from "@angular/core";
import {of, Subject} from "rxjs";
import {IdentityService} from "@app/services/auth/identity.service";
import {TranslateService} from "@ngx-translate/core";
import {LayoutTranslateService} from "@layout/localization/token";
import {LocalizationService} from "Localization";
import {catchError, first, map, takeUntil} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {SplitComponent} from "angular-split";
import {EventsHelper} from "@app/helpers/events.helper";
import {DefaultState} from "@platform/components/dashboard/default-layout-state";
import {LayoutStorage} from "@app/services/layout.storage";
import {Store} from "@ngrx/store";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {ActionTypes} from "@platform/store/actions/platform.actions";
import {AppState} from "@app/store/reducer";
import {Actions, ofType} from "@ngrx/effects";
import {AppActionTypes, LogoutSuccessAction} from "@app/store/actions";
import {LayoutStorageService} from '@app/services/layout-storage.service';
import {ConfirmModalComponent, IConfirmModalConfig} from 'UI';
import {AutoTradingEngine} from '@app/services/auto-trading-engine';
import {WorkspaceRepository} from "@platform/services/workspace-repository.service";
import {Workspace} from "@platform/data/workspaces";
import {AlertService} from "@alert/services/alert.service";
import {ThemeService} from "@app/services/theme.service";
import {LinkingMessagesBus} from "@linking/services";
import {TemplatesStorageService} from "@chart/services/templates-storage.service";
import {PopupWindowSharedProvidersKey} from "../../../popup-window/constants";
import {ISharedProviders} from "../../../popup-window/interfaces";
import {TimeZoneManager} from "TimeZones";
import {TemplatesDataProviderService} from "@chart/services/templates-data-provider.service";
import {NewsConfigService} from "../../../News/services/news.config.service";
import {EducationalTipsService} from "@app/services/educational-tips.service";
import {BrokerService} from "@app/services/broker.service";
import {InstrumentService} from "@app/services/instrument.service";
import {RealtimeService} from "@app/services/realtime.service";
import {HistoryService} from "@app/services/history.service";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {ToggleBottomPanelSizeService} from "@platform/components/dashboard/toggle-bottom-panel-size.service";
import {
    GoldenLayoutComponent,
    IGoldenLayoutComponentSettings,
    IGoldenLayoutComponentState,
    LayoutManagerService
} from "angular-golden-layout";
import {ComponentPortal} from "@angular/cdk/portal";
import {ComponentSelectorComponent} from "@platform/components/component-selector/component-selector.component";
import {Overlay} from "@angular/cdk/overlay";
import { SingleSessionService } from '@app/services/single-session.service';


@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    providers: [
        LayoutStorageService
    ]
})
export class DashboardComponent {
    private _saveLayout = true;
    layoutChanged = false;
    readonly openBottomPanel = 260;
    readonly minimizeBottomPanel = 40;

    @ViewChild(GoldenLayoutComponent, {static: true}) layout: GoldenLayoutComponent;
    @ViewChild('verticalSplit', {read: SplitComponent, static: false}) verticalSplit: SplitComponent;

    layoutSettings: IGoldenLayoutComponentSettings = {};
    destroy$ = new Subject();


    get bottomPanelMinSize() {
        return 40;
    }

    constructor(private _store: Store<AppState>,
                private _actions: Actions,
                private _dialog: MatDialog,
                private _identityService: IdentityService,
                private _localizationService: LocalizationService,
                private _router: Router,
                private _cdr: ChangeDetectorRef,
                private _layoutStorage: LayoutStorage,
                private _autoTradingEngine: AutoTradingEngine,
                private _layoutStorageService: LayoutStorageService,
                private _brokerService: BrokerService,
                @Inject(LayoutTranslateService) private _layoutTranslateService: TranslateService,
                private _layoutManager: LayoutManagerService,
                private _injector: Injector,
                private _workspaceRepository: WorkspaceRepository,
                private _route: ActivatedRoute,
                private _userSettingsService: UserSettingsService,
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
                this._layoutStorageService.removeLayoutState();
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
        this.layout.loadState(state);
        this._processLayoutReady();
    }

    private _saveLayoutState(async: boolean = true) {

        if (this._identityService.isAuthorized && this._saveLayout) {
            const layoutState = this.layout.saveState();
            this._layoutStorageService.saveLayoutState(layoutState, async)
                .subscribe(
                    (data) => {
                        this.layoutChanged = true;
                    });
        }
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
    }
}
