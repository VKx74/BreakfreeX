/**
 * @fileoverview added by tsickle
 * Generated from: lib/golden-layout-item.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Subject } from 'rxjs';
import { GoldenLayoutContainer } from "./tokens/golden-layout-container.token";
import { GoldenLayoutComponent } from "./components/golden-layout/golden-layout.component";
import { takeUntil } from "rxjs/operators";
export class GoldenLayoutItem {
    /**
     * @param {?} injector
     */
    constructor(injector) {
        this._destroy = new Subject();
        this._container = (/** @type {?} */ (injector.get(GoldenLayoutContainer)));
        this._goldenLayoutComponent = injector.get(GoldenLayoutComponent);
    }
    /**
     * @return {?}
     */
    saveState() {
        return null;
    }
    /**
     * @return {?}
     */
    onResize() {
    }
    /**
     * @return {?}
     */
    onShow() {
    }
    /**
     * @return {?}
     */
    onHide() {
    }
    /**
     * @param {?} tabElement
     * @return {?}
     */
    onTabCreated(tabElement) {
        this._tabElement = tabElement;
    }
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    onContainerMaximized(isOwnContainer) {
    }
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    onContainerMinimized(isOwnContainer) {
    }
    /**
     * @param {?} title$
     * @return {?}
     */
    setTitle(title$) {
        if (this._titleSubscription) {
            this._titleSubscription.unsubscribe();
        }
        this._titleSubscription = title$
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @param {?} title
         * @return {?}
         */
        (title) => {
            this._container.setTitle(title);
        }));
    }
    /**
     * @return {?}
     */
    fireStateChanged() {
        this._goldenLayoutComponent.fireStateChanged();
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC1pdGVtLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1nb2xkZW4tbGF5b3V0LyIsInNvdXJjZXMiOlsibGliL2dvbGRlbi1sYXlvdXQtaXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE9BQU8sRUFBYSxPQUFPLEVBQWUsTUFBTSxNQUFNLENBQUM7QUFFdkQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sb0RBQW9ELENBQUM7QUFDekYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3pDLE1BQU0sT0FBTyxnQkFBZ0I7Ozs7SUFPekIsWUFBWSxRQUFrQjtRQUZ0QixhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUc3QixJQUFJLENBQUMsVUFBVSxHQUFHLG1CQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsRUFBYSxDQUFDO1FBQ25FLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDdEUsQ0FBQzs7OztJQUVELFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDOzs7O0lBRUQsUUFBUTtJQUNSLENBQUM7Ozs7SUFFRCxNQUFNO0lBQ04sQ0FBQzs7OztJQUVELE1BQU07SUFDTixDQUFDOzs7OztJQUVELFlBQVksQ0FBQyxVQUFrQjtRQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUNsQyxDQUFDOzs7OztJQUVELG9CQUFvQixDQUFDLGNBQXVCO0lBQzVDLENBQUM7Ozs7O0lBRUQsb0JBQW9CLENBQUMsY0FBdUI7SUFDNUMsQ0FBQzs7Ozs7SUFFRCxRQUFRLENBQUMsTUFBMEI7UUFDL0IsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDekIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU07YUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUIsU0FBUzs7OztRQUFDLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQyxFQUFDLENBQUM7SUFDWCxDQUFDOzs7O0lBRUQsZ0JBQWdCO1FBQ1osSUFBSSxDQUFDLHNCQUFzQixDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDbkQsQ0FBQzs7OztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsQ0FBQztDQUNKOzs7Ozs7SUF0REcsc0NBQWdDOzs7OztJQUNoQyxrREFBd0Q7Ozs7O0lBQ3hELHVDQUE4Qjs7Ozs7SUFDOUIsOENBQXlDOzs7OztJQUN6QyxvQ0FBaUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29udGFpbmVyID0gR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRhaW5lcjtcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbnRhaW5lcn0gZnJvbSBcIi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtY29udGFpbmVyLnRva2VuXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50XCI7XG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQge0lHb2xkZW5MYXlvdXRJdGVtfSBmcm9tICcuL21vZGVscy9nb2xkZW4tbGF5b3V0LWl0ZW0nO1xuXG5leHBvcnQgY2xhc3MgR29sZGVuTGF5b3V0SXRlbSBpbXBsZW1lbnRzIElHb2xkZW5MYXlvdXRJdGVtIHtcbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lcjogQ29udGFpbmVyO1xuICAgIHByb3RlY3RlZCBfZ29sZGVuTGF5b3V0Q29tcG9uZW50OiBHb2xkZW5MYXlvdXRDb21wb25lbnQ7XG4gICAgcHJvdGVjdGVkIF90YWJFbGVtZW50OiBKUXVlcnk7XG4gICAgcHJpdmF0ZSBfdGl0bGVTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIF9kZXN0cm95ID0gbmV3IFN1YmplY3QoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBpbmplY3Rvci5nZXQoR29sZGVuTGF5b3V0Q29udGFpbmVyKSBhcyBDb250YWluZXI7XG4gICAgICAgIHRoaXMuX2dvbGRlbkxheW91dENvbXBvbmVudCA9IGluamVjdG9yLmdldChHb2xkZW5MYXlvdXRDb21wb25lbnQpO1xuICAgIH1cblxuICAgIHNhdmVTdGF0ZSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBvblJlc2l6ZSgpIHtcbiAgICB9XG5cbiAgICBvblNob3coKSB7XG4gICAgfVxuXG4gICAgb25IaWRlKCkge1xuICAgIH1cblxuICAgIG9uVGFiQ3JlYXRlZCh0YWJFbGVtZW50OiBKUXVlcnkpIHtcbiAgICAgICAgdGhpcy5fdGFiRWxlbWVudCA9IHRhYkVsZW1lbnQ7XG4gICAgfVxuXG4gICAgb25Db250YWluZXJNYXhpbWl6ZWQoaXNPd25Db250YWluZXI6IGJvb2xlYW4pIHtcbiAgICB9XG5cbiAgICBvbkNvbnRhaW5lck1pbmltaXplZChpc093bkNvbnRhaW5lcjogYm9vbGVhbikge1xuICAgIH1cblxuICAgIHNldFRpdGxlKHRpdGxlJDogT2JzZXJ2YWJsZTxzdHJpbmc+KSB7XG4gICAgICAgIGlmICh0aGlzLl90aXRsZVN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fdGl0bGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RpdGxlU3Vic2NyaXB0aW9uID0gdGl0bGUkXG4gICAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCh0aXRsZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLnNldFRpdGxlKHRpdGxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZpcmVTdGF0ZUNoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuX2dvbGRlbkxheW91dENvbXBvbmVudC5maXJlU3RhdGVDaGFuZ2VkKCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICB0aGlzLl9kZXN0cm95Lm5leHQoKTtcbiAgICAgIHRoaXMuX2Rlc3Ryb3kuY29tcGxldGUoKTtcbiAgICB9XG59XG4iXX0=