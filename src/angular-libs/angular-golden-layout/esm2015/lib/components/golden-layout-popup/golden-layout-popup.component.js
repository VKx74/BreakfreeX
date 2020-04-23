/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout-popup/golden-layout-popup.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { ApplicationRef, Component, Inject, Injectable, Injector, SkipSelf, ViewChild } from '@angular/core';
import { GoldenLayoutComponent } from '../../components/golden-layout/golden-layout.component';
import { takeUntil } from 'rxjs/operators';
import { PopupWindowConfigKey } from '../../popup-window-manager';
import { GoldenLayoutComponentConfiguration } from '../../tokens/golden-layout-configuration.token';
import { Subject } from 'rxjs';
export class __Holder {
    /**
     * @param {?} configuration
     */
    constructor(configuration) {
        this.configuration = configuration;
    }
}
__Holder.decorators = [
    { type: Injectable }
];
/** @nocollapse */
__Holder.ctorParameters = () => [
    { type: undefined, decorators: [{ type: SkipSelf }, { type: Inject, args: [GoldenLayoutComponentConfiguration,] }] }
];
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
    const configuration = holder.configuration;
    /** @type {?} */
    const popupConfiguration = (/** @type {?} */ (((/** @type {?} */ (window)))[PopupWindowConfigKey]));
    return (/** @type {?} */ ({
        settings: Object.assign({}, configuration.settings, { popinHandler: (/**
             * @param {?} componentConfig
             * @return {?}
             */
            (componentConfig) => {
                delete componentConfig['width'];
                popupConfiguration.popin(componentConfig);
            }) }),
        labels: configuration.labels,
        components: configuration.components
    }));
}
export class GoldenLayoutPopupComponent {
    /**
     * @param {?} _appRef
     */
    constructor(_appRef) {
        this._appRef = _appRef;
        this._suppressChangeDetection = false;
        this._destroy = new Subject();
        /** @type {?} */
        const popupConfiguration = (/** @type {?} */ (((/** @type {?} */ (window)))[PopupWindowConfigKey]));
        popupConfiguration.needRunChangeDetection
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        () => {
            this._suppressChangeDetection = true;
            this._appRef.tick();
            this._suppressChangeDetection = false;
        }));
        this._popupConfiguration = popupConfiguration;
        this._componentConfig = popupConfiguration.componentConfig;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (!this._suppressChangeDetection) {
            this._popupConfiguration.runChangeDetectionInRootWindow();
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.layout.loadState(GoldenLayoutComponent.getSingleComponentLayoutConfig(this._componentConfig));
        this.layout.$stateChanged
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        () => {
            if (this.layout.getAllComponents().length === 0) {
                window.close();
                return;
            }
            this._popupConfiguration.fireStateChanged();
        }));
        this._popupConfiguration.onLayoutCreated(this.layout);
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
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
GoldenLayoutPopupComponent.ctorParameters = () => [
    { type: ApplicationRef }
];
GoldenLayoutPopupComponent.propDecorators = {
    layout: [{ type: ViewChild, args: [GoldenLayoutComponent, { static: false },] }]
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC1wb3B1cC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0LXBvcHVwL2dvbGRlbi1sYXlvdXQtcG9wdXAuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVUsUUFBUSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVuSCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3REFBd0QsQ0FBQztBQUM3RixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxFQUVMLG9CQUFvQixFQUNyQixNQUFNLDRCQUE0QixDQUFDO0FBRXBDLE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLGdEQUFnRCxDQUFDO0FBQ2xHLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHN0IsTUFBTSxPQUFPLFFBQVE7Ozs7SUFDbkIsWUFBMkUsYUFBYTtRQUFiLGtCQUFhLEdBQWIsYUFBYSxDQUFBO0lBQ3hGLENBQUM7OztZQUhGLFVBQVU7Ozs7NENBRUksUUFBUSxZQUFJLE1BQU0sU0FBQyxrQ0FBa0M7Ozs7SUFBdEQsaUNBQTRFOzs7Ozs7O0FBSzFGLE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxRQUFrQixFQUFFLE1BQWdCOztVQUNqRSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWE7O1VBQ3BDLGtCQUFrQixHQUFHLG1CQUFBLENBQUMsbUJBQUEsTUFBTSxFQUFPLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFzQjtJQUV0RixPQUFPLG1CQUFBO1FBQ0wsUUFBUSxvQkFDSCxhQUFhLENBQUMsUUFBUSxJQUN6QixZQUFZOzs7O1lBQUUsQ0FBQyxl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Q2xELDhDQUFpQzs7Ozs7SUFFckIsNkNBQStCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBsaWNhdGlvblJlZiwgQ29tcG9uZW50LCBJbmplY3QsIEluamVjdGFibGUsIEluamVjdG9yLCBPbkluaXQsIFNraXBTZWxmLCBWaWV3Q2hpbGR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbiwgSUdvbGRlbkxheW91dENvbXBvbmVudFNldHRpbmdzfSBmcm9tICcuLi8uLi9tb2RlbHMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50JztcbmltcG9ydCB7dGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBJUG9wdXBXaW5kb3dDb25maWcsXG4gIFBvcHVwV2luZG93Q29uZmlnS2V5XG59IGZyb20gJy4uLy4uL3BvcHVwLXdpbmRvdy1tYW5hZ2VyJztcbmltcG9ydCBDb21wb25lbnRDb25maWcgPSBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29tcG9uZW50Q29uZmlnO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9ufSBmcm9tICcuLi8uLi90b2tlbnMvZ29sZGVuLWxheW91dC1jb25maWd1cmF0aW9uLnRva2VuJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBfX0hvbGRlciB7XG4gIGNvbnN0cnVjdG9yKEBTa2lwU2VsZigpIEBJbmplY3QoR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbikgcHVibGljIGNvbmZpZ3VyYXRpb24pIHtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmF0aW9uRmFjdG9yeShpbmplY3RvcjogSW5qZWN0b3IsIGhvbGRlcjogX19Ib2xkZXIpIHtcbiAgY29uc3QgY29uZmlndXJhdGlvbiA9IGhvbGRlci5jb25maWd1cmF0aW9uO1xuICBjb25zdCBwb3B1cENvbmZpZ3VyYXRpb24gPSAod2luZG93IGFzIGFueSlbUG9wdXBXaW5kb3dDb25maWdLZXldIGFzIElQb3B1cFdpbmRvd0NvbmZpZztcblxuICByZXR1cm4ge1xuICAgIHNldHRpbmdzOiB7XG4gICAgICAuLi5jb25maWd1cmF0aW9uLnNldHRpbmdzLFxuICAgICAgcG9waW5IYW5kbGVyOiAoY29tcG9uZW50Q29uZmlnOiBDb21wb25lbnRDb25maWcpID0+IHtcbiAgICAgICAgZGVsZXRlIGNvbXBvbmVudENvbmZpZ1snd2lkdGgnXTtcbiAgICAgICAgcG9wdXBDb25maWd1cmF0aW9uLnBvcGluKGNvbXBvbmVudENvbmZpZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsYWJlbHM6IGNvbmZpZ3VyYXRpb24ubGFiZWxzLFxuICAgIGNvbXBvbmVudHM6IGNvbmZpZ3VyYXRpb24uY29tcG9uZW50c1xuICB9IGFzIElHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdnb2xkZW4tbGF5b3V0LXBvcHVwJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2dvbGRlbi1sYXlvdXQtcG9wdXAuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9nb2xkZW4tbGF5b3V0LXBvcHVwLmNvbXBvbmVudC5zY3NzJ10sXG4gIHByb3ZpZGVyczogW1xuICAgIF9fSG9sZGVyLFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEdvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb24sXG4gICAgICB1c2VGYWN0b3J5OiBjb25maWd1cmF0aW9uRmFjdG9yeSxcbiAgICAgIGRlcHM6IFtcbiAgICAgICAgSW5qZWN0b3IsXG4gICAgICAgIF9fSG9sZGVyXG4gICAgICBdXG4gICAgfVxuICBdXG59KVxuZXhwb3J0IGNsYXNzIEdvbGRlbkxheW91dFBvcHVwQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZChHb2xkZW5MYXlvdXRDb21wb25lbnQsIHtzdGF0aWM6IGZhbHNlfSkgbGF5b3V0OiBHb2xkZW5MYXlvdXRDb21wb25lbnQ7XG5cbiAgcHJpdmF0ZSBfcG9wdXBDb25maWd1cmF0aW9uOiBJUG9wdXBXaW5kb3dDb25maWc7XG4gIHByaXZhdGUgX2NvbXBvbmVudENvbmZpZzogYW55O1xuICBwcml2YXRlIF9zdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIF9kZXN0cm95ID0gbmV3IFN1YmplY3QoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9hcHBSZWY6IEFwcGxpY2F0aW9uUmVmKSB7XG4gICAgY29uc3QgcG9wdXBDb25maWd1cmF0aW9uID0gKHdpbmRvdyBhcyBhbnkpW1BvcHVwV2luZG93Q29uZmlnS2V5XSBhcyBJUG9wdXBXaW5kb3dDb25maWc7XG5cbiAgICBwb3B1cENvbmZpZ3VyYXRpb24ubmVlZFJ1bkNoYW5nZURldGVjdGlvblxuICAgICAgLnBpcGUoXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYXBwUmVmLnRpY2soKTtcbiAgICAgICAgdGhpcy5fc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24gPSBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5fcG9wdXBDb25maWd1cmF0aW9uID0gcG9wdXBDb25maWd1cmF0aW9uO1xuICAgIHRoaXMuX2NvbXBvbmVudENvbmZpZyA9IHBvcHVwQ29uZmlndXJhdGlvbi5jb21wb25lbnRDb25maWc7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBpZiAoIXRoaXMuX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uKSB7XG4gICAgICB0aGlzLl9wb3B1cENvbmZpZ3VyYXRpb24ucnVuQ2hhbmdlRGV0ZWN0aW9uSW5Sb290V2luZG93KCk7XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMubGF5b3V0LmxvYWRTdGF0ZShHb2xkZW5MYXlvdXRDb21wb25lbnQuZ2V0U2luZ2xlQ29tcG9uZW50TGF5b3V0Q29uZmlnKHRoaXMuX2NvbXBvbmVudENvbmZpZykpO1xuICAgIHRoaXMubGF5b3V0LiRzdGF0ZUNoYW5nZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95KSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5sYXlvdXQuZ2V0QWxsQ29tcG9uZW50cygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BvcHVwQ29uZmlndXJhdGlvbi5maXJlU3RhdGVDaGFuZ2VkKCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX3BvcHVwQ29uZmlndXJhdGlvbi5vbkxheW91dENyZWF0ZWQodGhpcy5sYXlvdXQpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveS5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveS5jb21wbGV0ZSgpO1xuICB9XG59XG4iXX0=