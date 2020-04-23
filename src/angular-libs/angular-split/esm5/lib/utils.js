/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @param {?} event
 * @return {?}
 */
export function getPointFromEvent(event) {
    // TouchEvent
    if (((/** @type {?} */ (event))).changedTouches !== undefined && ((/** @type {?} */ (event))).changedTouches.length > 0) {
        return {
            x: ((/** @type {?} */ (event))).changedTouches[0].clientX,
            y: ((/** @type {?} */ (event))).changedTouches[0].clientY,
        };
    }
    // MouseEvent
    else if (((/** @type {?} */ (event))).clientX !== undefined && ((/** @type {?} */ (event))).clientY !== undefined) {
        return {
            x: ((/** @type {?} */ (event))).clientX,
            y: ((/** @type {?} */ (event))).clientY,
        };
    }
    return null;
}
/**
 * @param {?} elRef
 * @param {?} direction
 * @return {?}
 */
export function getElementPixelSize(elRef, direction) {
    /** @type {?} */
    var rect = ((/** @type {?} */ (elRef.nativeElement))).getBoundingClientRect();
    return (direction === 'horizontal') ? rect.width : rect.height;
}
/**
 * @param {?} v
 * @return {?}
 */
export function getInputBoolean(v) {
    return (typeof (v) === 'boolean') ? v : (v === 'false' ? false : true);
}
/**
 * @template T
 * @param {?} v
 * @param {?} defaultValue
 * @return {?}
 */
export function getInputPositiveNumber(v, defaultValue) {
    if (v === null || v === undefined)
        return defaultValue;
    v = Number(v);
    return !isNaN(v) && v >= 0 ? v : defaultValue;
}
/**
 * @param {?} unit
 * @param {?} sizes
 * @return {?}
 */
export function isUserSizesValid(unit, sizes) {
    // All sizes have to be not null and total should be 100
    if (unit === 'percent') {
        /** @type {?} */
        var total = sizes.reduce(function (total, s) { return s !== null ? total + s : total; }, 0);
        return sizes.every(function (s) { return s !== null; }) && total > 99.9 && total < 100.1;
    }
    // A size at null is mandatory but only one.
    if (unit === 'pixel') {
        return sizes.filter(function (s) { return s === null; }).length === 1;
    }
}
/**
 * @param {?} a
 * @return {?}
 */
export function getAreaMinSize(a) {
    if (a.size === null) {
        return null;
    }
    if (a.component.lockSize === true) {
        return a.size;
    }
    if (a.component.minSize === null) {
        return null;
    }
    if (a.component.minSize > a.size) {
        return a.size;
    }
    return a.component.minSize;
}
/**
 * @param {?} a
 * @return {?}
 */
export function getAreaMaxSize(a) {
    if (a.size === null) {
        return null;
    }
    if (a.component.lockSize === true) {
        return a.size;
    }
    if (a.component.maxSize === null) {
        return null;
    }
    if (a.component.maxSize < a.size) {
        return a.size;
    }
    return a.component.maxSize;
}
/**
 * @param {?} unit
 * @param {?} sideAreas
 * @param {?} pixels
 * @param {?} allAreasSizePixel
 * @return {?}
 */
export function getGutterSideAbsorptionCapacity(unit, sideAreas, pixels, allAreasSizePixel) {
    return sideAreas.reduce(function (acc, area) {
        /** @type {?} */
        var res = getAreaAbsorptionCapacity(unit, area, acc.remain, allAreasSizePixel);
        acc.list.push(res);
        acc.remain = res.pixelRemain;
        return acc;
    }, { remain: pixels, list: [] });
}
/**
 * @param {?} unit
 * @param {?} areaSnapshot
 * @param {?} pixels
 * @param {?} allAreasSizePixel
 * @return {?}
 */
function getAreaAbsorptionCapacity(unit, areaSnapshot, pixels, allAreasSizePixel) {
    // No pain no gain
    if (pixels === 0) {
        return {
            areaSnapshot: areaSnapshot,
            pixelAbsorb: 0,
            percentAfterAbsorption: areaSnapshot.sizePercentAtStart,
            pixelRemain: 0,
        };
    }
    // Area start at zero and need to be reduced, not possible
    if (areaSnapshot.sizePixelAtStart === 0 && pixels < 0) {
        return {
            areaSnapshot: areaSnapshot,
            pixelAbsorb: 0,
            percentAfterAbsorption: 0,
            pixelRemain: pixels,
        };
    }
    if (unit === 'percent') {
        return getAreaAbsorptionCapacityPercent(areaSnapshot, pixels, allAreasSizePixel);
    }
    if (unit === 'pixel') {
        return getAreaAbsorptionCapacityPixel(areaSnapshot, pixels, allAreasSizePixel);
    }
}
/**
 * @param {?} areaSnapshot
 * @param {?} pixels
 * @param {?} allAreasSizePixel
 * @return {?}
 */
function getAreaAbsorptionCapacityPercent(areaSnapshot, pixels, allAreasSizePixel) {
    /** @type {?} */
    var tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
    /** @type {?} */
    var tempPercentSize = tempPixelSize / allAreasSizePixel * 100;
    // ENLARGE AREA
    if (pixels > 0) {
        // If maxSize & newSize bigger than it > absorb to max and return remaining pixels 
        if (areaSnapshot.area.maxSize !== null && tempPercentSize > areaSnapshot.area.maxSize) {
            // Use area.area.maxSize as newPercentSize and return calculate pixels remaining
            /** @type {?} */
            var maxSizePixel = areaSnapshot.area.maxSize / 100 * allAreasSizePixel;
            return {
                areaSnapshot: areaSnapshot,
                pixelAbsorb: maxSizePixel,
                percentAfterAbsorption: areaSnapshot.area.maxSize,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels - maxSizePixel
            };
        }
        return {
            areaSnapshot: areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: tempPercentSize > 100 ? 100 : tempPercentSize,
            pixelRemain: 0
        };
    }
    // REDUCE AREA
    else if (pixels < 0) {
        // If minSize & newSize smaller than it > absorb to min and return remaining pixels 
        if (areaSnapshot.area.minSize !== null && tempPercentSize < areaSnapshot.area.minSize) {
            // Use area.area.minSize as newPercentSize and return calculate pixels remaining
            /** @type {?} */
            var minSizePixel = areaSnapshot.area.minSize / 100 * allAreasSizePixel;
            return {
                areaSnapshot: areaSnapshot,
                pixelAbsorb: minSizePixel,
                percentAfterAbsorption: areaSnapshot.area.minSize,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels - minSizePixel
            };
        }
        // If reduced under zero > return remaining pixels
        else if (tempPercentSize < 0) {
            // Use 0 as newPercentSize and return calculate pixels remaining
            return {
                areaSnapshot: areaSnapshot,
                pixelAbsorb: -areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: 0,
                pixelRemain: pixels + areaSnapshot.sizePixelAtStart
            };
        }
        return {
            areaSnapshot: areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: tempPercentSize,
            pixelRemain: 0
        };
    }
}
/**
 * @param {?} areaSnapshot
 * @param {?} pixels
 * @param {?} containerSizePixel
 * @return {?}
 */
function getAreaAbsorptionCapacityPixel(areaSnapshot, pixels, containerSizePixel) {
    /** @type {?} */
    var tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
    // ENLARGE AREA
    if (pixels > 0) {
        // If maxSize & newSize bigger than it > absorb to max and return remaining pixels 
        if (areaSnapshot.area.maxSize !== null && tempPixelSize > areaSnapshot.area.maxSize) {
            return {
                areaSnapshot: areaSnapshot,
                pixelAbsorb: areaSnapshot.area.maxSize - areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: -1,
                pixelRemain: tempPixelSize - areaSnapshot.area.maxSize
            };
        }
        return {
            areaSnapshot: areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: -1,
            pixelRemain: 0
        };
    }
    // REDUCE AREA
    else if (pixels < 0) {
        // If minSize & newSize smaller than it > absorb to min and return remaining pixels 
        if (areaSnapshot.area.minSize !== null && tempPixelSize < areaSnapshot.area.minSize) {
            return {
                areaSnapshot: areaSnapshot,
                pixelAbsorb: areaSnapshot.area.minSize + pixels - tempPixelSize,
                percentAfterAbsorption: -1,
                pixelRemain: tempPixelSize - areaSnapshot.area.minSize
            };
        }
        // If reduced under zero > return remaining pixels
        else if (tempPixelSize < 0) {
            return {
                areaSnapshot: areaSnapshot,
                pixelAbsorb: -areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: -1,
                pixelRemain: pixels + areaSnapshot.sizePixelAtStart
            };
        }
        return {
            areaSnapshot: areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: -1,
            pixelRemain: 0
        };
    }
}
/**
 * @param {?} unit
 * @param {?} item
 * @return {?}
 */
export function updateAreaSize(unit, item) {
    if (unit === 'percent') {
        item.areaSnapshot.area.size = item.percentAfterAbsorption;
    }
    else if (unit === 'pixel') {
        // Update size except for the wildcard size area
        if (item.areaSnapshot.area.size !== null) {
            item.areaSnapshot.area.size = item.areaSnapshot.sizePixelAtStart + item.pixelAbsorb;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLXNwbGl0LyIsInNvdXJjZXMiOlsibGliL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBSUEsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQThCO0lBQzVELGFBQWE7SUFDYixJQUFHLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNwRyxPQUFPO1lBQ0gsQ0FBQyxFQUFFLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztZQUNqRCxDQUFDLEVBQUUsQ0FBQyxtQkFBYSxLQUFLLEVBQUEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1NBQ3BELENBQUM7S0FDTDtJQUNELGFBQWE7U0FDUixJQUFHLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1FBQzlGLE9BQU87WUFDSCxDQUFDLEVBQUUsQ0FBQyxtQkFBYSxLQUFLLEVBQUEsQ0FBQyxDQUFDLE9BQU87WUFDL0IsQ0FBQyxFQUFFLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxPQUFPO1NBQ2xDLENBQUM7S0FDTDtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFpQixFQUFFLFNBQW9DOztRQUNqRixJQUFJLEdBQUcsQ0FBQyxtQkFBYyxLQUFLLENBQUMsYUFBYSxFQUFBLENBQUMsQ0FBQyxxQkFBcUIsRUFBRTtJQUV4RSxPQUFPLENBQUMsU0FBUyxLQUFLLFlB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LEVBQUUsTUFBTTtZQUNuQixzQkFBc0IsRUFBRSxDQUFDLENBQUM7WUFDMUIsV0FBVyxFQUFFLENBQUM7U0FDakIsQ0FBQztLQUNMO0FBQ0wsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBQyxJQUF5QixFQUFFLElBQTZCO0lBRW5GLElBQUcsSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO0tBQzdEO1NBQ0ksSUFBRyxJQUFJLEtBQUssT0FBTyxFQUFFO1FBQ3RCLGdEQUFnRDtRQUNoRCxJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUN2RjtLQUNKO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IElBcmVhLCBJUG9pbnQsIElBcmVhU25hcHNob3QsIElTcGxpdFNpZGVBYnNvcnB0aW9uQ2FwYWNpdHksIElBcmVhQWJzb3JwdGlvbkNhcGFjaXR5IH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvaW50RnJvbUV2ZW50KGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCk6IElQb2ludCB7XHJcbiAgICAvLyBUb3VjaEV2ZW50XHJcbiAgICBpZigoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlcyAhPT0gdW5kZWZpbmVkICYmICg8VG91Y2hFdmVudD4gZXZlbnQpLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiAoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgICAgICB5OiAoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvLyBNb3VzZUV2ZW50XHJcbiAgICBlbHNlIGlmKCg8TW91c2VFdmVudD4gZXZlbnQpLmNsaWVudFggIT09IHVuZGVmaW5lZCAmJiAoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRZICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiAoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRYLFxyXG4gICAgICAgICAgICB5OiAoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRZLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRQaXhlbFNpemUoZWxSZWY6IEVsZW1lbnRSZWYsIGRpcmVjdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyk6IG51bWJlciB7XHJcbiAgICBjb25zdCByZWN0ID0gKDxIVE1MRWxlbWVudD4gZWxSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgcmV0dXJuIChkaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykgPyByZWN0LndpZHRoIDogcmVjdC5oZWlnaHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnB1dEJvb2xlYW4odjogYW55KTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHR5cGVvZih2KSA9PT0gJ2Jvb2xlYW4nKSA/IHYgOiAodiA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyPFQ+KHY6IGFueSwgZGVmYXVsdFZhbHVlOiBUKTogbnVtYmVyIHwgVCB7XHJcbiAgICBpZih2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuXHJcbiAgICB2ID0gTnVtYmVyKHYpO1xyXG4gICAgcmV0dXJuICFpc05hTih2KSAmJiB2ID49IDAgPyB2IDogZGVmYXVsdFZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNVc2VyU2l6ZXNWYWxpZCh1bml0OiAncGVyY2VudCcgfCAncGl4ZWwnLCBzaXplczogQXJyYXk8bnVtYmVyIHwgbnVsbD4pOiBib29sZWFuIHtcclxuICAgIC8vIEFsbCBzaXplcyBoYXZlIHRvIGJlIG5vdCBudWxsIGFuZCB0b3RhbCBzaG91bGQgYmUgMTAwXHJcbiAgICBpZih1bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgICBjb25zdCB0b3RhbCA9IHNpemVzLnJlZHVjZSgodG90YWwsIHMpID0+IHMgIT09IG51bGwgPyB0b3RhbCArIHMgOiB0b3RhbCwgMCk7XHJcbiAgICAgICAgcmV0dXJuIHNpemVzLmV2ZXJ5KHMgPT4gcyAhPT0gbnVsbCkgJiYgdG90YWwgPiA5OS45ICYmIHRvdGFsIDwgMTAwLjE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEEgc2l6ZSBhdCBudWxsIGlzIG1hbmRhdG9yeSBidXQgb25seSBvbmUuXHJcbiAgICBpZih1bml0ID09PSAncGl4ZWwnKSB7XHJcbiAgICAgICAgcmV0dXJuIHNpemVzLmZpbHRlcihzID0+IHMgPT09IG51bGwpLmxlbmd0aCA9PT0gMTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZWFNaW5TaXplKGE6IElBcmVhKTogbnVsbCB8IG51bWJlciB7XHJcbiAgICBpZihhLnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoYS5jb21wb25lbnQubG9ja1NpemUgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gYS5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGEuY29tcG9uZW50Lm1pblNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZihhLmNvbXBvbmVudC5taW5TaXplID4gYS5zaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGEuc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYS5jb21wb25lbnQubWluU2l6ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZWFNYXhTaXplKGE6IElBcmVhKTogbnVsbCB8IG51bWJlciB7XHJcbiAgICBpZihhLnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoYS5jb21wb25lbnQubG9ja1NpemUgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gYS5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGEuY29tcG9uZW50Lm1heFNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZihhLmNvbXBvbmVudC5tYXhTaXplIDwgYS5zaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGEuc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYS5jb21wb25lbnQubWF4U2l6ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkodW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJywgc2lkZUFyZWFzOiBBcnJheTxJQXJlYVNuYXBzaG90PiwgcGl4ZWxzOiBudW1iZXIsIGFsbEFyZWFzU2l6ZVBpeGVsOiBudW1iZXIpOiBJU3BsaXRTaWRlQWJzb3JwdGlvbkNhcGFjaXR5IHtcclxuICAgIHJldHVybiBzaWRlQXJlYXMucmVkdWNlKChhY2MsIGFyZWEpID0+IHtcclxuICAgICAgICBjb25zdCByZXMgPSBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5KHVuaXQsIGFyZWEsIGFjYy5yZW1haW4sIGFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICBhY2MubGlzdC5wdXNoKHJlcyk7XHJcbiAgICAgICAgYWNjLnJlbWFpbiAgPSByZXMucGl4ZWxSZW1haW47XHJcbiAgICAgICAgcmV0dXJuIGFjYztcclxuICAgIH0sIHtyZW1haW46IHBpeGVscywgbGlzdDogW119KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eSh1bml0OiAncGVyY2VudCcgfCAncGl4ZWwnLCBhcmVhU25hcHNob3Q6IElBcmVhU25hcHNob3QsIHBpeGVsczogbnVtYmVyLCBhbGxBcmVhc1NpemVQaXhlbDogbnVtYmVyKTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgLy8gTm8gcGFpbiBubyBnYWluXHJcbiAgICBpZihwaXhlbHMgPT09IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiAwLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiBhcmVhU25hcHNob3Quc2l6ZVBlcmNlbnRBdFN0YXJ0LFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBBcmVhIHN0YXJ0IGF0IHplcm8gYW5kIG5lZWQgdG8gYmUgcmVkdWNlZCwgbm90IHBvc3NpYmxlXHJcbiAgICBpZihhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCA9PT0gMCAmJiBwaXhlbHMgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogMCxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogMCxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IHBpeGVscyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih1bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgICByZXR1cm4gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBlcmNlbnQoYXJlYVNuYXBzaG90LCBwaXhlbHMsIGFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgIH1cclxuICAgIFxyXG5cdGlmKHVuaXQgPT09ICdwaXhlbCcpIHtcclxuICAgICAgICByZXR1cm4gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBpeGVsKGFyZWFTbmFwc2hvdCwgcGl4ZWxzLCBhbGxBcmVhc1NpemVQaXhlbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHlQZXJjZW50KGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCwgcGl4ZWxzOiBudW1iZXIsIGFsbEFyZWFzU2l6ZVBpeGVsOiBudW1iZXIpOiBJQXJlYUFic29ycHRpb25DYXBhY2l0eSB7XHJcbiAgICBjb25zdCB0ZW1wUGl4ZWxTaXplID0gYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHM7XHJcbiAgICBjb25zdCB0ZW1wUGVyY2VudFNpemUgPSB0ZW1wUGl4ZWxTaXplIC8gYWxsQXJlYXNTaXplUGl4ZWwgKiAxMDA7XHJcbiAgICBcclxuICAgIC8vIEVOTEFSR0UgQVJFQVxyXG4gICAgXHJcbiAgICBpZihwaXhlbHMgPiAwKSB7XHJcbiAgICAgICAgLy8gSWYgbWF4U2l6ZSAmIG5ld1NpemUgYmlnZ2VyIHRoYW4gaXQgPiBhYnNvcmIgdG8gbWF4IGFuZCByZXR1cm4gcmVtYWluaW5nIHBpeGVscyBcclxuICAgICAgICBpZihhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplICE9PSBudWxsICYmIHRlbXBQZXJjZW50U2l6ZSA+IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUpIHtcclxuICAgICAgICAgICAgLy8gVXNlIGFyZWEuYXJlYS5tYXhTaXplIGFzIG5ld1BlcmNlbnRTaXplIGFuZCByZXR1cm4gY2FsY3VsYXRlIHBpeGVscyByZW1haW5pbmdcclxuICAgICAgICAgICAgY29uc3QgbWF4U2l6ZVBpeGVsID0gYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSAvIDEwMCAqIGFsbEFyZWFzU2l6ZVBpeGVsO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IG1heFNpemVQaXhlbCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHMgLSBtYXhTaXplUGl4ZWxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiB0ZW1wUGVyY2VudFNpemUgPiAxMDAgPyAxMDAgOiB0ZW1wUGVyY2VudFNpemUsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSRURVQ0UgQVJFQVxyXG4gICAgXHJcbiAgICBlbHNlIGlmKHBpeGVscyA8IDApIHtcclxuICAgICAgICAvLyBJZiBtaW5TaXplICYgbmV3U2l6ZSBzbWFsbGVyIHRoYW4gaXQgPiBhYnNvcmIgdG8gbWluIGFuZCByZXR1cm4gcmVtYWluaW5nIHBpeGVscyBcclxuICAgICAgICBpZihhcmVhU25hcHNob3QuYXJlYS5taW5TaXplICE9PSBudWxsICYmIHRlbXBQZXJjZW50U2l6ZSA8IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUpIHtcclxuICAgICAgICAgICAgLy8gVXNlIGFyZWEuYXJlYS5taW5TaXplIGFzIG5ld1BlcmNlbnRTaXplIGFuZCByZXR1cm4gY2FsY3VsYXRlIHBpeGVscyByZW1haW5pbmdcclxuICAgICAgICAgICAgY29uc3QgbWluU2l6ZVBpeGVsID0gYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSAvIDEwMCAqIGFsbEFyZWFzU2l6ZVBpeGVsO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IG1pblNpemVQaXhlbCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHMgLSBtaW5TaXplUGl4ZWxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgcmVkdWNlZCB1bmRlciB6ZXJvID4gcmV0dXJuIHJlbWFpbmluZyBwaXhlbHNcclxuICAgICAgICBlbHNlIGlmKHRlbXBQZXJjZW50U2l6ZSA8IDApIHtcclxuICAgICAgICAgICAgLy8gVXNlIDAgYXMgbmV3UGVyY2VudFNpemUgYW5kIHJldHVybiBjYWxjdWxhdGUgcGl4ZWxzIHJlbWFpbmluZ1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IC1hcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IDAsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogcGl4ZWxzICsgYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiB0ZW1wUGVyY2VudFNpemUsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBpeGVsKGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCwgcGl4ZWxzOiBudW1iZXIsIGNvbnRhaW5lclNpemVQaXhlbDogbnVtYmVyKTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgY29uc3QgdGVtcFBpeGVsU2l6ZSA9IGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ICsgcGl4ZWxzO1xyXG4gICAgICAgICAgICBcclxuICAgIC8vIEVOTEFSR0UgQVJFQVxyXG5cclxuICAgIGlmKHBpeGVscyA+IDApIHtcclxuICAgICAgICAvLyBJZiBtYXhTaXplICYgbmV3U2l6ZSBiaWdnZXIgdGhhbiBpdCA+IGFic29yYiB0byBtYXggYW5kIHJldHVybiByZW1haW5pbmcgcGl4ZWxzIFxyXG4gICAgICAgIGlmKGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUgIT09IG51bGwgJiYgdGVtcFBpeGVsU2l6ZSA+IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplIC0gYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiB0ZW1wUGl4ZWxTaXplIC0gYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBwaXhlbHMsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IC0xLFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUkVEVUNFIEFSRUFcclxuICAgIFxyXG4gICAgZWxzZSBpZihwaXhlbHMgPCAwKSB7XHJcbiAgICAgICAgLy8gSWYgbWluU2l6ZSAmIG5ld1NpemUgc21hbGxlciB0aGFuIGl0ID4gYWJzb3JiIHRvIG1pbiBhbmQgcmV0dXJuIHJlbWFpbmluZyBwaXhlbHMgXHJcbiAgICAgICAgaWYoYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSAhPT0gbnVsbCAmJiB0ZW1wUGl4ZWxTaXplIDwgYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUgKyBwaXhlbHMgLSB0ZW1wUGl4ZWxTaXplLFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogdGVtcFBpeGVsU2l6ZSAtIGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgcmVkdWNlZCB1bmRlciB6ZXJvID4gcmV0dXJuIHJlbWFpbmluZyBwaXhlbHNcclxuICAgICAgICBlbHNlIGlmKHRlbXBQaXhlbFNpemUgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogLWFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogcGl4ZWxzICsgYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IDBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQXJlYVNpemUodW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJywgaXRlbTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkpIHtcclxuICAgIFxyXG4gICAgaWYodW5pdCA9PT0gJ3BlcmNlbnQnKSB7XHJcbiAgICAgICAgaXRlbS5hcmVhU25hcHNob3QuYXJlYS5zaXplID0gaXRlbS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih1bml0ID09PSAncGl4ZWwnKSB7XHJcbiAgICAgICAgLy8gVXBkYXRlIHNpemUgZXhjZXB0IGZvciB0aGUgd2lsZGNhcmQgc2l6ZSBhcmVhXHJcbiAgICAgICAgaWYoaXRlbS5hcmVhU25hcHNob3QuYXJlYS5zaXplICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uYXJlYVNuYXBzaG90LmFyZWEuc2l6ZSA9IGl0ZW0uYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBpdGVtLnBpeGVsQWJzb3JiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==