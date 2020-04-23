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
export class LayoutManagerService {
    /**
     * @return {?}
     */
    get layout() {
        return this._layout;
    }
    /**
     * @param {?} layout
     * @return {?}
     */
    setLayout(layout) {
        this._layout = layout;
    }
    /**
     * @param {?} data
     * @return {?}
     */
    addComponent(data) {
        if (this.layout) {
            this.layout.addComponent(data.layoutItemName, data.state, data.parent);
        }
    }
    /**
     * @param {?} data
     * @return {?}
     */
    addComponentAsColumn(data) {
        if (this.layout) {
            this.layout.addComponentAsColumn(data.layoutItemName, data.state);
        }
    }
    /**
     * @param {?} state
     * @param {?=} fireStateChanged
     * @return {?}
     */
    loadState(state, fireStateChanged = false) {
        if (this.layout) {
            this.layout.loadState(state, fireStateChanged);
        }
    }
    /**
     * @return {?}
     */
    clear() {
        if (this.layout) {
            this.layout.clear();
        }
    }
}
LayoutManagerService.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    LayoutManagerService.prototype._layout;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LW1hbmFnZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItZ29sZGVuLWxheW91dC8iLCJzb3VyY2VzIjpbImxpYi9zZXJ2aWNlcy9sYXlvdXQtbWFuYWdlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFDLFVBQVUsRUFBTyxNQUFNLGVBQWUsQ0FBQzs7OztBQUkvQyxzQ0FJQzs7O0lBSEcsMENBQXVCOztJQUN2QixpQ0FBVzs7SUFDWCxrQ0FBYTs7QUFJakIsTUFBTSxPQUFPLG9CQUFvQjs7OztJQUc3QixJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQzs7Ozs7SUFFRCxTQUFTLENBQUMsTUFBNkI7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQzs7Ozs7SUFFRCxZQUFZLENBQUMsSUFBc0I7UUFDL0IsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUM7Ozs7O0lBRUQsb0JBQW9CLENBQUMsSUFBc0I7UUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyRTtJQUNMLENBQUM7Ozs7OztJQUVELFNBQVMsQ0FBQyxLQUFrQyxFQUFFLG1CQUE0QixLQUFLO1FBQzNFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ2xEO0lBQ0wsQ0FBQzs7OztJQUVELEtBQUs7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQzs7O1lBbENKLFVBQVU7Ozs7Ozs7SUFFUCx1Q0FBdUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIFR5cGV9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge0lHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZX0gZnJvbSBcIi4uL21vZGVscy9nb2xkZW4tbGF5b3V0LWNvbXBvbmVudC1zdGF0ZVwiO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRDb21wb25lbnR9IGZyb20gXCIuLi9jb21wb25lbnRzL2dvbGRlbi1sYXlvdXQvZ29sZGVuLWxheW91dC5jb21wb25lbnRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBBZGRDb21wb25lbnREYXRhIHtcbiAgICBsYXlvdXRJdGVtTmFtZTogc3RyaW5nO1xuICAgIHN0YXRlOiBhbnk7XG4gICAgcGFyZW50PzogYW55O1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTGF5b3V0TWFuYWdlclNlcnZpY2Uge1xuICAgIHByaXZhdGUgX2xheW91dDogR29sZGVuTGF5b3V0Q29tcG9uZW50O1xuXG4gICAgZ2V0IGxheW91dCgpOiBHb2xkZW5MYXlvdXRDb21wb25lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGF5b3V0O1xuICAgIH1cblxuICAgIHNldExheW91dChsYXlvdXQ6IEdvbGRlbkxheW91dENvbXBvbmVudCkge1xuICAgICAgICB0aGlzLl9sYXlvdXQgPSBsYXlvdXQ7XG4gICAgfVxuXG4gICAgYWRkQ29tcG9uZW50KGRhdGE6IEFkZENvbXBvbmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5b3V0KSB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5hZGRDb21wb25lbnQoZGF0YS5sYXlvdXRJdGVtTmFtZSwgZGF0YS5zdGF0ZSwgZGF0YS5wYXJlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkQ29tcG9uZW50QXNDb2x1bW4oZGF0YTogQWRkQ29tcG9uZW50RGF0YSkge1xuICAgICAgICBpZiAodGhpcy5sYXlvdXQpIHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LmFkZENvbXBvbmVudEFzQ29sdW1uKGRhdGEubGF5b3V0SXRlbU5hbWUsIGRhdGEuc3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZFN0YXRlKHN0YXRlOiBJR29sZGVuTGF5b3V0Q29tcG9uZW50U3RhdGUsIGZpcmVTdGF0ZUNoYW5nZWQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBpZiAodGhpcy5sYXlvdXQpIHtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LmxvYWRTdGF0ZShzdGF0ZSwgZmlyZVN0YXRlQ2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgaWYgKHRoaXMubGF5b3V0KSB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19