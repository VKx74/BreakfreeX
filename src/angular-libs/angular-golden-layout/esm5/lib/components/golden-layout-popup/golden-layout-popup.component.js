/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout-popup/golden-layout-popup.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { ApplicationRef, Component, Inject, Injectable, Injector, SkipSelf, ViewChild } from '@angular/core';
import { GoldenLayoutComponent } from '../../components/golden-layout/golden-layout.component';
import { takeUntil } from 'rxjs/operators';
import { PopupWindowConfigKey } from '../../popup-window-manager';
import { GoldenLayoutComponentConfiguration } from '../../tokens/golden-layout-configuration.token';
import { Subject } from 'rxjs';
var __Holder = /** @class */ (function () {
    function __Holder(configuration) {
        this.configuration = configuration;
    }
    __Holder.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    __Holder.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: SkipSelf }, { type: Inject, args: [GoldenLayoutComponentConfiguration,] }] }
    ]; };
    return __Holder;
}());
export { __Holder };
if (false) {
    /** @type {?} */
    __Holder.prototype.configuration;
}
/**
 * @param {?} injector
 * @param {?} holder
 * @return {?}
 */
export function configurationFactory(injector, holder) {
    /** @type {?} */
    var configuration = holder.configuration;
    /** @type {?} */
    var popupConfiguration = (/** @type {?} */ (((/** @type {?} */ (window)))[PopupWindowConfigKey]));
    return (/** @type {?} */ ({
        settings: tslib_1.__assign({}, configuration.settings, { popinHandler: (/**
             * @param {?} componentConfig
             * @return {?}
             */
            function (componentConfig) {
                delete componentConfig['width'];
                popupConfiguration.popin(componentConfig);
            }) }),
        labels: configuration.labels,
        components: configuration.components
    }));
}
var GoldenLayoutPopupComponent = /** @class */ (function () {
    function GoldenLayoutPopupComponent(_appRef) {
        var _this = this;
        this._appRef = _appRef;
        this._suppressChangeDetection = false;
        this._destroy = new Subject();
        /** @type {?} */
        var popupConfiguration = (/** @type {?} */ (((/** @type {?} */ (window)))[PopupWindowConfigKey]));
        popupConfiguration.needRunChangeDetection
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        function () {
            _this._suppressChangeDetection = true;
            _this._appRef.tick();
            _this._suppressChangeDetection = false;
        }));
        this._popupConfiguration = popupConfiguration;
        this._componentConfig = popupConfiguration.componentConfig;
    }
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (!this._suppressChangeDetection) {
            this._popupConfiguration.runChangeDetectionInRootWindow();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.layout.loadState(GoldenLayoutComponent.getSingleComponentLayoutConfig(this._componentConfig));
        this.layout.$stateChanged
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        function () {
            if (_this.layout.getAllComponents().length === 0) {
                window.close();
                return;
            }
            _this._popupConfiguration.fireStateChanged();
        }));
        this._popupConfiguration.onLayoutCreated(this.layout);
    };
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._destroy.next();
        this._destroy.complete();
    };
    GoldenLayoutPopupComponent.decorators = [
        { type: Component, args: [{
                    selector: 'golden-layout-popup',
                    template: "<golden-layout></golden-layout>\n",
                    providers: [
                        __Holder,
                        {
                            provide: GoldenLayoutComponentConfiguration,
                            useFactory: configurationFactory,
                            deps: [
                                Injector,
                                __Holder
                            ]
                        }
                    ],
                    styles: [":host{display:block;height:100%}:host golden-layout{height:100%}"]
                }] }
    ];
    /** @nocollapse */
    GoldenLayoutPopupComponent.ctorParameters = function () { return [
        { type: ApplicationRef }
    ]; };
    GoldenLayoutPopupComponent.propDecorators = {
        layout: [{ type: ViewChild, args: [GoldenLayoutComponent, { static: false },] }]
    };
    return GoldenLayoutPopupComponent;
}());
export { GoldenLayoutPopupComponent };
if (false) {
    /** @type {?} */
    GoldenLayoutPopupComponent.prototype.layout;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._popupConfiguration;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._componentConfig;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._suppressChangeDetection;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._destroy;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._appRef;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC1wb3B1cC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0LXBvcHVwL2dvbGRlbi1sYXlvdXQtcG9wdXAuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFVLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkgsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0RBQXdELENBQUM7QUFDN0YsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxvQkFBb0IsRUFDckIsTUFBTSw0QkFBNEIsQ0FBQztBQUVwQyxPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSxnREFBZ0QsQ0FBQztBQUNsRyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRTdCO0lBRUUsa0JBQTJFLGFBQWE7UUFBYixrQkFBYSxHQUFiLGFBQWEsQ0FBQTtJQUN4RixDQUFDOztnQkFIRixVQUFVOzs7O2dEQUVJLFFBQVEsWUFBSSxNQUFNLFNBQUMsa0NBQWtDOztJQUVwRSxlQUFDO0NBQUEsQUFKRCxJQUlDO1NBSFksUUFBUTs7O0lBQ1AsaUNBQTRFOzs7Ozs7O0FBSzFGLE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxRQUFrQixFQUFFLE1BQWdCOztRQUNqRSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWE7O1FBQ3BDLGtCQUFrQixHQUFHLG1CQUFBLENBQUMsbUJBQUEsTUFBTSxFQUFPLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFzQjtJQUV0RixPQUFPLG1CQUFBO1FBQ0wsUUFBUSx1QkFDSCxhQUFhLENBQUMsUUFBUSxJQUN6QixZ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Q3JDLDRDQUFpRjs7Ozs7SUFFakYseURBQWdEOzs7OztJQUNoRCxzREFBOEI7Ozs7O0lBQzlCLDhEQUFrRDs7Ozs7SUFDbEQsOENBQWlDOzs7OztJQUVyQiw2Q0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FwcGxpY2F0aW9uUmVmLCBDb21wb25lbnQsIEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0b3IsIE9uSW5pdCwgU2tpcFNlbGYsIFZpZXdDaGlsZH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0lHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uLCBJR29sZGVuTGF5b3V0Q29tcG9uZW50U2V0dGluZ3N9IGZyb20gJy4uLy4uL21vZGVscy9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29tcG9uZW50fSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC5jb21wb25lbnQnO1xuaW1wb3J0IHt0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIElQb3B1cFdpbmRvd0NvbmZpZyxcbiAgUG9wdXBXaW5kb3dDb25maWdLZXlcbn0gZnJvbSAnLi4vLi4vcG9wdXAtd2luZG93LW1hbmFnZXInO1xuaW1wb3J0IENvbXBvbmVudENvbmZpZyA9IEdvbGRlbkxheW91dE5hbWVzcGFjZS5Db21wb25lbnRDb25maWc7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb259IGZyb20gJy4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWNvbmZpZ3VyYXRpb24udG9rZW4nO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIF9fSG9sZGVyIHtcbiAgY29uc3RydWN0b3IoQFNraXBTZWxmKCkgQEluamVjdChHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uKSBwdWJsaWMgY29uZmlndXJhdGlvbikge1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyYXRpb25GYWN0b3J5KGluamVjdG9yOiBJbmplY3RvciwgaG9sZGVyOiBfX0hvbGRlcikge1xuICBjb25zdCBjb25maWd1cmF0aW9uID0gaG9sZGVyLmNvbmZpZ3VyYXRpb247XG4gIGNvbnN0IHBvcHVwQ29uZmlndXJhdGlvbiA9ICh3aW5kb3cgYXMgYW55KVtQb3B1cFdpbmRvd0NvbmZpZ0tleV0gYXMgSVBvcHVwV2luZG93Q29uZmlnO1xuXG4gIHJldHVybiB7XG4gICAgc2V0dGluZ3M6IHtcbiAgICAgIC4uLmNvbmZpZ3VyYXRpb24uc2V0dGluZ3MsXG4gICAgICBwb3BpbkhhbmRsZXI6IChjb21wb25lbnRDb25maWc6IENvbXBvbmVudENvbmZpZykgPT4ge1xuICAgICAgICBkZWxldGUgY29tcG9uZW50Q29uZmlnWyd3aWR0aCddO1xuICAgICAgICBwb3B1cENvbmZpZ3VyYXRpb24ucG9waW4oY29tcG9uZW50Q29uZmlnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxhYmVsczogY29uZmlndXJhdGlvbi5sYWJlbHMsXG4gICAgY29tcG9uZW50czogY29uZmlndXJhdGlvbi5jb21wb25lbnRzXG4gIH0gYXMgSUdvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb247XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dvbGRlbi1sYXlvdXQtcG9wdXAnLFxuICB0ZW1wbGF0ZVVybDogJy4vZ29sZGVuLWxheW91dC1wb3B1cC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2dvbGRlbi1sYXlvdXQtcG9wdXAuY29tcG9uZW50LnNjc3MnXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgX19Ib2xkZXIsXG4gICAge1xuICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbixcbiAgICAgIHVzZUZhY3Rvcnk6IGNvbmZpZ3VyYXRpb25GYWN0b3J5LFxuICAgICAgZGVwczogW1xuICAgICAgICBJbmplY3RvcixcbiAgICAgICAgX19Ib2xkZXJcbiAgICAgIF1cbiAgICB9XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgR29sZGVuTGF5b3V0UG9wdXBDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBAVmlld0NoaWxkKEdvbGRlbkxheW91dENvbXBvbmVudCwge3N0YXRpYzogZmFsc2V9KSBsYXlvdXQ6IEdvbGRlbkxheW91dENvbXBvbmVudDtcblxuICBwcml2YXRlIF9wb3B1cENvbmZpZ3VyYXRpb246IElQb3B1cFdpbmRvd0NvbmZpZztcbiAgcHJpdmF0ZSBfY29tcG9uZW50Q29uZmlnOiBhbnk7XG4gIHByaXZhdGUgX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX2Rlc3Ryb3kgPSBuZXcgU3ViamVjdCgpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2FwcFJlZjogQXBwbGljYXRpb25SZWYpIHtcbiAgICBjb25zdCBwb3B1cENvbmZpZ3VyYXRpb24gPSAod2luZG93IGFzIGFueSlbUG9wdXBXaW5kb3dDb25maWdLZXldIGFzIElQb3B1cFdpbmRvd0NvbmZpZztcblxuICAgIHBvcHVwQ29uZmlndXJhdGlvbi5uZWVkUnVuQ2hhbmdlRGV0ZWN0aW9uXG4gICAgICAucGlwZShcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24gPSB0cnVlO1xuICAgICAgICB0aGlzLl9hcHBSZWYudGljaygpO1xuICAgICAgICB0aGlzLl9zdXBwcmVzc0NoYW5nZURldGVjdGlvbiA9IGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLl9wb3B1cENvbmZpZ3VyYXRpb24gPSBwb3B1cENvbmZpZ3VyYXRpb247XG4gICAgdGhpcy5fY29tcG9uZW50Q29uZmlnID0gcG9wdXBDb25maWd1cmF0aW9uLmNvbXBvbmVudENvbmZpZztcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGlmICghdGhpcy5fc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3BvcHVwQ29uZmlndXJhdGlvbi5ydW5DaGFuZ2VEZXRlY3Rpb25JblJvb3RXaW5kb3coKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5sYXlvdXQubG9hZFN0YXRlKEdvbGRlbkxheW91dENvbXBvbmVudC5nZXRTaW5nbGVDb21wb25lbnRMYXlvdXRDb25maWcodGhpcy5fY29tcG9uZW50Q29uZmlnKSk7XG4gICAgdGhpcy5sYXlvdXQuJHN0YXRlQ2hhbmdlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmxheW91dC5nZXRBbGxDb21wb25lbnRzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcG9wdXBDb25maWd1cmF0aW9uLmZpcmVTdGF0ZUNoYW5nZWQoKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fcG9wdXBDb25maWd1cmF0aW9uLm9uTGF5b3V0Q3JlYXRlZCh0aGlzLmxheW91dCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95Lm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95LmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==