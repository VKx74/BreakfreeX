/**
 * @fileoverview added by tsickle
 * Generated from: lib/services/layout-manager.service.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from "@angular/core";
/**
 * @record
 */
export function AddComponentData() { }
if (false) {
    /** @type {?} */
    AddComponentData.prototype.layoutItemName;
    /** @type {?} */
    AddComponentData.prototype.state;
    /** @type {?|undefined} */
    AddComponentData.prototype.parent;
}
var LayoutManagerService = /** @class */ (function () {
    function LayoutManagerService() {
    }
    Object.defineProperty(LayoutManagerService.prototype, "layout", {
        get: /**
         * @return {?}
         */
        function () {
            return this._layout;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} layout
     * @return {?}
     */
    LayoutManagerService.prototype.setLayout = /**
     * @param {?} layout
     * @return {?}
     */
    function (layout) {
        this._layout = layout;
    };
    /**
     * @param {?} data
     * @return {?}
     */
    LayoutManagerService.prototype.addComponent = /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        if (this.layout) {
            this.layout.addComponent(data.layoutItemName, data.state, data.parent);
        }
    };
    /**
     * @param {?} data
     * @return {?}
     */
    LayoutManagerService.prototype.addComponentAsColumn = /**
     * @param {?} data
     * @return {?}
     */
    function (data) {
        if (this.layout) {
            this.layout.addComponentAsColumn(data.layoutItemName, data.state);
        }
    };
    /**
     * @param {?} state
     * @param {?=} fireStateChanged
     * @return {?}
     */
    LayoutManagerService.prototype.loadState = /**
     * @param {?} state
     * @param {?=} fireStateChanged
     * @return {?}
     */
    function (state, fireStateChanged) {
        if (fireStateChanged === void 0) { fireStateChanged = false; }
        if (this.layout) {
            this.layout.loadState(state, fireStateChanged);
        }
    };
    /**
     * @return {?}
     */
    LayoutManagerService.prototype.clear = /**
     * @return {?}
     */
    function () {
        if (this.layout) {
            this.layout.clear();
        }
    };
    LayoutManagerService.decorators = [
        { type: Injectable }
    ];
    return LayoutManagerService;
}());
export { LayoutManagerService };
if (false) {
    /**
     * @type {?}
     * @private
     */
    LayoutManagerService.prototype._layout;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LW1hbmFnZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItZ29sZGVuLWxheW91dC8iLCJzb3VyY2VzIjpbImxpYi9zZXJ2aWNlcy9sYXlvdXQtbWFuYWdlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFDLFVBQVUsRUFBTyxNQUFNLGVBQWUsQ0FBQzs7OztBQUkvQyxzQ0FJQzs7O0lBSEcsMENBQXVCOztJQUN2QixpQ0FBVzs7SUFDWCxrQ0FBYTs7QUFHakI7SUFBQTtJQW1DQSxDQUFDO0lBL0JHLHNCQUFJLHdDQUFNOzs7O1FBQVY7WUFDSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7Ozs7O0lBRUQsd0NBQVM7Ozs7SUFBVCxVQUFVLE1BQTZCO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQzFCLENBQUM7Ozs7O0lBRUQsMkNBQVk7Ozs7SUFBWixVQUFhLElBQXNCO1FBQy9CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUU7SUFDTCxDQUFDOzs7OztJQUVELG1EQUFvQjs7OztJQUFwQixVQUFxQixJQUFzQjtRQUN2QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JFO0lBQ0wsQ0FBQzs7Ozs7O0lBRUQsd0NBQVM7Ozs7O0lBQVQsVUFBVSxLQUFrQyxFQUFFLGdCQUFpQztRQUFqQyxpQ0FBQSxFQUFBLHdCQUFpQztRQUMzRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUNsRDtJQUNMLENBQUM7Ozs7SUFFRCxvQ0FBSzs7O0lBQUw7UUFDSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQzs7Z0JBbENKLFVBQVU7O0lBbUNYLDJCQUFDO0NBQUEsQUFuQ0QsSUFtQ0M7U0FsQ1ksb0JBQW9COzs7Ozs7SUFDN0IsdUNBQXVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBUeXBlfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtJR29sZGVuTGF5b3V0Q29tcG9uZW50U3RhdGV9IGZyb20gXCIuLi9tb2RlbHMvZ29sZGVuLWxheW91dC1jb21wb25lbnQtc3RhdGVcIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29tcG9uZW50fSBmcm9tIFwiLi4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWRkQ29tcG9uZW50RGF0YSB7XG4gICAgbGF5b3V0SXRlbU5hbWU6IHN0cmluZztcbiAgICBzdGF0ZTogYW55O1xuICAgIHBhcmVudD86IGFueTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExheW91dE1hbmFnZXJTZXJ2aWNlIHtcbiAgICBwcml2YXRlIF9sYXlvdXQ6IEdvbGRlbkxheW91dENvbXBvbmVudDtcblxuICAgIGdldCBsYXlvdXQoKTogR29sZGVuTGF5b3V0Q29tcG9uZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dDtcbiAgICB9XG5cbiAgICBzZXRMYXlvdXQobGF5b3V0OiBHb2xkZW5MYXlvdXRDb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0ID0gbGF5b3V0O1xuICAgIH1cblxuICAgIGFkZENvbXBvbmVudChkYXRhOiBBZGRDb21wb25lbnREYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLmxheW91dCkge1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQuYWRkQ29tcG9uZW50KGRhdGEubGF5b3V0SXRlbU5hbWUsIGRhdGEuc3RhdGUsIGRhdGEucGFyZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZENvbXBvbmVudEFzQ29sdW1uKGRhdGE6IEFkZENvbXBvbmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5b3V0KSB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5hZGRDb21wb25lbnRBc0NvbHVtbihkYXRhLmxheW91dEl0ZW1OYW1lLCBkYXRhLnN0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRTdGF0ZShzdGF0ZTogSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlLCBmaXJlU3RhdGVDaGFuZ2VkOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5b3V0KSB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5sb2FkU3RhdGUoc3RhdGUsIGZpcmVTdGF0ZUNoYW5nZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmxheW91dCkge1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==