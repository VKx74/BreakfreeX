import { Component, ElementRef, EventEmitter, Inject, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { PlatformTranslateService } from "@platform/localization/token";
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { LinkingAction } from "@linking/models";
import { Intercom } from 'ng-intercom';
import { IdentityService } from '@app/services/auth/identity.service';
import { BaseLayoutItem } from '@layout/base-layout-item';
import { Components, RightSidePanelStateService } from '@platform/services/right-side-panel-state.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'right-panel',
    templateUrl: './right-panel.component.html',
    styleUrls: ['./right-panel.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class RightPanelComponent implements OnInit {
    private _isInitializedSubscription: Subscription;

    protected linker: Linker;
    protected _downloadLink: string;
    protected _panelFullScreenSize: number = 768;

    public Components = Components;
    public SelectedComponent: Components = Components.TrendIndex;

    @Input() isCollapsed: boolean = false;
    @Output() isCollapsedChange = new EventEmitter<boolean>();
    @ViewChild('widgets', { static: false }) widgetsContent: ElementRef;

    get LinkerColor(): string {
        return this.linker.getLinkingId();
    }

    get initialized(): boolean {
        return this._rightSidePanelStateService.isInitialized;
    }

    get collapsed(): boolean {
        return this.isCollapsed;
    }

    set collapsed(value: boolean) {
        this.isCollapsed = value;
        this.isCollapsedChange.next(this.isCollapsed);
    }

    get isBacktestAllowed(): boolean {
        return this._identityService.isAdmin || this._identityService.isSupportOfficer;
    } 
    
    get isChatAllowed(): boolean {
        return this._identityService.isAdmin || this._identityService.isChatAllowed;
    }

    get isStuff(): boolean {
        return this._identityService.isStuff;
    }

    get downloadLink(): string {
        return this._downloadLink;
    }

    constructor(protected _store: Store<AppState>,
        protected _injector: Injector,
        private _intercom: Intercom,
        private _identityService: IdentityService,
        private _rightSidePanelStateService: RightSidePanelStateService,
        @Inject(PlatformTranslateService) public platformTranslateService: TranslateService) {
        this.linker = this._injector.get(LinkerFactory).getLinker();
        this.linker.setDefaultLinking();

        let platform = window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'],
            os = null;

        if (macosPlatforms.indexOf(platform) !== -1) {
            this._downloadLink = '/assets/Navigator_1.1_OSX.zip';
            // document.getElementById('downloadlink').setAttribute('href', );
        } else if (iosPlatforms.indexOf(platform) !== -1) {

        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            this._downloadLink = '/assets/Navigator_1.1_WIN.zip';
        }

        this._isInitializedSubscription = this._rightSidePanelStateService.isInitialized$.subscribe(() => {
            if (!this._rightSidePanelStateService.isInitialized) {
                return;
            }

            const savedComponent = this._rightSidePanelStateService.getActiveComponent();

            if (savedComponent && savedComponent !== this.SelectedComponent) {
                let isExist = false;
                const keys = Object.getOwnPropertyNames(Components);
                for (const key of keys) {
                    if (Components[key] === savedComponent) {
                        isExist = true;
                        break;
                    }
                }
                this.SelectedComponent = isExist ? savedComponent : Components.TrendIndex;
            } else {
                this.SelectedComponent = Components.TrendIndex;
            }

            if (this._isInitializedSubscription) {
                this._isInitializedSubscription.unsubscribe();
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this._isInitializedSubscription) {
            this._isInitializedSubscription.unsubscribe();
        }
    }

    selectComponent(component: Components) {
        if (this.collapsed) {
            this.collapsed = false;
            this.SelectedComponent = component;
        } else {
            if (this.SelectedComponent !== component) {
                this.SelectedComponent = component;
            } else {
                this.collapsed = true;
            }
        }

        this._rightSidePanelStateService.setActiveComponent(this.SelectedComponent);

        if (this.widgetsContent && this.widgetsContent.nativeElement && this.SelectedComponent === Components.Chat) {
            setTimeout(() => {
                (window as any).dispatchEvent(new Event("resize"));
            }, 1);
        }
    }

    handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    handleOpenChart(action: LinkingAction) {
        this.linker.sendAction(action);
        if (window.innerWidth <= this._panelFullScreenSize) {
            this.collapse();
        }
    }

    showSupport() {
        this._intercom.show();
    }

    collapse() {
        this.collapsed = true;
    }

    open() {
        this.collapsed = false;
    }

    componentInitialized(widget: BaseLayoutItem) {
        const state = this._rightSidePanelStateService.getWidgetState(widget.componentId);
        widget.setState(state);
    }

    componentStateChanged(widget: BaseLayoutItem) {
        this._rightSidePanelStateService.setWidgetState(widget.componentId, widget.getState());
    }

    componentBeforeDestroy(widget: BaseLayoutItem) {

    }

}
