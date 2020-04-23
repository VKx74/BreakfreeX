/**
 * @fileoverview added by tsickle
 * Generated from: lib/golden-layout-item.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Subject } from 'rxjs';
import { GoldenLayoutContainer } from "./tokens/golden-layout-container.token";
import { GoldenLayoutComponent } from "./components/golden-layout/golden-layout.component";
import { takeUntil } from "rxjs/operators";
var GoldenLayoutItem = /** @class */ (function () {
    function GoldenLayoutItem(injector) {
        this._destroy = new Subject();
        this._container = (/** @type {?} */ (injector.get(GoldenLayoutContainer)));
        this._goldenLayoutComponent = injector.get(GoldenLayoutComponent);
    }
    /**
     * @return {?}
     */
    GoldenLayoutItem.prototype.saveState = /**
     * @return {?}
     */
    function () {
        return null;
    };
    /**
     * @return {?}
     */
    GoldenLayoutItem.prototype.onResize = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @return {?}
     */
    GoldenLayoutItem.prototype.onShow = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @return {?}
     */
    GoldenLayoutItem.prototype.onHide = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @param {?} tabElement
     * @return {?}
     */
    GoldenLayoutItem.prototype.onTabCreated = /**
     * @param {?} tabElement
     * @return {?}
     */
    function (tabElement) {
        this._tabElement = tabElement;
    };
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    GoldenLayoutItem.prototype.onContainerMaximized = /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    function (isOwnContainer) {
    };
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    GoldenLayoutItem.prototype.onContainerMinimized = /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    function (isOwnContainer) {
    };
    /**
     * @param {?} title$
     * @return {?}
     */
    GoldenLayoutItem.prototype.setTitle = /**
     * @param {?} title$
     * @return {?}
     */
    function (title$) {
        var _this = this;
        if (this._titleSubscription) {
            this._titleSubscription.unsubscribe();
        }
        this._titleSubscription = title$
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @param {?} title
         * @return {?}
         */
        function (title) {
            _this._container.setTitle(title);
        }));
    };
    /**
     * @return {?}
     */
    GoldenLayoutItem.prototype.fireStateChanged = /**
     * @return {?}
     */
    function () {
        this._goldenLayoutComponent.fireStateChanged();
    };
    /**
     * @return {?}
     */
    GoldenLayoutItem.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._destroy.next();
        this._destroy.complete();
    };
    return GoldenLayoutItem;
}());
export { GoldenLayoutItem };
if (false) {
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItem.prototype._container;
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItem.prototype._goldenLayoutComponent;
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItem.prototype._tabElement;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItem.prototype._titleSubscription;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItem.prototype._destroy;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC1pdGVtLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1nb2xkZW4tbGF5b3V0LyIsInNvdXJjZXMiOlsibGliL2dvbGRlbi1sYXlvdXQtaXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE9BQU8sRUFBYSxPQUFPLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFFdkQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sb0RBQW9ELENBQUM7QUFDekYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3pDO0lBT0ksMEJBQVksUUFBa0I7UUFGdEIsYUFBUSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFHN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxtQkFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEVBQWEsQ0FBQztRQUNuRSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7Ozs7SUFFRCxvQ0FBUzs7O0lBQVQ7UUFDSSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDOzs7O0lBRUQsbUNBQVE7OztJQUFSO0lBQ0EsQ0FBQzs7OztJQUVELGlDQUFNOzs7SUFBTjtJQUNBLENBQUM7Ozs7SUFFRCxpQ0FBTTs7O0lBQU47SUFDQSxDQUFDOzs7OztJQUVELHVDQUFZOzs7O0lBQVosVUFBYSxVQUFrQjtRQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUNsQyxDQUFDOzs7OztJQUVELCtDQUFvQjs7OztJQUFwQixVQUFxQixjQUF1QjtJQUM1QyxDQUFDOzs7OztJQUVELCtDQUFvQjs7OztJQUFwQixVQUFxQixjQUF1QjtJQUM1QyxDQUFDOzs7OztJQUVELG1DQUFROzs7O0lBQVIsVUFBUyxNQUEwQjtRQUFuQyxpQkFVQztRQVRHLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN6QztRQUVELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNO2FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCLFNBQVM7Ozs7UUFBQyxVQUFDLEtBQWE7WUFDckIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQyxFQUFDLENBQUM7SUFDWCxDQUFDOzs7O0lBRUQsMkNBQWdCOzs7SUFBaEI7UUFDSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuRCxDQUFDOzs7O0lBRUQsc0NBQVc7OztJQUFYO1FBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFDTCx1QkFBQztBQUFELENBQUMsQUF2REQsSUF1REM7Ozs7Ozs7SUF0REcsc0NBQWdDOzs7OztJQUNoQyxrREFBd0Q7Ozs7O0lBQ3hELHVDQUE4Qjs7Ozs7SUFDOUIsOENBQXlDOzs7OztJQUN6QyxvQ0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29udGFpbmVyID0gR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRhaW5lcjtcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbnRhaW5lcn0gZnJvbSBcIi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtY29udGFpbmVyLnRva2VuXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50XCI7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQge0lHb2xkZW5MYXlvdXRJdGVtfSBmcm9tICcuL21vZGVscy9nb2xkZW4tbGF5b3V0LWl0ZW0nO1xuXG5leHBvcnQgY2xhc3MgR29sZGVuTGF5b3V0SXRlbSBpbXBsZW1lbnRzIElHb2xkZW5MYXlvdXRJdGVtIHtcbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lcjogQ29udGFpbmVyO1xuICAgIHByb3RlY3RlZCBfZ29sZGVuTGF5b3V0Q29tcG9uZW50OiBHb2xkZW5MYXlvdXRDb21wb25lbnQ7XG4gICAgcHJvdGVjdGVkIF90YWJFbGVtZW50OiBKUXVlcnk7XG4gICAgcHJpdmF0ZSBfdGl0bGVTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIF9kZXN0cm95ID0gbmV3IFN1YmplY3QoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBpbmplY3Rvci5nZXQoR29sZGVuTGF5b3V0Q29udGFpbmVyKSBhcyBDb250YWluZXI7XG4gICAgICAgIHRoaXMuX2dvbGRlbkxheW91dENvbXBvbmVudCA9IGluamVjdG9yLmdldChHb2xkZW5MYXlvdXRDb21wb25lbnQpO1xuICAgIH1cblxuICAgIHNhdmVTdGF0ZSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICB9XG5cbiAgICBvblNob3coKSB7XG4gICAgfVxuXG4gICAgb25IaWRlKCkge1xuICAgIH1cblxuICAgIG9uVGFiQ3JlYXRlZCh0YWJFbGVtZW50OiBKUXVlcnkpIHtcbiAgICAgICAgdGhpcy5fdGFiRWxlbWVudCA9IHRhYkVsZW1lbnQ7XG4gICAgfVxuXG4gICAgb25Db250YWluZXJNYXhpbWl6ZWQoaXNPd25Db250YWluZXI6IGJvb2xlYW4pIHtcbiAgICB9XG5cbiAgICBvbkNvbnRhaW5lck1pbmltaXplZChpc093bkNvbnRhaW5lcjogYm9vbGVhbikge1xuICAgIH1cblxuICAgIHNldFRpdGxlKHRpdGxlJDogT2JzZXJ2YWJsZTxzdHJpbmc+KSB7XG4gICAgICAgIGlmICh0aGlzLl90aXRsZVN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGl0bGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RpdGxlU3Vic2NyaXB0aW9uID0gdGl0bGUkXG4gICAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCh0aXRsZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnNldFRpdGxlKHRpdGxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZpcmVTdGF0ZUNoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuX2dvbGRlbkxheW91dENvbXBvbmVudC5maXJlU3RhdGVDaGFuZ2VkKCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICB0aGlzLl9kZXN0cm95Lm5leHQoKTtcbiAgICAgIHRoaXMuX2Rlc3Ryb3kuY29tcGxldGUoKTtcbiAgICB9XG59XG4iXX0=