/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout-item-container/golden-layout-item-container.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { Component, ComponentFactoryResolver, Inject, Injector, ViewChild, ViewContainerRef } from '@angular/core';
// import Container = GoldenLayoutNamespace.Container;
import { GoldenLayoutContainer } from "../../tokens/golden-layout-container.token";
import { GoldenLayoutItemComponentResolver } from "../../tokens/golden-layout-item-component-factory.token";
import { of } from "rxjs";
import { GoldenLayoutItem } from "../../golden-layout-item";
import { GoldenLayoutComponentConfiguration } from '../../tokens/golden-layout-configuration.token';
import { DefaultLabels } from '../../components/golden-layout/golden-layout.component';
/** @enum {number} */
var LoadComponentState = {
    Loading: 0,
    Success: 1,
    Failed: 2,
};
LoadComponentState[LoadComponentState.Loading] = 'Loading';
LoadComponentState[LoadComponentState.Success] = 'Success';
LoadComponentState[LoadComponentState.Failed] = 'Failed';
var GoldenLayoutItemContainerComponent = /** @class */ (function (_super) {
    tslib_1.__extends(GoldenLayoutItemContainerComponent, _super);
    function GoldenLayoutItemContainerComponent(_container, _componentResolver, _configuration, _componentFactoryResolver, _injector) {
        var _this = _super.call(this, _injector) || this;
        _this._container = _container;
        _this._componentResolver = _componentResolver;
        _this._configuration = _configuration;
        _this._componentFactoryResolver = _componentFactoryResolver;
        _this._injector = _injector;
        _this.LoadComponentState = LoadComponentState;
        return _this;
    }
    Object.defineProperty(GoldenLayoutItemContainerComponent.prototype, "loadingLabel", {
        get: /**
         * @return {?}
         */
        function () {
            return (this._configuration.labels && this._configuration.labels.loading)
                ? this._configuration.labels.loading
                : DefaultLabels.loading;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoldenLayoutItemContainerComponent.prototype, "failedToLoadLabel", {
        get: /**
         * @return {?}
         */
        function () {
            return (this._configuration.labels && this._configuration.labels.failedToLoadComponent)
                ? this._configuration.labels.failedToLoadComponent
                : DefaultLabels.failedToLoadComponent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
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
                function (factory) {
                    _this.setTitle(of(_this._componentResolver.componentName));
                    /** @type {?} */
                    var ref = _this.componentContainer.createComponent(factory, undefined, _this._injector);
                    ref.changeDetectorRef.detectChanges();
                    _this._layoutItem = (/** @type {?} */ (ref.instance));
                    if (_this._tabElement) {
                        _this._layoutItem.onTabCreated(_this._tabElement);
                    }
                    _this.loadComponentState = LoadComponentState.Success;
                }),
                error: (/**
                 * @param {?} e
                 * @return {?}
                 */
                function (e) {
                    console.error(e);
                    _this.loadComponentState = LoadComponentState.Failed;
                    _this.setTitle(_this.failedToLoadLabel);
                })
            });
        }
        else {
            this.setTitle(of(this._componentResolver.componentName));
            /** @type {?} */
            var componentFactory = this._componentFactoryResolver.resolveComponentFactory(((/** @type {?} */ (this._componentResolver))).component);
            /** @type {?} */
            var ref = this.componentContainer.createComponent(componentFactory, undefined, this._injector);
            ref.changeDetectorRef.detectChanges();
            this._layoutItem = (/** @type {?} */ (ref.instance));
            if (this._tabElement) {
                this._layoutItem.onTabCreated(this._tabElement);
            }
            this.loadComponentState = LoadComponentState.Success;
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.saveState = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            return this._layoutItem.saveState();
        }
        return {};
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onResize = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            this._layoutItem.onResize();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onShow = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            this._layoutItem.onShow();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onHide = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            this._layoutItem.onHide();
        }
    };
    /**
     * @param {?} tabElement
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onTabCreated = /**
     * @param {?} tabElement
     * @return {?}
     */
    function (tabElement) {
        if (this._layoutItem) {
            this._layoutItem.onTabCreated(tabElement);
        }
        this._tabElement = tabElement;
    };
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onContainerMaximized = /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    function (isOwnContainer) {
        if (this._layoutItem) {
            this._layoutItem.onContainerMaximized(isOwnContainer);
        }
    };
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onContainerMinimized = /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    function (isOwnContainer) {
        if (this._layoutItem) {
            this._layoutItem.onContainerMinimized(isOwnContainer);
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
    };
    GoldenLayoutItemContainerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'golden-layout-item-container',
                    template: "<div class=\"root\">\n    <div class=\"component-wrapper\">\n        <div class=\"loader-wrapper flex align-items-center justify-content-center\" *ngIf=\"loadComponentState === LoadComponentState.Failed || loadComponentState === LoadComponentState.Loading\">\n            <span *ngIf=\"loadComponentState === LoadComponentState.Loading\">{{loadingLabel | async}}</span>\n            <span *ngIf=\"loadComponentState === LoadComponentState.Failed\">{{failedToLoadLabel | async}}</span>\n        </div>\n        <template #componentContainer></template>\n    </div>\n</div>\n",
                    styles: [".component-wrapper,.loader-wrapper,.root{width:100%;height:100%}.loader-wrapper span{font-size:14px}template+*{width:100%;height:100%}"]
                }] }
    ];
    /** @nocollapse */
    GoldenLayoutItemContainerComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutContainer,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutItemComponentResolver,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentConfiguration,] }] },
        { type: ComponentFactoryResolver },
        { type: Injector }
    ]; };
    GoldenLayoutItemContainerComponent.propDecorators = {
        componentContainer: [{ type: ViewChild, args: ["componentContainer", { read: ViewContainerRef, static: true },] }]
    };
    return GoldenLayoutItemContainerComponent;
}(GoldenLayoutItem));
export { GoldenLayoutItemContainerComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0LWl0ZW0tY29udGFpbmVyL2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQW9CLHdCQUF3QixFQUNyRCxNQUFNLEVBQ04sUUFBUSxFQUVSLFNBQVMsRUFDVCxnQkFBZ0IsRUFDakIsTUFBTSxlQUFlLENBQUM7O0FBRXZCLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDRDQUE0QyxDQUFDO0FBQ2pGLE9BQU8sRUFBQyxpQ0FBaUMsRUFBQyxNQUFNLHlEQUF5RCxDQUFDO0FBQzFHLE9BQU8sRUFBYSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFPMUQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDbEcsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdEQUF3RCxDQUFDOztBQUdyRixJQUFLLGtCQUFrQjtJQUNyQixPQUFPLEdBQUE7SUFDUCxPQUFPLEdBQUE7SUFDUCxNQUFNLEdBQUE7RUFDUDs7OztBQUVEO0lBS3dELDhEQUFnQjtJQW1CcEUsNENBQXFELFVBQWUsRUFDTCxrQkFBcUMsRUFDcEMsY0FBbUQsRUFDL0YseUJBQW1ELEVBQ25ELFNBQW1CO1FBSnZDLFlBS0ksa0JBQU0sU0FBUyxDQUFDLFNBQ25CO1FBTm9ELGdCQUFVLEdBQVYsVUFBVSxDQUFLO1FBQ0wsd0JBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNwQyxvQkFBYyxHQUFkLGNBQWMsQ0FBcUM7UUFDL0YsK0JBQXlCLEdBQXpCLHlCQUF5QixDQUEwQjtRQUNuRCxlQUFTLEdBQVQsU0FBUyxDQUFVO1FBbEJ2Qyx3QkFBa0IsR0FBRyxrQkFBa0IsQ0FBQzs7SUFvQnhDLENBQUM7SUFsQkQsc0JBQUksNERBQVk7Ozs7UUFBaEI7WUFDRSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUN2RSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTztnQkFDcEMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDNUIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxpRUFBaUI7Ozs7UUFBckI7WUFDRSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUM7Z0JBQ3JGLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUI7Z0JBQ2xELENBQUMsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUM7UUFDMUMsQ0FBQzs7O09BQUE7Ozs7SUFVRCxxREFBUTs7O0lBQVI7UUFBQSxpQkEyQ0M7UUExQ0csSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFakMsSUFBSSxDQUFDLG1CQUFBLElBQUksQ0FBQyxrQkFBa0IsRUFBNkIsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDMUUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztZQUVyRCxDQUFDLG1CQUFBLElBQUksQ0FBQyxrQkFBa0IsRUFBNkIsQ0FBQyxDQUFDLE9BQU8sRUFBRTtpQkFDN0QsU0FBUyxDQUFDO2dCQUNULElBQUk7Ozs7Z0JBQUUsVUFBQyxPQUE4QjtvQkFDbkMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7O3dCQUNuRCxHQUFHLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ3ZGLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFFdEMsS0FBSSxDQUFDLFdBQVcsR0FBRyxtQkFBQSxHQUFHLENBQUMsUUFBUSxFQUFxQixDQUFDO29CQUVyRCxJQUFJLEtBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ3BCLEtBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDakQ7b0JBRUQsS0FBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztnQkFDdkQsQ0FBQyxDQUFBO2dCQUNELEtBQUs7Ozs7Z0JBQUUsVUFBQyxDQUFDO29CQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLEtBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7b0JBQ3BELEtBQUksQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQTthQUNGLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzs7Z0JBRW5ELGdCQUFnQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLG1CQUFBLElBQUksQ0FBQyxrQkFBa0IsRUFBMEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs7Z0JBQ3hJLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2hHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUV0QyxJQUFJLENBQUMsV0FBVyxHQUFHLG1CQUFBLEdBQUcsQ0FBQyxRQUFRLEVBQXFCLENBQUM7WUFFckQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDakQ7WUFFRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDO1NBQ3REO0lBQ0wsQ0FBQzs7OztJQUVELHNEQUFTOzs7SUFBVDtRQUNJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDdkM7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7Ozs7SUFFRCxxREFBUTs7O0lBQVI7UUFDSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMvQjtJQUNMLENBQUM7Ozs7SUFFRCxtREFBTTs7O0lBQU47UUFDSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM3QjtJQUNMLENBQUM7Ozs7SUFFRCxtREFBTTs7O0lBQU47UUFDSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM3QjtJQUNMLENBQUM7Ozs7O0lBRUQseURBQVk7Ozs7SUFBWixVQUFhLFVBQWtCO1FBQzNCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM3QztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBRWxDLENBQUM7Ozs7O0lBRUQsaUVBQW9COzs7O0lBQXBCLFVBQXFCLGNBQXVCO1FBQ3hDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQzs7Ozs7SUFFRCxpRUFBb0I7Ozs7SUFBcEIsVUFBcUIsY0FBdUI7UUFDeEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDekQ7SUFDTCxDQUFDOzs7O0lBRUQsd0RBQVc7OztJQUFYO0lBQ0EsQ0FBQzs7Z0JBN0hKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsOEJBQThCO29CQUN4Qyx5a0JBQTBEOztpQkFFN0Q7Ozs7Z0RBb0JnQixNQUFNLFNBQUMscUJBQXFCO2dEQUM1QixNQUFNLFNBQUMsaUNBQWlDO2dEQUN4QyxNQUFNLFNBQUMsa0NBQWtDO2dCQXREM0Isd0JBQXdCO2dCQUVyRCxRQUFROzs7cUNBZ0NMLFNBQVMsU0FBQyxvQkFBb0IsRUFBRSxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDOztJQXlIM0UseUNBQUM7Q0FBQSxBQS9IRCxDQUt3RCxnQkFBZ0IsR0EwSHZFO1NBMUhZLGtDQUFrQzs7O0lBQzNDLGdFQUE0Rjs7Ozs7SUFDNUYseURBQXVDOzs7OztJQUN2Qyx5REFBOEI7O0lBQzlCLGdFQUF1Qzs7SUFDdkMsZ0VBQXdDOzs7OztJQWM1Qix3REFBd0Q7Ozs7O0lBQ3hELGdFQUF3Rjs7Ozs7SUFDeEYsNERBQXVHOzs7OztJQUN2Ryx1RUFBMkQ7Ozs7O0lBQzNELHVEQUEyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCwgQ29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBUeXBlLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWZcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4vLyBpbXBvcnQgQ29udGFpbmVyID0gR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRhaW5lcjtcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29udGFpbmVyfSBmcm9tIFwiLi4vLi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtY29udGFpbmVyLnRva2VuXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dEl0ZW1Db21wb25lbnRSZXNvbHZlcn0gZnJvbSBcIi4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWl0ZW0tY29tcG9uZW50LWZhY3RvcnkudG9rZW5cIjtcbmltcG9ydCB7T2JzZXJ2YWJsZSwgb2Z9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dEl0ZW19IGZyb20gXCIuLi8uLi9nb2xkZW4tbGF5b3V0LWl0ZW1cIjtcbmltcG9ydCB7XG4gIENvbXBvbmVudFJlc29sdmVyLFxuICBJQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBJQ29tcG9uZW50VHlwZVJlc29sdmVyLFxuICBJR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvblxufSBmcm9tICcuLi8uLi9tb2RlbHMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb259IGZyb20gJy4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWNvbmZpZ3VyYXRpb24udG9rZW4nO1xuaW1wb3J0IHtEZWZhdWx0TGFiZWxzfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC5jb21wb25lbnQnO1xuaW1wb3J0IHtJR29sZGVuTGF5b3V0SXRlbX0gZnJvbSAnLi4vLi4vbW9kZWxzL2dvbGRlbi1sYXlvdXQtaXRlbSc7XG5cbmVudW0gTG9hZENvbXBvbmVudFN0YXRlIHtcbiAgTG9hZGluZyxcbiAgU3VjY2VzcyxcbiAgRmFpbGVkXG59XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lcicsXG4gICAgdGVtcGxhdGVVcmw6ICdnb2xkZW4tbGF5b3V0LWl0ZW0tY29udGFpbmVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFsnZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lci5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIEdvbGRlbkxheW91dEl0ZW1Db250YWluZXJDb21wb25lbnQgZXh0ZW5kcyBHb2xkZW5MYXlvdXRJdGVtIHtcbiAgICBAVmlld0NoaWxkKFwiY29tcG9uZW50Q29udGFpbmVyXCIsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmLCBzdGF0aWM6IHRydWV9KSBjb21wb25lbnRDb250YWluZXI7XG4gICAgcHJpdmF0ZSBfbGF5b3V0SXRlbTogSUdvbGRlbkxheW91dEl0ZW07XG4gICAgcHJvdGVjdGVkIF90YWJFbGVtZW50OiBKUXVlcnk7XG4gICAgbG9hZENvbXBvbmVudFN0YXRlOiBMb2FkQ29tcG9uZW50U3RhdGU7XG4gICAgTG9hZENvbXBvbmVudFN0YXRlID0gTG9hZENvbXBvbmVudFN0YXRlO1xuXG4gICAgZ2V0IGxvYWRpbmdMYWJlbCgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgICAgcmV0dXJuICh0aGlzLl9jb25maWd1cmF0aW9uLmxhYmVscyAmJiB0aGlzLl9jb25maWd1cmF0aW9uLmxhYmVscy5sb2FkaW5nKVxuICAgICAgICA/IHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzLmxvYWRpbmdcbiAgICAgICAgOiBEZWZhdWx0TGFiZWxzLmxvYWRpbmc7XG4gICAgfVxuXG4gICAgZ2V0IGZhaWxlZFRvTG9hZExhYmVsKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgICByZXR1cm4gKHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzICYmIHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzLmZhaWxlZFRvTG9hZENvbXBvbmVudClcbiAgICAgICAgPyB0aGlzLl9jb25maWd1cmF0aW9uLmxhYmVscy5mYWlsZWRUb0xvYWRDb21wb25lbnRcbiAgICAgICAgOiBEZWZhdWx0TGFiZWxzLmZhaWxlZFRvTG9hZENvbXBvbmVudDtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihASW5qZWN0KEdvbGRlbkxheW91dENvbnRhaW5lcikgcHJvdGVjdGVkIF9jb250YWluZXI6IGFueSxcbiAgICAgICAgICAgICAgICBASW5qZWN0KEdvbGRlbkxheW91dEl0ZW1Db21wb25lbnRSZXNvbHZlcikgcHJpdmF0ZSBfY29tcG9uZW50UmVzb2x2ZXI6IENvbXBvbmVudFJlc29sdmVyLFxuICAgICAgICAgICAgICAgIEBJbmplY3QoR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbikgcHJpdmF0ZSBfY29uZmlndXJhdGlvbjogSUdvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBfY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKF9pbmplY3Rvcik7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMuc2V0VGl0bGUob2YoJycpKTsgLy8gZml4XG4gICAgICAgIHRoaXMuc2V0VGl0bGUodGhpcy5sb2FkaW5nTGFiZWwpO1xuXG4gICAgICAgIGlmICgodGhpcy5fY29tcG9uZW50UmVzb2x2ZXIgYXMgSUNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikuZmFjdG9yeSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5sb2FkQ29tcG9uZW50U3RhdGUgPSBMb2FkQ29tcG9uZW50U3RhdGUuTG9hZGluZztcblxuICAgICAgICAgICh0aGlzLl9jb21wb25lbnRSZXNvbHZlciBhcyBJQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKS5mYWN0b3J5KClcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICBuZXh0OiAoZmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZShvZih0aGlzLl9jb21wb25lbnRSZXNvbHZlci5jb21wb25lbnROYW1lKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gdGhpcy5jb21wb25lbnRDb250YWluZXIuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnksIHVuZGVmaW5lZCwgdGhpcy5faW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgIHJlZi5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9sYXlvdXRJdGVtID0gcmVmLmluc3RhbmNlIGFzIElHb2xkZW5MYXlvdXRJdGVtO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3RhYkVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0ub25UYWJDcmVhdGVkKHRoaXMuX3RhYkVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubG9hZENvbXBvbmVudFN0YXRlID0gTG9hZENvbXBvbmVudFN0YXRlLlN1Y2Nlc3M7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGVycm9yOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkQ29tcG9uZW50U3RhdGUgPSBMb2FkQ29tcG9uZW50U3RhdGUuRmFpbGVkO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGUodGhpcy5mYWlsZWRUb0xvYWRMYWJlbCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0VGl0bGUob2YodGhpcy5fY29tcG9uZW50UmVzb2x2ZXIuY29tcG9uZW50TmFtZSkpO1xuXG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeSA9IHRoaXMuX2NvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeSgodGhpcy5fY29tcG9uZW50UmVzb2x2ZXIgYXMgSUNvbXBvbmVudFR5cGVSZXNvbHZlcikuY29tcG9uZW50KTtcbiAgICAgICAgICBjb25zdCByZWYgPSB0aGlzLmNvbXBvbmVudENvbnRhaW5lci5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeSwgdW5kZWZpbmVkLCB0aGlzLl9pbmplY3Rvcik7XG4gICAgICAgICAgcmVmLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcblxuICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0gPSByZWYuaW5zdGFuY2UgYXMgSUdvbGRlbkxheW91dEl0ZW07XG5cbiAgICAgICAgICBpZiAodGhpcy5fdGFiRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vblRhYkNyZWF0ZWQodGhpcy5fdGFiRWxlbWVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2FkQ29tcG9uZW50U3RhdGUgPSBMb2FkQ29tcG9uZW50U3RhdGUuU3VjY2VzcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNhdmVTdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xheW91dEl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYXlvdXRJdGVtLnNhdmVTdGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIG9uUmVzaXplKCkge1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0SXRlbSkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vblJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TaG93KCkge1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0SXRlbSkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbS5vblNob3coKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uSGlkZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xheW91dEl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0ub25IaWRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblRhYkNyZWF0ZWQodGFiRWxlbWVudDogSlF1ZXJ5KSB7XG4gICAgICAgIGlmICh0aGlzLl9sYXlvdXRJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRJdGVtLm9uVGFiQ3JlYXRlZCh0YWJFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RhYkVsZW1lbnQgPSB0YWJFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgb25Db250YWluZXJNYXhpbWl6ZWQoaXNPd25Db250YWluZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2xheW91dEl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0ub25Db250YWluZXJNYXhpbWl6ZWQoaXNPd25Db250YWluZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Db250YWluZXJNaW5pbWl6ZWQoaXNPd25Db250YWluZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2xheW91dEl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuX2xheW91dEl0ZW0ub25Db250YWluZXJNaW5pbWl6ZWQoaXNPd25Db250YWluZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgfVxuXG59XG4iXX0=