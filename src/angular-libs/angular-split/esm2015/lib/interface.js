/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @record
 */
export function IPoint() { }
if (false) {
    /** @type {?} */
    IPoint.prototype.x;
    /** @type {?} */
    IPoint.prototype.y;
}
/**
 * @record
 */
export function IArea() { }
if (false) {
    /** @type {?} */
    IArea.prototype.component;
    /** @type {?} */
    IArea.prototype.order;
    /** @type {?} */
    IArea.prototype.size;
    /** @type {?} */
    IArea.prototype.minSize;
    /** @type {?} */
    IArea.prototype.maxSize;
}
/**
 * @record
 */
export function ISplitSnapshot() { }
if (false) {
    /** @type {?} */
    ISplitSnapshot.prototype.gutterNum;
    /** @type {?} */
    ISplitSnapshot.prototype.allAreasSizePixel;
    /** @type {?} */
    ISplitSnapshot.prototype.allInvolvedAreasSizePercent;
    /** @type {?} */
    ISplitSnapshot.prototype.lastSteppedOffset;
    /** @type {?} */
    ISplitSnapshot.prototype.areasBeforeGutter;
    /** @type {?} */
    ISplitSnapshot.prototype.areasAfterGutter;
}
/**
 * @record
 */
export function IAreaSnapshot() { }
if (false) {
    /** @type {?} */
    IAreaSnapshot.prototype.area;
    /** @type {?} */
    IAreaSnapshot.prototype.sizePixelAtStart;
    /** @type {?} */
    IAreaSnapshot.prototype.sizePercentAtStart;
}
/**
 * @record
 */
export function ISplitSideAbsorptionCapacity() { }
if (false) {
    /** @type {?} */
    ISplitSideAbsorptionCapacity.prototype.remain;
    /** @type {?} */
    ISplitSideAbsorptionCapacity.prototype.list;
}
/**
 * @record
 */
export function IAreaAbsorptionCapacity() { }
if (false) {
    /** @type {?} */
    IAreaAbsorptionCapacity.prototype.areaSnapshot;
    /** @type {?} */
    IAreaAbsorptionCapacity.prototype.pixelAbsorb;
    /** @type {?} */
    IAreaAbsorptionCapacity.prototype.percentAfterAbsorption;
    /** @type {?} */
    IAreaAbsorptionCapacity.prototype.pixelRemain;
}
/**
 * @record
 */
export function IOutputData() { }
if (false) {
    /** @type {?} */
    IOutputData.prototype.gutterNum;
    /** @type {?} */
    IOutputData.prototype.sizes;
}
/**
 * @record
 */
export function IOutputAreaSizes() { }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1zcGxpdC8iLCJzb3VyY2VzIjpbImxpYi9pbnRlcmZhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBLDRCQUdDOzs7SUFGRyxtQkFBVTs7SUFDVixtQkFBVTs7Ozs7QUFHZCwyQkFNQzs7O0lBTEcsMEJBQThCOztJQUM5QixzQkFBYzs7SUFDZCxxQkFBb0I7O0lBQ3BCLHdCQUF1Qjs7SUFDdkIsd0JBQXVCOzs7OztBQUszQixvQ0FPQzs7O0lBTkcsbUNBQWlCOztJQUNqQiwyQ0FBeUI7O0lBQ3pCLHFEQUFtQzs7SUFDbkMsMkNBQXlCOztJQUN6QiwyQ0FBdUM7O0lBQ3ZDLDBDQUFzQzs7Ozs7QUFHMUMsbUNBSUM7OztJQUhHLDZCQUFXOztJQUNYLHlDQUF3Qjs7SUFDeEIsMkNBQTBCOzs7OztBQUs5QixrREFHQzs7O0lBRkcsOENBQWM7O0lBQ2QsNENBQW9DOzs7OztBQUd4Qyw2Q0FLQzs7O0lBSkcsK0NBQTJCOztJQUMzQiw4Q0FBbUI7O0lBQ25CLHlEQUE4Qjs7SUFDOUIsOENBQW1COzs7OztBQUt2QixpQ0FHQzs7O0lBRkcsZ0NBQWlCOztJQUNqQiw0QkFBdUI7Ozs7O0FBRzNCLHNDQUFnRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNwbGl0QXJlYURpcmVjdGl2ZSB9IGZyb20gXCIuL2RpcmVjdGl2ZS9zcGxpdEFyZWEuZGlyZWN0aXZlXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElQb2ludCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFyZWEge1xyXG4gICAgY29tcG9uZW50OiBTcGxpdEFyZWFEaXJlY3RpdmU7XHJcbiAgICBvcmRlcjogbnVtYmVyO1xyXG4gICAgc2l6ZTogbnVtYmVyIHwgbnVsbDtcclxuICAgIG1pblNpemU6IG51bWJlciB8IG51bGw7XHJcbiAgICBtYXhTaXplOiBudW1iZXIgfCBudWxsO1xyXG59XHJcblxyXG4vLyBDUkVBVEVEIE9OIERSQUcgU1RBUlRcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVNwbGl0U25hcHNob3Qge1xyXG4gICAgZ3V0dGVyTnVtOiBudW1iZXJcclxuICAgIGFsbEFyZWFzU2l6ZVBpeGVsOiBudW1iZXJcclxuICAgIGFsbEludm9sdmVkQXJlYXNTaXplUGVyY2VudDogbnVtYmVyXHJcbiAgICBsYXN0U3RlcHBlZE9mZnNldDogbnVtYmVyXHJcbiAgICBhcmVhc0JlZm9yZUd1dHRlcjogQXJyYXk8SUFyZWFTbmFwc2hvdD5cclxuICAgIGFyZWFzQWZ0ZXJHdXR0ZXI6IEFycmF5PElBcmVhU25hcHNob3Q+XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFyZWFTbmFwc2hvdCB7XHJcbiAgICBhcmVhOiBJQXJlYVxyXG4gICAgc2l6ZVBpeGVsQXRTdGFydDogbnVtYmVyXHJcbiAgICBzaXplUGVyY2VudEF0U3RhcnQ6IG51bWJlclxyXG59XHJcblxyXG4vLyBDUkVBVEVEIE9OIERSQUcgUFJPR1JFU1NcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVNwbGl0U2lkZUFic29ycHRpb25DYXBhY2l0eSB7XHJcbiAgICByZW1haW46IG51bWJlclxyXG4gICAgbGlzdDogQXJyYXk8SUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHk+XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgYXJlYVNuYXBzaG90OiBJQXJlYVNuYXBzaG90XHJcbiAgICBwaXhlbEFic29yYjogbnVtYmVyXHJcbiAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiBudW1iZXJcclxuICAgIHBpeGVsUmVtYWluOiBudW1iZXJcclxufVxyXG5cclxuLy8gQ1JFQVRFRCBUTyBTRU5EIE9VVFNJREVcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU91dHB1dERhdGEge1xyXG4gICAgZ3V0dGVyTnVtOiBudW1iZXJcclxuICAgIHNpemVzOiBJT3V0cHV0QXJlYVNpemVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU91dHB1dEFyZWFTaXplcyBleHRlbmRzIEFycmF5PG51bWJlciB8ICcqJz4ge30iXX0=