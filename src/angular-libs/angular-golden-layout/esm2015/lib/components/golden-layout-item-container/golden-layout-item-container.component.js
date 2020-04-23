/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout-item-container/golden-layout-item-container.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, ComponentFactoryResolver, Inject, Injector, ViewChild, ViewContainerRef } from '@angular/core';
// import Container = GoldenLayoutNamespace.Container;
import { GoldenLayoutContainer } from "../../tokens/golden-layout-container.token";
import { GoldenLayoutItemComponentResolver } from "../../tokens/golden-layout-item-component-factory.token";
import { of } from "rxjs";
import { GoldenLayoutItem } from "../../golden-layout-item";
import { GoldenLayoutComponentConfiguration } from '../../tokens/golden-layout-configuration.token';
import { DefaultLabels } from '../../components/golden-layout/golden-layout.component';
/** @enum {number} */
const LoadComponentState = {
    Loading: 0,
    Success: 1,
    Failed: 2,
};
LoadComponentState[LoadComponentState.Loading] = 'Loading';
LoadComponentState[LoadComponentState.Success] = 'Success';
LoadComponentState[LoadComponentState.Failed] = 'Failed';
export class GoldenLayoutItemContainerComponent extends GoldenLayoutItem {
    /**
     * @param {?} _container
     * @param {?} _componentResolver
     * @param {?} _configuration
     * @param {?} _componentFactoryResolver
     * @param {?} _injector
     */
    constructor(_container, _componentResolver, _configuration, _componentFactoryResolver, _injector) {
        super(_injector);
        this._container = _container;
        this._componentResolver = _componentResolver;
        this._configuration = _configuration;
        this._componentFactoryResolver = _componentFactoryResolver;
        this._injector = _injector;
        this.LoadComponentState = LoadComponentState;
    }
    /**
     * @return {?}
     */
    get loadingLabel() {
        return (this._configuration.labels && this._configuration.labels.loading)
            ? this._configuration.labels.loading
            : DefaultLabels.loading;
    }
    /**
     * @return {?}
     */
    get failedToLoadLabel() {
        return (this._configuration.labels && this._configuration.labels.failedToLoadComponent)
            ? this._configuration.labels.failedToLoadComponent
            : DefaultLabels.failedToLoadComponent;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.setTitle(of('')); // fix
        this.setTitle(this.loadingLabel);
        if (((/** @type {?} */ (this._componentResolver))).factory != null) {
            this.loadComponentState = LoadComponentState.Loading;
            ((/** @type {?} */ (this._componentResolver))).factory()
                .subscribe({
                next: (/**
                 * @param {?} factory
                 * @return {?}
                 */
                (factory) => {
                    this.setTitle(of(this._componentResolver.componentName));
                    /** @type {?} */
                    const ref = this.componentContainer.createComponent(factory, undefined, this._injector);
                    ref.changeDetectorRef.detectChanges();
                    this._layoutItem = (/** @type {?} */ (ref.instance));
                    if (this._tabElement) {
                        this._layoutItem.onTabCreated(this._tabElement);
                    }
                    this.loadComponentState = LoadComponentState.Success;
                }),
                error: (/**
                 * @param {?} e
                 * @return {?}
                 */
                (e) => {
                    console.error(e);
                    this.loadComponentState = LoadComponentState.Failed;
                    this.setTitle(this.failedToLoadLabel);
                })
            });
        }
        else {
            this.setTitle(of(this._componentResolver.componentName));
            /** @type {?} */
            const componentFactory = this._componentFactoryResolver.resolveComponentFactory(((/** @type {?} */ (this._componentResolver))).component);
            /** @type {?} */
            const ref = this.componentContainer.createComponent(componentFactory, undefined, this._injector);
            ref.changeDetectorRef.detectChanges();
            this._layoutItem = (/** @type {?} */ (ref.instance));
            if (this._tabElement) {
                this._layoutItem.onTabCreated(this._tabElement);
            }
            this.loadComponentState = LoadComponentState.Success;
        }
    }
    /**
     * @return {?}
     */
    saveState() {
        if (this._layoutItem) {
            return this._layoutItem.saveState();
        }
        return {};
    }
    /**
     * @return {?}
     */
    onResize() {
        if (this._layoutItem) {
            this._layoutItem.onResize();
        }
    }
    /**
     * @return {?}
     */
    onShow() {
        if (this._layoutItem) {
            this._layoutItem.onShow();
        }
    }
    /**
     * @return {?}
     */
    onHide() {
        if (this._layoutItem) {
            this._layoutItem.onHide();
        }
    }
    /**
     * @param {?} tabElement
     * @return {?}
     */
    onTabCreated(tabElement) {
        if (this._layoutItem) {
            this._layoutItem.onTabCreated(tabElement);
        }
        this._tabElement = tabElement;
    }
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    onContainerMaximized(isOwnContainer) {
        if (this._layoutItem) {
            this._layoutItem.onContainerMaximized(isOwnContainer);
        }
    }
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    onContainerMinimized(isOwnContainer) {
        if (this._layoutItem) {
            this._layoutItem.onContainerMinimized(isOwnContainer);
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
    }
}
GoldenLayoutItemContainerComponent.decorators = [
    { type: Component, args: [{
                selector: 'golden-layout-item-container',
                template: "<div class=\"root\">\n    <div class=\"component-wrapper\">\n        <div class=\"loader-wrapper flex align-items-center justify-content-center\" *ngIf=\"loadComponentState === LoadComponentState.Failed || loadComponentState === LoadComponentState.Loading\">\n            <span *ngIf=\"loadComponentState === LoadComponentState.Loading\">{{loadingLabel | async}}</span>\n            <span *ngIf=\"loadComponentState === LoadComponentState.Failed\">{{failedToLoadLabel | async}}</span>\n        </div>\n        <template #componentContainer></template>\n    </div>\n</div>\n",
                styles: [".component-wrapper,.loader-wrapper,.root{width:100%;height:100%}.loader-wrapper span{font-size:14px}template+*{width:100%;height:100%}"]
            }] }
];
/** @nocollapse */
GoldenLayoutItemContainerComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutContainer,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutItemComponentResolver,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentConfiguration,] }] },
    { type: ComponentFactoryResolver },
    { type: Injector }
];
GoldenLayoutItemContainerComponent.propDecorators = {
    componentContainer: [{ type: ViewChild, args: ["componentContainer", { read: ViewContainerRef, static: true },] }]
};
if (false) {
    /** @type {?} */
    GoldenLayoutItemContainerComponent.prototype.componentContainer;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._layoutItem;
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItemContainerComponent.prototype._tabElement;
    /** @type {?} */
    GoldenLayoutItemContainerComponent.prototype.loadComponentState;
    /** @type {?} */
    GoldenLayoutItemContainerComponent.prototype.LoadComponentState;
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItemContainerComponent.prototype._container;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._componentResolver;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._configuration;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._componentFactoryResolver;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._injector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0LWl0ZW0tY29udGFpbmVyL2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFBb0Isd0JBQXdCLEVBQ3JELE1BQU0sRUFDTixRQUFRLEVBRVIsU0FBUyxFQUNULGdCQUFnQixFQUNqQixNQUFNLGVBQWUsQ0FBQzs7QUFFdkIsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sNENBQTRDLENBQUM7QUFDakYsT0FBTyxFQUFDLGlDQUFpQyxFQUFDLE1BQU0seURBQXlELENBQUM7QUFDMUcsT0FBTyxFQUFhLEVBQUUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQU8xRCxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSxnREFBZ0QsQ0FBQztBQUNsRyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0RBQXdELENBQUM7O0FBR3JGLE1BQUssa0JBQWtCO0lBQ3JCLE9BQU8sR0FBQTtJQUNQLE9BQU8sR0FBQTtJQUNQLE1BQU0sR0FBQTtFQUNQOzs7O0FBT0QsTUFBTSxPQUFPLGtDQUFtQyxTQUFRLGdCQUFnQjs7Ozs7Ozs7SUFtQnBFLFlBQXFELFVBQWUsRUFDTCxrQkFBcUMsRUFDcEMsY0FBbUQsRUFDL0YseUJBQW1ELEVBQ25ELFNBQW1CO1FBQ25DLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUxnQyxlQUFVLEdBQVYsVUFBVSxDQUFLO1FBQ0wsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNwQyxtQkFBYyxHQUFkLGNBQWMsQ0FBcUM7UUFDL0Ys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UUFDeEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDekQ7SUFDTCxDQUFDOzs7OztJQUVELG9CQUFvQixDQUFDLGNBQXVCO1FBQ3hDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQzs7OztJQUVELFdBQVc7SUFDWCxDQUFDOzs7WUE3SEosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSw4QkFBOEI7Z0JBQ3hDLHlrQkFBMEQ7O2FBRTdEOzs7OzRDQW9CZ0IsTUFBTSxTQUFDLHFCQUFxQjs0Q0FDNUIsTUFBTSxTQUFDLGlDQUFpQzs0Q0FDeEMsTUFBTSxTQUFDLGtDQUFrQztZQXREM0Isd0JBQXdCO1lBRXJELFFBQVE7OztpQ0FnQ0wsU0FBUyxTQUFDLG9CQUFvQixFQUFFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUM7Ozs7SUFBdkUsZ0VBQTRGOzs7OztJQUM1Rix5REFBdUM7Ozs7O0lBQ3ZDLHlEQUE4Qjs7SUFDOUIsZ0VBQXVDOztJQUN2QyxnRUFBd0M7Ozs7O0lBYzVCLHdEQUF3RDs7Ozs7SUFDeEQsZ0VBQXdGOzs7OztJQUN4Riw0REFBdUc7Ozs7O0lBQ3ZHLHVFQUEyRDs7Ozs7SUFDM0QsdURBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LCBDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIEluamVjdCxcbiAgSW5qZWN0b3IsXG4gIFR5cGUsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbi8vIGltcG9ydCBDb250YWluZXIgPSBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGFpbmVyO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRDb250YWluZXJ9IGZyb20gXCIuLi8uLi90b2tlbnMvZ29sZGVuLWxheW91dC1jb250YWluZXIudG9rZW5cIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0SXRlbUNvbXBvbmVudFJlc29sdmVyfSBmcm9tIFwiLi4vLi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtaXRlbS1jb21wb25lbnQtZmFjdG9yeS50b2tlblwiO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZn0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0SXRlbX0gZnJvbSBcIi4uLy4uL2dvbGRlbi1sYXlvdXQtaXRlbVwiO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVzb2x2ZXIsXG4gIElDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gIElDb21wb25lbnRUeXBlUmVzb2x2ZXIsXG4gIElHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uXG59IGZyb20gJy4uLy4uL21vZGVscy9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbn0gZnJvbSAnLi4vLi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtY29uZmlndXJhdGlvbi50b2tlbic7XG5pbXBvcnQge0RlZmF1bHRMYWJlbHN9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0LmNvbXBvbmVudCc7XG5pbXBvcnQge0lHb2xkZW5MYXlvdXRJdGVtfSBmcm9tICcuLi8uLi9tb2RlbHMvZ29sZGVuLWxheW91dC1pdGVtJztcblxuZW51bSBMb2FkQ29tcG9uZW50U3RhdGUge1xuICBMb2FkaW5nLFxuICBTdWNjZXNzLFxuICBGYWlsZWRcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdnb2xkZW4tbGF5b3V0LWl0ZW0tY29udGFpbmVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHN0eWxlVXJsczogWydnb2xkZW4tbGF5b3V0LWl0ZW0tY29udGFpbmVyLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgR29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lckNvbXBvbmVudCBleHRlbmRzIEdvbGRlbkxheW91dEl0ZW0ge1xuICAgIEBWaWV3Q2hpbGQoXCJjb21wb25lbnRDb250YWluZXJcIiwge3JlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZX0pIGNvbXBvbmVudENvbnRhaW5lcjtcbiAgICBwcml2YXRlIF9sYXlvdXRJdGVtOiBJR29sZGVuTGF5b3V0SXRlbTtcbiAgICBwcm90ZWN0ZWQgX3RhYkVsZW1lbnQ6IEpRdWVyeTtcbiAgICBsb2FkQ29tcG9uZW50U3RhdGU6IExvYWRDb21wb25lbnRTdGF0ZTtcbiAgICBMb2FkQ29tcG9uZW50U3RhdGUgPSBMb2FkQ29tcG9uZW50U3RhdGU7XG5cbiAgICBnZXQgbG9hZGluZ0xhYmVsKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgICByZXR1cm4gKHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzICYmIHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzLmxvYWRpbmcpXG4gICAgICAgID8gdGhpcy5fY29uZmlndXJhdGlvbi5sYWJlbHMubG9hZGluZ1xuICAgICAgICA6IERlZmF1bHRMYWJlbHMubG9hZGluZztcbiAgICB9XG5cbiAgICBnZXQgZmFpbGVkVG9Mb2FkTGFiZWwoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICAgIHJldHVybiAodGhpcy5fY29uZmlndXJhdGlvbi5sYWJlbHMgJiYgdGhpcy5fY29uZmlndXJhdGlvbi5sYWJlbHMuZmFpbGVkVG9Mb2FkQ29tcG9uZW50KVxuICAgICAgICA/IHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzLmZhaWxlZFRvTG9hZENvbXBvbmVudFxuICAgICAgICA6IERlZmF1bHRMYWJlbHMuZmFpbGVkVG9Mb2FkQ29tcG9uZW50O1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKEBJbmplY3QoR29sZGVuTGF5b3V0Q29udGFpbmVyKSBwcm90ZWN0ZWQgX2NvbnRhaW5lcjogYW55LFxuICAgICAgICAgICAgICAgIEBJbmplY3QoR29sZGVuTGF5b3V0SXRlbUNvbXBvbmVudFJlc29sdmVyKSBwcml2YXRlIF9jb21wb25lbnRSZXNvbHZlcjogQ29tcG9uZW50UmVzb2x2ZXIsXG4gICAgICAgICAgICAgICAgQEluamVjdChHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uKSBwcml2YXRlIF9jb25maWd1cmF0aW9uOiBJR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICBwcml2YXRlIF9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoX2luamVjdG9yKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZXRUaXRsZShvZignJykpOyAvLyBmaXhcbiAgICAgICAgdGhpcy5zZXRUaXRsZSh0aGlzLmxvYWRpbmdMYWJlbCk7XG5cbiAgICAgICAgaWYgKCh0aGlzLl9jb21wb25lbnRSZXNvbHZlciBhcyBJQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKS5mYWN0b3J5ICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmxvYWRDb21wb25lbnRTdGF0ZSA9IExvYWRDb21wb25lbnRTdGF0ZS5Mb2FkaW5nO1xuXG4gICAgICAgICAgKHRoaXMuX2NvbXBvbmVudFJlc29sdmVyIGFzIElDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpLmZhY3RvcnkoKVxuICAgICAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgIG5leHQ6IChmYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlKG9mKHRoaXMuX2NvbXBvbmVudFJlc29sdmVyLmNvbXBvbmVudE5hbWUpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSB0aGlzLmNvbXBvbmVudENvbnRhaW5lci5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSwgdW5kZWZpbmVkLCB0aGlzLl9pbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgcmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0gPSByZWYuaW5zdGFuY2UgYXMgSUdvbGRlbkxheW91dEl0ZW07XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdGFiRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vblRhYkNyZWF0ZWQodGhpcy5fdGFiRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkQ29tcG9uZW50U3RhdGUgPSBMb2FkQ29tcG9uZW50U3RhdGUuU3VjY2VzcztcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXJyb3I6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRDb21wb25lbnRTdGF0ZSA9IExvYWRDb21wb25lbnRTdGF0ZS5GYWlsZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZSh0aGlzLmZhaWxlZFRvTG9hZExhYmVsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRUaXRsZShvZih0aGlzLl9jb21wb25lbnRSZXNvbHZlci5jb21wb25lbnROYW1lKSk7XG5cbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gdGhpcy5fY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KCh0aGlzLl9jb21wb25lbnRSZXNvbHZlciBhcyBJQ29tcG9uZW50VHlwZVJlc29sdmVyKS5jb21wb25lbnQpO1xuICAgICAgICAgIGNvbnN0IHJlZiA9IHRoaXMuY29tcG9uZW50Q29udGFpbmVyLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRGYWN0b3J5LCB1bmRlZmluZWQsIHRoaXMuX2luamVjdG9yKTtcbiAgICAgICAgICByZWYuY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuXG4gICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbSA9IHJlZi5pbnN0YW5jZSBhcyBJR29sZGVuTGF5b3V0SXRlbTtcblxuICAgICAgICAgIGlmICh0aGlzLl90YWJFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRJdGVtLm9uVGFiQ3JlYXRlZCh0aGlzLl90YWJFbGVtZW50KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxvYWRDb21wb25lbnRTdGF0ZSA9IExvYWRDb21wb25lbnRTdGF0ZS5TdWNjZXNzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2F2ZVN0YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0SXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dEl0ZW0uc2F2ZVN0YXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgb25SZXNpemUoKSB7XG4gICAgICAgIGlmICh0aGlzLl9sYXlvdXRJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRJdGVtLm9uUmVzaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLl9sYXlvdXRJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRJdGVtLm9uU2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25IaWRlKCkge1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0SXRlbSkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vbkhpZGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uVGFiQ3JlYXRlZCh0YWJFbGVtZW50OiBKUXVlcnkpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xheW91dEl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0ub25UYWJDcmVhdGVkKHRhYkVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGFiRWxlbWVudCA9IHRhYkVsZW1lbnQ7XG5cbiAgICB9XG5cbiAgICBvbkNvbnRhaW5lck1heGltaXplZChpc093bkNvbnRhaW5lcjogYm9vbGVhbikge1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0SXRlbSkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vbkNvbnRhaW5lck1heGltaXplZChpc093bkNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkNvbnRhaW5lck1pbmltaXplZChpc093bkNvbnRhaW5lcjogYm9vbGVhbikge1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0SXRlbSkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vbkNvbnRhaW5lck1pbmltaXplZChpc093bkNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICB9XG5cbn1cbiJdfQ==