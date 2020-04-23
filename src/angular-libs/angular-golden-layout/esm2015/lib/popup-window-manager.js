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
export const PopupWindowConfigKey = 'popupWindowConfigKey';
export class PopupWindowManager {
    /**
     * @param {?} window
     * @param {?} popupConfig
     */
    constructor(window, popupConfig) {
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
            (compConfig) => {
                popupConfig.popinHandler(compConfig);
            })))),
            fireStateChanged: (/** @type {?} */ (((/**
             * @return {?}
             */
            () => {
                popupConfig.popupStateChangedHandler();
            })))),
            runChangeDetectionInRootWindow: (/**
             * @return {?}
             */
            () => {
                popupConfig.runChangeDetectionHandler();
            }),
            needRunChangeDetection: this._runChangeDetection$.asObservable(),
            onLayoutCreated: (/**
             * @param {?} layout
             * @return {?}
             */
            (layout) => {
                this._popupLayout = layout;
            })
        }));
        $(this.window).one('load', (/**
         * @return {?}
         */
        () => {
            $(this.window).one('unload', (/**
             * @return {?}
             */
            () => {
                popupConfig.popupClosedHandler(this._closedByUser);
                this.window.close();
            }));
        }));
    }
    /**
     * @param {?} url
     * @return {?}
     */
    static openWindow(url) {
        /** @type {?} */
        const windowOptions = {
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
        const popupWindowNative = window.open(url, `${JsUtils.generateGUID()}`, PopupWindowManager.serializeWindowOptions(windowOptions));
        if (popupWindowNative == null) {
            return null;
        }
        return popupWindowNative;
    }
    /**
     * @param {?} windowOptions
     * @return {?}
     */
    static serializeWindowOptions(windowOptions) {
        /** @type {?} */
        const windowOptionsString = [];
        for (const key in windowOptions) {
            windowOptionsString.push(key + '=' + windowOptions[key]);
        }
        return windowOptionsString.join(',');
    }
    /**
     * @return {?}
     */
    runChangeDetection() {
        this._runChangeDetection$.next();
    }
    /**
     * @return {?}
     */
    saveState() {
        /** @type {?} */
        const componentConfig = (/** @type {?} */ (this._popupLayout.saveState().content[0]));
        delete componentConfig['width'];
        return componentConfig;
    }
    /**
     * @return {?}
     */
    close() {
        this._closedByUser = false;
        this.window.close();
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtd2luZG93LW1hbmFnZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvcG9wdXAtd2luZG93LW1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBS3pDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7OztBQUt4QywrQ0FPQzs7O0lBTkMsb0RBQTRCOztJQUM1QixtREFBK0M7O0lBQy9DLGlEQUEyQjs7SUFDM0IsNkRBQW1EOztJQUNuRCx1REFBb0Q7O0lBQ3BELDhEQUFzQzs7Ozs7QUFHeEMsd0NBUUM7OztJQVBDLDZDQUFxQjs7SUFDckIsNENBQW9COztJQUNwQixtQ0FBb0I7O0lBQ3BCLDhDQUEyQzs7SUFDM0MsNERBQTJDOztJQUMzQyxvREFBd0M7O0lBQ3hDLDZDQUFpRDs7O0FBR25ELE1BQU0sT0FBTyxvQkFBb0IsR0FBRyxzQkFBc0I7QUFFMUQsTUFBTSxPQUFPLGtCQUFrQjs7Ozs7SUF3QzdCLFlBQW1CLE1BQWMsRUFDYixXQUFzQztRQUR2QyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2IsZ0JBQVcsR0FBWCxXQUFXLENBQTJCO1FBeEMxRCxPQUFFLEdBQVcsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTVCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBQzlCLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUF1QzNDLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxtQkFBQTtZQUNsQyxlQUFlLEVBQUUsV0FBVyxDQUFDLGVBQWU7WUFDNUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxjQUFjO1lBRTFDLEtBQUssRUFBRSxtQkFBQTs7OztZQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3JCLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsQ0FBQyxFQUFDLEVBQWdCO1lBRWxCLGdCQUFnQixFQUFFLG1CQUFBOzs7WUFBQyxHQUFHLEVBQUU7Z0JBQ3RCLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3pDLENBQUMsRUFBQyxFQUE0QjtZQUU5Qiw4QkFBOEI7OztZQUFFLEdBQUcsRUFBRTtnQkFDbkMsV0FBVyxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDMUMsQ0FBQyxDQUFBO1lBRUQsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksRUFBRTtZQUNoRSxlQUFlOzs7O1lBQUUsQ0FBQyxNQUE2QixFQUFFLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1lBQzdCLENBQUMsQ0FBQTtTQUNGLEVBQXNCLENBQUM7UUFFeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTTs7O1FBQUUsR0FBRyxFQUFFO1lBQzlCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVE7OztZQUFFLEdBQUcsRUFBRTtnQkFDaEMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixDQUFDLEVBQUMsQ0FBQztRQUNMLENBQUMsRUFBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7SUFoRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFXOztjQUNyQixhQUFhLEdBQUc7WUFDcEIsS0FBSyxFQUFFLEdBQUc7WUFDVixNQUFNLEVBQUUsR0FBRztZQUNYLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFLElBQUk7WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1NBQ2I7O2NBRUssaUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQ3ZDLEdBQUcsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFeEYsSUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8saUJBQWlCLENBQUM7SUFDM0IsQ0FBQzs7Ozs7SUFFRCxNQUFNLENBQUMsc0JBQXNCLENBQUMsYUFBa0I7O2NBQ3hDLG1CQUFtQixHQUFHLEVBQUU7UUFFOUIsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUU7WUFDL0IsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxDQUFDOzs7O0lBbUNELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkMsQ0FBQzs7OztJQUVELFNBQVM7O2NBQ0QsZUFBZSxHQUFHLG1CQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFtQjtRQUNuRixPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVoQyxPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDOzs7O0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdEIsQ0FBQztDQUNGOzs7SUF2RkMsZ0NBQW9DOzs7OztJQUVwQywyQ0FBc0M7Ozs7O0lBQ3RDLGtEQUE2Qzs7Ozs7SUFDN0MsMENBQTRDOztJQW1DaEMsb0NBQXFCOzs7OztJQUNyQix5Q0FBOEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IEl0ZW1Db25maWcgPSBHb2xkZW5MYXlvdXROYW1lc3BhY2UuSXRlbUNvbmZpZztcbmltcG9ydCB7SUdvbGRlbkxheW91dENvbXBvbmVudFNldHRpbmdzfSBmcm9tICcuL21vZGVscy9jb25maWd1cmF0aW9uJztcbmltcG9ydCBDb21wb25lbnRDb25maWcgPSBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29tcG9uZW50Q29uZmlnO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50JztcbmltcG9ydCB7SnNVdGlsc30gZnJvbSAnLi91dGlscy9Kc1V0aWxzJztcblxuZXhwb3J0IHR5cGUgUG9waW5IYW5kbGVyID0gKGNvbXBvbmVudENvbmZpZzogQ29tcG9uZW50Q29uZmlnKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgUG9wdXBTdGF0ZUNoYW5nZWRIYW5kbGVyID0gKCkgPT4gdm9pZDtcblxuZXhwb3J0IGludGVyZmFjZSBJUG9wdXBXaW5kb3dNYW5hZ2VyQ29uZmlnIHtcbiAgY29tcG9uZW50Q29uZmlnOiBJdGVtQ29uZmlnO1xuICBsYXlvdXRTZXR0aW5nczogSUdvbGRlbkxheW91dENvbXBvbmVudFNldHRpbmdzO1xuICBwb3BpbkhhbmRsZXI6IFBvcGluSGFuZGxlcjtcbiAgcG9wdXBTdGF0ZUNoYW5nZWRIYW5kbGVyOiBQb3B1cFN0YXRlQ2hhbmdlZEhhbmRsZXI7XG4gIHBvcHVwQ2xvc2VkSGFuZGxlcjogKGNsb3NlZEJ5VXNlcjogYm9vbGVhbikgPT4gdm9pZDtcbiAgcnVuQ2hhbmdlRGV0ZWN0aW9uSGFuZGxlcjogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUG9wdXBXaW5kb3dDb25maWcge1xuICBjb21wb25lbnRDb25maWc6IGFueTtcbiAgbGF5b3V0U2V0dGluZ3M6IGFueTtcbiAgcG9waW46IFBvcGluSGFuZGxlcjtcbiAgZmlyZVN0YXRlQ2hhbmdlZDogUG9wdXBTdGF0ZUNoYW5nZWRIYW5kbGVyO1xuICBydW5DaGFuZ2VEZXRlY3Rpb25JblJvb3RXaW5kb3c6ICgpID0+IHZvaWQ7XG4gIG5lZWRSdW5DaGFuZ2VEZXRlY3Rpb246IE9ic2VydmFibGU8YW55PjtcbiAgb25MYXlvdXRDcmVhdGVkOiAoR29sZGVuTGF5b3V0Q29tcG9uZW50KSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgUG9wdXBXaW5kb3dDb25maWdLZXkgPSAncG9wdXBXaW5kb3dDb25maWdLZXknO1xuXG5leHBvcnQgY2xhc3MgUG9wdXBXaW5kb3dNYW5hZ2VyIHtcbiAgaWQ6IHN0cmluZyA9IEpzVXRpbHMuZ2VuZXJhdGVHVUlEKCk7XG5cbiAgcHJpdmF0ZSBfY2xvc2VkQnlVc2VyOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfcnVuQ2hhbmdlRGV0ZWN0aW9uJCA9IG5ldyBTdWJqZWN0KCk7XG4gIHByaXZhdGUgX3BvcHVwTGF5b3V0OiBHb2xkZW5MYXlvdXRDb21wb25lbnQ7XG5cbiAgc3RhdGljIG9wZW5XaW5kb3codXJsOiBzdHJpbmcpOiBXaW5kb3cge1xuICAgIGNvbnN0IHdpbmRvd09wdGlvbnMgPSB7XG4gICAgICB3aWR0aDogNTAwLFxuICAgICAgaGVpZ2h0OiA1MDAsXG4gICAgICBtZW51YmFyOiAnbm8nLFxuICAgICAgdG9vbGJhcjogJ25vJyxcbiAgICAgIGxvY2F0aW9uOiAnbm8nLFxuICAgICAgcGVyc29uYWxiYXI6ICdubycsXG4gICAgICByZXNpemFibGU6ICd5ZXMnLFxuICAgICAgc2Nyb2xsYmFyczogJ25vJyxcbiAgICAgIHN0YXR1czogJ25vJ1xuICAgIH07XG5cbiAgICBjb25zdCBwb3B1cFdpbmRvd05hdGl2ZSA9IHdpbmRvdy5vcGVuKHVybCxcbiAgICAgIGAke0pzVXRpbHMuZ2VuZXJhdGVHVUlEKCl9YCwgUG9wdXBXaW5kb3dNYW5hZ2VyLnNlcmlhbGl6ZVdpbmRvd09wdGlvbnMod2luZG93T3B0aW9ucykpO1xuXG4gICAgaWYgKHBvcHVwV2luZG93TmF0aXZlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBwb3B1cFdpbmRvd05hdGl2ZTtcbiAgfVxuXG4gIHN0YXRpYyBzZXJpYWxpemVXaW5kb3dPcHRpb25zKHdpbmRvd09wdGlvbnM6IGFueSkge1xuICAgIGNvbnN0IHdpbmRvd09wdGlvbnNTdHJpbmcgPSBbXTtcblxuICAgIGZvciAoY29uc3Qga2V5IGluIHdpbmRvd09wdGlvbnMpIHtcbiAgICAgIHdpbmRvd09wdGlvbnNTdHJpbmcucHVzaChrZXkgKyAnPScgKyB3aW5kb3dPcHRpb25zW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB3aW5kb3dPcHRpb25zU3RyaW5nLmpvaW4oJywnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB3aW5kb3c6IFdpbmRvdyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBwb3B1cENvbmZpZzogSVBvcHVwV2luZG93TWFuYWdlckNvbmZpZykge1xuXG4gICAgdGhpcy53aW5kb3dbUG9wdXBXaW5kb3dDb25maWdLZXldID0ge1xuICAgICAgY29tcG9uZW50Q29uZmlnOiBwb3B1cENvbmZpZy5jb21wb25lbnRDb25maWcsXG4gICAgICBsYXlvdXRTZXR0aW5nczogcG9wdXBDb25maWcubGF5b3V0U2V0dGluZ3MsXG5cbiAgICAgIHBvcGluOiAoKGNvbXBDb25maWcpID0+IHtcbiAgICAgICAgcG9wdXBDb25maWcucG9waW5IYW5kbGVyKGNvbXBDb25maWcpO1xuICAgICAgfSkgYXMgUG9waW5IYW5kbGVyLFxuXG4gICAgICBmaXJlU3RhdGVDaGFuZ2VkOiAoKCkgPT4ge1xuICAgICAgICBwb3B1cENvbmZpZy5wb3B1cFN0YXRlQ2hhbmdlZEhhbmRsZXIoKTtcbiAgICAgIH0pIGFzIFBvcHVwU3RhdGVDaGFuZ2VkSGFuZGxlcixcblxuICAgICAgcnVuQ2hhbmdlRGV0ZWN0aW9uSW5Sb290V2luZG93OiAoKSA9PiB7XG4gICAgICAgIHBvcHVwQ29uZmlnLnJ1bkNoYW5nZURldGVjdGlvbkhhbmRsZXIoKTtcbiAgICAgIH0sXG5cbiAgICAgIG5lZWRSdW5DaGFuZ2VEZXRlY3Rpb246IHRoaXMuX3J1bkNoYW5nZURldGVjdGlvbiQuYXNPYnNlcnZhYmxlKCksXG4gICAgICBvbkxheW91dENyZWF0ZWQ6IChsYXlvdXQ6IEdvbGRlbkxheW91dENvbXBvbmVudCkgPT4ge1xuICAgICAgICB0aGlzLl9wb3B1cExheW91dCA9IGxheW91dDtcbiAgICAgIH1cbiAgICB9IGFzIElQb3B1cFdpbmRvd0NvbmZpZztcblxuICAgICQodGhpcy53aW5kb3cpLm9uZSgnbG9hZCcsICgpID0+IHtcbiAgICAgICQodGhpcy53aW5kb3cpLm9uZSgndW5sb2FkJywgKCkgPT4ge1xuICAgICAgICBwb3B1cENvbmZpZy5wb3B1cENsb3NlZEhhbmRsZXIodGhpcy5fY2xvc2VkQnlVc2VyKTtcbiAgICAgICAgdGhpcy53aW5kb3cuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcnVuQ2hhbmdlRGV0ZWN0aW9uKCkge1xuICAgIHRoaXMuX3J1bkNoYW5nZURldGVjdGlvbiQubmV4dCgpO1xuICB9XG5cbiAgc2F2ZVN0YXRlKCkge1xuICAgIGNvbnN0IGNvbXBvbmVudENvbmZpZyA9IHRoaXMuX3BvcHVwTGF5b3V0LnNhdmVTdGF0ZSgpLmNvbnRlbnRbMF0gYXMgQ29tcG9uZW50Q29uZmlnO1xuICAgIGRlbGV0ZSBjb21wb25lbnRDb25maWdbJ3dpZHRoJ107XG5cbiAgICByZXR1cm4gY29tcG9uZW50Q29uZmlnO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fY2xvc2VkQnlVc2VyID0gZmFsc2U7XG4gICAgdGhpcy53aW5kb3cuY2xvc2UoKTtcbiAgfVxufVxuIl19