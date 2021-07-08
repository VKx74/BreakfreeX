import {Linker, LinkerFactory} from "@linking/linking-manager";
import {ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injector} from "@angular/core";
import {takeUntil} from "rxjs/operators";
import {LinkSelectorComponent} from "@linking/components";
import {LinkingAction} from "@linking/models";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {GoldenLayoutItem, GoldenLayoutItemState} from "angular-golden-layout";

export interface ILayoutItemComponentWithLinkingState {
    linkingId: string;
}

const TabWithLinkerClass = 'tab-with-linker';

export abstract class BaseLayoutItemComponent extends GoldenLayoutItem {
    protected linker: Linker;

    constructor(protected _injector: Injector) {
        super(_injector);

        const _state = _injector.get(GoldenLayoutItemState);

        if (this.useLinker()) {
            this.linker = this._injector.get(LinkerFactory).getLinker();

            if (_state) {
                const linkId = this._getLinkIdFromState(_state as ILayoutItemComponentWithLinkingState);

                if (linkId != null) {
                    this.setLink(linkId);
                }
            }

            this.linker.linkingChange$
                .pipe(takeUntil(componentDestroyed(this)))
                .subscribe(() => {
                    this.fireStateChanged();
                });

            this.linker.onAction((action: LinkingAction) => {
                this.handleLinkingAction(action);
            });
        }
    }

    protected setLink(linkId: string) {
        this.linker.setLinking(linkId);
    }

    protected useDefaultLinker(): boolean {
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

            if (this.useDefaultLinker()) {
                this.linker.setDefaultLinking();
            }
            
        }
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

        if (this.linker) {
            this.linker.destroy();
        }
    }
}
