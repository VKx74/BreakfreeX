/**
 * @fileoverview added by tsickle
 * Generated from: lib/popup-window-manager.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Subject } from 'rxjs';
import { JsUtils } from './utils/JsUtils';
/**
 * @record
 */
export function IPopupWindowManagerConfig() { }
if (false) {
    /** @type {?} */
    IPopupWindowManagerConfig.prototype.componentConfig;
    /** @type {?} */
    IPopupWindowManagerConfig.prototype.layoutSettings;
    /** @type {?} */
    IPopupWindowManagerConfig.prototype.popinHandler;
    /** @type {?} */
    IPopupWindowManagerConfig.prototype.popupStateChangedHandler;
    /** @type {?} */
    IPopupWindowManagerConfig.prototype.popupClosedHandler;
    /** @type {?} */
    IPopupWindowManagerConfig.prototype.runChangeDetectionHandler;
}
/**
 * @record
 */
export function IPopupWindowConfig() { }
if (false) {
    /** @type {?} */
    IPopupWindowConfig.prototype.componentConfig;
    /** @type {?} */
    IPopupWindowConfig.prototype.layoutSettings;
    /** @type {?} */
    IPopupWindowConfig.prototype.popin;
    /** @type {?} */
    IPopupWindowConfig.prototype.fireStateChanged;
    /** @type {?} */
    IPopupWindowConfig.prototype.runChangeDetectionInRootWindow;
    /** @type {?} */
    IPopupWindowConfig.prototype.needRunChangeDetection;
    /** @type {?} */
    IPopupWindowConfig.prototype.onLayoutCreated;
}
/** @type {?} */
export var PopupWindowConfigKey = 'popupWindowConfigKey';
var PopupWindowManager = /** @class */ (function () {
    function PopupWindowManager(window, popupConfig) {
        var _this = this;
        this.window = window;
        this.popupConfig = popupConfig;
        this.id = JsUtils.generateGUID();
        this._closedByUser = true;
        this._runChangeDetection$ = new Subject();
        this.window[PopupWindowConfigKey] = (/** @type {?} */ ({
            componentConfig: popupConfig.componentConfig,
            layoutSettings: popupConfig.layoutSettings,
            popin: (/** @type {?} */ (((/**
             * @param {?} compConfig
             * @return {?}
             */
            function (compConfig) {
                popupConfig.popinHandler(compConfig);
            })))),
            fireStateChanged: (/** @type {?} */ (((/**
             * @return {?}
             */
            function () {
                popupConfig.popupStateChangedHandler();
            })))),
            runChangeDetectionInRootWindow: (/**
             * @return {?}
             */
            function () {
                popupConfig.runChangeDetectionHandler();
            }),
            needRunChangeDetection: this._runChangeDetection$.asObservable(),
            onLayoutCreated: (/**
             * @param {?} layout
             * @return {?}
             */
            function (layout) {
                _this._popupLayout = layout;
            })
        }));
        $(this.window).one('load', (/**
         * @return {?}
         */
        function () {
            $(_this.window).one('unload', (/**
             * @return {?}
             */
            function () {
                popupConfig.popupClosedHandler(_this._closedByUser);
                _this.window.close();
            }));
        }));
    }
    /**
     * @param {?} url
     * @return {?}
     */
    PopupWindowManager.openWindow = /**
     * @param {?} url
     * @return {?}
     */
    function (url) {
        /** @type {?} */
        var windowOptions = {
            width: 500,
            height: 500,
            menubar: 'no',
            toolbar: 'no',
            location: 'no',
            personalbar: 'no',
            resizable: 'yes',
            scrollbars: 'no',
            status: 'no'
        };
        /** @type {?} */
        var popupWindowNative = window.open(url, "" + JsUtils.generateGUID(), PopupWindowManager.serializeWindowOptions(windowOptions));
        if (popupWindowNative == null) {
            return null;
        }
        return popupWindowNative;
    };
    /**
     * @param {?} windowOptions
     * @return {?}
     */
    PopupWindowManager.serializeWindowOptions = /**
     * @param {?} windowOptions
     * @return {?}
     */
    function (windowOptions) {
        /** @type {?} */
        var windowOptionsString = [];
        for (var key in windowOptions) {
            windowOptionsString.push(key + '=' + windowOptions[key]);
        }
        return windowOptionsString.join(',');
    };
    /**
     * @return {?}
     */
    PopupWindowManager.prototype.runChangeDetection = /**
     * @return {?}
     */
    function () {
        this._runChangeDetection$.next();
    };
    /**
     * @return {?}
     */
    PopupWindowManager.prototype.saveState = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var componentConfig = (/** @type {?} */ (this._popupLayout.saveState().content[0]));
        delete componentConfig['width'];
        return componentConfig;
    };
    /**
     * @return {?}
     */
    PopupWindowManager.prototype.close = /**
     * @return {?}
     */
    function () {
        this._closedByUser = false;
        this.window.close();
    };
    return PopupWindowManager;
}());
export { PopupWindowManager };
if (false) {
    /** @type {?} */
    PopupWindowManager.prototype.id;
    /**
     * @type {?}
     * @private
     */
    PopupWindowManager.prototype._closedByUser;
    /**
     * @type {?}
     * @private
     */
    PopupWindowManager.prototype._runChangeDetection$;
    /**
     * @type {?}
     * @private
     */
    PopupWindowManager.prototype._popupLayout;
    /** @type {?} */
    PopupWindowManager.prototype.window;
    /**
     * @type {?}
     * @private
     */
    PopupWindowManager.prototype.popupConfig;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtd2luZG93LW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvcG9wdXAtd2luZG93LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBS3pDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7OztBQUt4QywrQ0FPQzs7O0lBTkMsb0RBQTRCOztJQUM1QixtREFBK0M7O0lBQy9DLGlEQUEyQjs7SUFDM0IsNkRBQW1EOztJQUNuRCx1REFBb0Q7O0lBQ3BELDhEQUFzQzs7Ozs7QUFHeEMsd0NBUUM7OztJQVBDLDZDQUFxQjs7SUFDckIsNENBQW9COztJQUNwQixtQ0FBb0I7O0lBQ3BCLDhDQUEyQzs7SUFDM0MsNERBQTJDOztJQUMzQyxvREFBd0M7O0lBQ3hDLDZDQUFpRDs7O0FBR25ELE1BQU0sS0FBTyxvQkFBb0IsR0FBRyxzQkFBc0I7QUFFMUQ7SUF3Q0UsNEJBQW1CLE1BQWMsRUFDYixXQUFzQztRQUQxRCxpQkErQkM7UUEvQmtCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDYixnQkFBVyxHQUFYLFdBQVcsQ0FBMkI7UUF4QzFELE9BQUUsR0FBVyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFNUIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFDOUIseUJBQW9CLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQXVDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLG1CQUFBO1lBQ2xDLGVBQWUsRUFBRSxXQUFXLENBQUMsZUFBZTtZQUM1QyxjQUFjLEVBQUUsV0FBVyxDQUFDLGNBQWM7WUFFMUMsS0FBSyxFQUFFLG1CQUFBOzs7O1lBQUMsVUFBQyxVQUFVO2dCQUNqQixXQUFXLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZD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dCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgSXRlbUNvbmZpZyA9IEdvbGRlbkxheW91dE5hbWVzcGFjZS5JdGVtQ29uZmlnO1xuaW1wb3J0IHtJR29sZGVuTGF5b3V0Q29tcG9uZW50U2V0dGluZ3N9IGZyb20gJy4vbW9kZWxzL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IENvbXBvbmVudENvbmZpZyA9IEdvbGRlbkxheW91dE5hbWVzcGFjZS5Db21wb25lbnRDb25maWc7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC5jb21wb25lbnQnO1xuaW1wb3J0IHtKc1V0aWxzfSBmcm9tICcuL3V0aWxzL0pzVXRpbHMnO1xuXG5leHBvcnQgdHlwZSBQb3BpbkhhbmRsZXIgPSAoY29tcG9uZW50Q29uZmlnOiBDb21wb25lbnRDb25maWcpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBQb3B1cFN0YXRlQ2hhbmdlZEhhbmRsZXIgPSAoKSA9PiB2b2lkO1xuXG5leHBvcnQgaW50ZXJmYWNlIElQb3B1cFdpbmRvd01hbmFnZXJDb25maWcge1xuICBjb21wb25lbnRDb25maWc6IEl0ZW1Db25maWc7XG4gIGxheW91dFNldHRpbmdzOiBJR29sZGVuTGF5b3V0Q29tcG9uZW50U2V0dGluZ3M7XG4gIHBvcGluSGFuZGxlcjogUG9waW5IYW5kbGVyO1xuICBwb3B1cFN0YXRlQ2hhbmdlZEhhbmRsZXI6IFBvcHVwU3RhdGVDaGFuZ2VkSGFuZGxlcjtcbiAgcG9wdXBDbG9zZWRIYW5kbGVyOiAoY2xvc2VkQnlVc2VyOiBib29sZWFuKSA9PiB2b2lkO1xuICBydW5DaGFuZ2VEZXRlY3Rpb25IYW5kbGVyOiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQb3B1cFdpbmRvd0NvbmZpZyB7XG4gIGNvbXBvbmVudENvbmZpZzogYW55O1xuICBsYXlvdXRTZXR0aW5nczogYW55O1xuICBwb3BpbjogUG9waW5IYW5kbGVyO1xuICBmaXJlU3RhdGVDaGFuZ2VkOiBQb3B1cFN0YXRlQ2hhbmdlZEhhbmRsZXI7XG4gIHJ1bkNoYW5nZURldGVjdGlvbkluUm9vdFdpbmRvdzogKCkgPT4gdm9pZDtcbiAgbmVlZFJ1bkNoYW5nZURldGVjdGlvbjogT2JzZXJ2YWJsZTxhbnk+O1xuICBvbkxheW91dENyZWF0ZWQ6IChHb2xkZW5MYXlvdXRDb21wb25lbnQpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBQb3B1cFdpbmRvd0NvbmZpZ0tleSA9ICdwb3B1cFdpbmRvd0NvbmZpZ0tleSc7XG5cbmV4cG9ydCBjbGFzcyBQb3B1cFdpbmRvd01hbmFnZXIge1xuICBpZDogc3RyaW5nID0gSnNVdGlscy5nZW5lcmF0ZUdVSUQoKTtcblxuICBwcml2YXRlIF9jbG9zZWRCeVVzZXI6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9ydW5DaGFuZ2VEZXRlY3Rpb24kID0gbmV3IFN1YmplY3QoKTtcbiAgcHJpdmF0ZSBfcG9wdXBMYXlvdXQ6IEdvbGRlbkxheW91dENvbXBvbmVudDtcblxuICBzdGF0aWMgb3BlbldpbmRvdyh1cmw6IHN0cmluZyk6IFdpbmRvdyB7XG4gICAgY29uc3Qgd2luZG93T3B0aW9ucyA9IHtcbiAgICAgIHdpZHRoOiA1MDAsXG4gICAgICBoZWlnaHQ6IDUwMCxcbiAgICAgIG1lbnViYXI6ICdubycsXG4gICAgICB0b29sYmFyOiAnbm8nLFxuICAgICAgbG9jYXRpb246ICdubycsXG4gICAgICBwZXJzb25hbGJhcjogJ25vJyxcbiAgICAgIHJlc2l6YWJsZTogJ3llcycsXG4gICAgICBzY3JvbGxiYXJzOiAnbm8nLFxuICAgICAgc3RhdHVzOiAnbm8nXG4gICAgfTtcblxuICAgIGNvbnN0IHBvcHVwV2luZG93TmF0aXZlID0gd2luZG93Lm9wZW4odXJsLFxuICAgICAgYCR7SnNVdGlscy5nZW5lcmF0ZUdVSUQoKX1gLCBQb3B1cFdpbmRvd01hbmFnZXIuc2VyaWFsaXplV2luZG93T3B0aW9ucyh3aW5kb3dPcHRpb25zKSk7XG5cbiAgICBpZiAocG9wdXBXaW5kb3dOYXRpdmUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvcHVwV2luZG93TmF0aXZlO1xuICB9XG5cbiAgc3RhdGljIHNlcmlhbGl6ZVdpbmRvd09wdGlvbnMod2luZG93T3B0aW9uczogYW55KSB7XG4gICAgY29uc3Qgd2luZG93T3B0aW9uc1N0cmluZyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gd2luZG93T3B0aW9ucykge1xuICAgICAgd2luZG93T3B0aW9uc1N0cmluZy5wdXNoKGtleSArICc9JyArIHdpbmRvd09wdGlvbnNba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdpbmRvd09wdGlvbnNTdHJpbmcuam9pbignLCcpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIHdpbmRvdzogV2luZG93LFxuICAgICAgICAgICAgICBwcml2YXRlIHBvcHVwQ29uZmlnOiBJUG9wdXBXaW5kb3dNYW5hZ2VyQ29uZmlnKSB7XG5cbiAgICB0aGlzLndpbmRvd1tQb3B1cFdpbmRvd0NvbmZpZ0tleV0gPSB7XG4gICAgICBjb21wb25lbnRDb25maWc6IHBvcHVwQ29uZmlnLmNvbXBvbmVudENvbmZpZyxcbiAgICAgIGxheW91dFNldHRpbmdzOiBwb3B1cENvbmZpZy5sYXlvdXRTZXR0aW5ncyxcblxuICAgICAgcG9waW46ICgoY29tcENvbmZpZykgPT4ge1xuICAgICAgICBwb3B1cENvbmZpZy5wb3BpbkhhbmRsZXIoY29tcENvbmZpZyk7XG4gICAgICB9KSBhcyBQb3BpbkhhbmRsZXIsXG5cbiAgICAgIGZpcmVTdGF0ZUNoYW5nZWQ6ICgoKSA9PiB7XG4gICAgICAgIHBvcHVwQ29uZmlnLnBvcHVwU3RhdGVDaGFuZ2VkSGFuZGxlcigpO1xuICAgICAgfSkgYXMgUG9wdXBTdGF0ZUNoYW5nZWRIYW5kbGVyLFxuXG4gICAgICBydW5DaGFuZ2VEZXRlY3Rpb25JblJvb3RXaW5kb3c6ICgpID0+IHtcbiAgICAgICAgcG9wdXBDb25maWcucnVuQ2hhbmdlRGV0ZWN0aW9uSGFuZGxlcigpO1xuICAgICAgfSxcblxuICAgICAgbmVlZFJ1bkNoYW5nZURldGVjdGlvbjogdGhpcy5fcnVuQ2hhbmdlRGV0ZWN0aW9uJC5hc09ic2VydmFibGUoKSxcbiAgICAgIG9uTGF5b3V0Q3JlYXRlZDogKGxheW91dDogR29sZGVuTGF5b3V0Q29tcG9uZW50KSA9PiB7XG4gICAgICAgIHRoaXMuX3BvcHVwTGF5b3V0ID0gbGF5b3V0O1xuICAgICAgfVxuICAgIH0gYXMgSVBvcHVwV2luZG93Q29uZmlnO1xuXG4gICAgJCh0aGlzLndpbmRvdykub25lKCdsb2FkJywgKCkgPT4ge1xuICAgICAgJCh0aGlzLndpbmRvdykub25lKCd1bmxvYWQnLCAoKSA9PiB7XG4gICAgICAgIHBvcHVwQ29uZmlnLnBvcHVwQ2xvc2VkSGFuZGxlcih0aGlzLl9jbG9zZWRCeVVzZXIpO1xuICAgICAgICB0aGlzLndpbmRvdy5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBydW5DaGFuZ2VEZXRlY3Rpb24oKSB7XG4gICAgdGhpcy5fcnVuQ2hhbmdlRGV0ZWN0aW9uJC5uZXh0KCk7XG4gIH1cblxuICBzYXZlU3RhdGUoKSB7XG4gICAgY29uc3QgY29tcG9uZW50Q29uZmlnID0gdGhpcy5fcG9wdXBMYXlvdXQuc2F2ZVN0YXRlKCkuY29udGVudFswXSBhcyBDb21wb25lbnRDb25maWc7XG4gICAgZGVsZXRlIGNvbXBvbmVudENvbmZpZ1snd2lkdGgnXTtcblxuICAgIHJldHVybiBjb21wb25lbnRDb25maWc7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLl9jbG9zZWRCeVVzZXIgPSBmYWxzZTtcbiAgICB0aGlzLndpbmRvdy5jbG9zZSgpO1xuICB9XG59XG4iXX0=