import { Linker, LinkerFactory } from "@linking/linking-manager";
import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injector } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { LinkSelectorComponent } from "@linking/components";
import { LinkingAction } from "@linking/models";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { GoldenLayoutItem, GoldenLayoutItemState } from "angular-golden-layout";
import { GoldenLayoutItemTracker } from "./golden-layout-item-tracker";
import { Subscription } from "rxjs";

export interface ILayoutItemComponentWithLinkingState {
    linkingId: string;
}

const TabWithLinkerClass = 'tab-with-linker';
const ActiveTabWithLinkerClass = 'active-tab-with-linker';

export abstract class BaseGoldenLayoutItemComponent extends GoldenLayoutItem {
    private _activeTabChangedSubscription: Subscription;
    public get isActive(): boolean {
        return this._container.tab.isActive;
    }

    protected linker: Linker;
    protected goldenLayoutItemTracker: GoldenLayoutItemTracker;

    constructor(protected _injector: Injector) {
        super(_injector);

        const _state = _injector.get(GoldenLayoutItemState);

        this.goldenLayoutItemTracker = _injector.get(GoldenLayoutItemTracker);

        if (this.useLinker()) {
            this.linker = this._injector.get(LinkerFactory).getLinker();

            if (_state) {
                const linkId = this._getLinkIdFromState(_state as ILayoutItemComponentWithLinkingState);

                if (linkId != null) {
                    this.setLink(linkId);
                }
            }

            this._activeTabChangedSubscription = this.goldenLayoutItemTracker.activeTabChanged.subscribe(() => {
                this.trackActiveTab();
            });

            this.linker.showLinkerTab = this.showLinkerTab();

            this.linker.linkingChange$
                .pipe(takeUntil(componentDestroyed(this)))
                .subscribe(() => {
                    this.fireStateChanged();
                });

            this.linker.onAction((action: LinkingAction) => {
                if (this.useActiveElementLinker()) {
                    if (this.goldenLayoutItemTracker.activeTab) {
                        if (this.goldenLayoutItemTracker.activeTab === this) {
                            this.handleLinkingAction(action);
                        }
                    } else {
                        if (this.isActive) {
                            this.handleLinkingAction(action);
                        }
                    }
                } else {
                    this.handleLinkingAction(action);
                }
            });
        }
    }

    protected trackActiveTab() {
        if (this === this.goldenLayoutItemTracker.activeTab) {
            this._tabElement.addClass(ActiveTabWithLinkerClass);
        } else {
            this._tabElement.removeClass(ActiveTabWithLinkerClass);
        }
    }

    protected setLink(linkId: string) {
        this.linker.setLinking(linkId);
    }

    protected useDefaultLinker(): boolean {
        return false;
    }

    protected showLinkerTab(): boolean {
        return true;
    }

    protected useActiveElementLinker(): boolean {
        return false;
    }

    protected useLinker(): boolean {
        return true;
    }

    protected useRandomLinker(): boolean {
        return false;
    }

    protected getState(): any {
        return null;
    }

    protected handleLinkingAction(action: LinkingAction) {
    }

    protected sendLinkingAction(action: LinkingAction) {
        this.linker.sendAction(action);
    }

    onTabCreated(tabElement: JQuery) {
        super.onTabCreated(tabElement);

        // this.goldenLayoutItemTracker.setActiveTab(this);

        if (this.useLinker()) {
            const componentFactoryResolver = this._injector.get(ComponentFactoryResolver);
            const appRef = this._injector.get(ApplicationRef);
            const componentRef = componentFactoryResolver
                .resolveComponentFactory(LinkSelectorComponent)
                .create(this._injector);

            appRef.attachView(componentRef.hostView);
            componentRef.instance.linker = this.linker;

            const componentDomElem = (componentRef.hostView as EmbeddedViewRef<any>)
                .rootNodes[0] as HTMLElement;

            tabElement.prepend(componentDomElem);
            tabElement.addClass(TabWithLinkerClass);

            tabElement.on("keydown touch click", () => {
                this.goldenLayoutItemTracker.setActiveTab(this);
            });

            if (this.useDefaultLinker()) {
                this.linker.setDefaultLinking();
            }

            if (this.isActive) {
                this.goldenLayoutItemTracker.setActiveTab(this);
            }
        }
    }

    onShow() {
        super.onShow();
        this.goldenLayoutItemTracker.setActiveTab(this);
    }

    saveState() {
        if (this.useLinker()) {
            return {
                linkingId: this.linker.getLinkingId(),
                ...this.getComponentState()
            };
        } else {
            return this.getComponentState();
        }
    }

    protected abstract getComponentState(): any;

    private _getLinkIdFromState(state: ILayoutItemComponentWithLinkingState): string {
        return state.linkingId == null ? null : state.linkingId;
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this._activeTabChangedSubscription) {
            this._activeTabChangedSubscription.unsubscribe();
            this._activeTabChangedSubscription = null;
        }

        if (this.linker) {
            this.linker.destroy();
        }
    }
}

