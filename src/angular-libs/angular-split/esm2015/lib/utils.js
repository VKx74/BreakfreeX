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
    const rect = ((/** @type {?} */ (elRef.nativeElement))).getBoundingClientRect();
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
        const total = sizes.reduce((total, s) => s !== null ? total + s : total, 0);
        return sizes.every(s => s !== null) && total > 99.9 && total < 100.1;
    }
    // A size at null is mandatory but only one.
    if (unit === 'pixel') {
        return sizes.filter(s => s === null).length === 1;
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
    return sideAreas.reduce((acc, area) => {
        /** @type {?} */
        const res = getAreaAbsorptionCapacity(unit, area, acc.remain, allAreasSizePixel);
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
            areaSnapshot,
            pixelAbsorb: 0,
            percentAfterAbsorption: areaSnapshot.sizePercentAtStart,
            pixelRemain: 0,
        };
    }
    // Area start at zero and need to be reduced, not possible
    if (areaSnapshot.sizePixelAtStart === 0 && pixels < 0) {
        return {
            areaSnapshot,
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
    const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
    /** @type {?} */
    const tempPercentSize = tempPixelSize / allAreasSizePixel * 100;
    // ENLARGE AREA
    if (pixels > 0) {
        // If maxSize & newSize bigger than it > absorb to max and return remaining pixels 
        if (areaSnapshot.area.maxSize !== null && tempPercentSize > areaSnapshot.area.maxSize) {
            // Use area.area.maxSize as newPercentSize and return calculate pixels remaining
            /** @type {?} */
            const maxSizePixel = areaSnapshot.area.maxSize / 100 * allAreasSizePixel;
            return {
                areaSnapshot,
                pixelAbsorb: maxSizePixel,
                percentAfterAbsorption: areaSnapshot.area.maxSize,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels - maxSizePixel
            };
        }
        return {
            areaSnapshot,
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
            const minSizePixel = areaSnapshot.area.minSize / 100 * allAreasSizePixel;
            return {
                areaSnapshot,
                pixelAbsorb: minSizePixel,
                percentAfterAbsorption: areaSnapshot.area.minSize,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels - minSizePixel
            };
        }
        // If reduced under zero > return remaining pixels
        else if (tempPercentSize < 0) {
            // Use 0 as newPercentSize and return calculate pixels remaining
            return {
                areaSnapshot,
                pixelAbsorb: -areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: 0,
                pixelRemain: pixels + areaSnapshot.sizePixelAtStart
            };
        }
        return {
            areaSnapshot,
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
    const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
    // ENLARGE AREA
    if (pixels > 0) {
        // If maxSize & newSize bigger than it > absorb to max and return remaining pixels 
        if (areaSnapshot.area.maxSize !== null && tempPixelSize > areaSnapshot.area.maxSize) {
            return {
                areaSnapshot,
                pixelAbsorb: areaSnapshot.area.maxSize - areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: -1,
                pixelRemain: tempPixelSize - areaSnapshot.area.maxSize
            };
        }
        return {
            areaSnapshot,
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
                areaSnapshot,
                pixelAbsorb: areaSnapshot.area.minSize + pixels - tempPixelSize,
                percentAfterAbsorption: -1,
                pixelRemain: tempPixelSize - areaSnapshot.area.minSize
            };
        }
        // If reduced under zero > return remaining pixels
        else if (tempPixelSize < 0) {
            return {
                areaSnapshot,
                pixelAbsorb: -areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: -1,
                pixelRemain: pixels + areaSnapshot.sizePixelAtStart
            };
        }
        return {
            areaSnapshot,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLXNwbGl0LyIsInNvdXJjZXMiOlsibGliL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBSUEsTUFBTSxVQUFVLGlCQUFpQixDQUFDLEtBQThCO0lBQzVELGFBQWE7SUFDYixJQUFHLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxjQUFjLEtBQUssU0FBUyxJQUFJLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNwRyxPQUFPO1lBQ0gsQ0FBQyxFQUFFLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztZQUNqRCxDQUFDLEVBQUUsQ0FBQyxtQkFBYSxLQUFLLEVBQUEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO1NBQ3BELENBQUM7S0FDTDtJQUNELGFBQWE7U0FDUixJQUFHLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1FBQzlGLE9BQU87WUFDSCxDQUFDLEVBQUUsQ0FBQyxtQkFBYSxLQUFLLEVBQUEsQ0FBQyxDQUFDLE9BQU87WUFDL0IsQ0FBQyxFQUFFLENBQUMsbUJBQWEsS0FBSyxFQUFBLENBQUMsQ0FBQyxPQUFPO1NBQ2xDLENBQUM7S0FDTDtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFpQixFQUFFLFNBQW9DOztVQUNqRixJQUFJLEdBQUcsQ0FBQyxtQkFBYyxLQUFLLENBQUMsYUFBYSxFQUFBLENBQUMsQ0FBQyxxQkFBcUIsRUFBRTtJQUV4RSxPQUFPLENBQUMsU0FBUyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ25FLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGVBQWUsQ0FBQyxDQUFNO0lBQ2xDLE9BQU8sQ0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFFLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsc0JBQXNCLENBQUksQ0FBTSxFQUFFLFlBQWU7SUFDN0QsSUFBRyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxTQUFTO1FBQUUsT0FBTyxZQUFZLENBQUM7SUFFdEQsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFDbEQsQ0FBQzs7Ozs7O0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLElBQXlCLEVBQUUsS0FBMkI7SUFDbkYsd0RBQXdEO0lBQ3hELElBQUcsSUFBSSxLQUFLLFNBQVMsRUFBRTs7Y0FDYixLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDM0UsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztLQUN4RTtJQUVELDRDQUE0QztJQUM1QyxJQUFHLElBQUksS0FBSyxPQUFPLEVBQUU7UUFDakIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7S0FDckQ7QUFDTCxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsQ0FBUTtJQUNuQyxJQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtRQUM5QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDakI7SUFFRCxJQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxLQUFLLElBQUksRUFBRTtRQUM3QixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztLQUNqQjtJQUVELE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDL0IsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLENBQVE7SUFDbkMsSUFBRyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtRQUNoQixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7UUFDOUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0tBQ2pCO0lBRUQsSUFBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sS0FBSyxJQUFJLEVBQUU7UUFDN0IsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRTtRQUM3QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDakI7SUFFRCxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQy9CLENBQUM7Ozs7Ozs7O0FBRUQsTUFBTSxVQUFVLCtCQUErQixDQUFDLElBQXlCLEVBQUUsU0FBK0IsRUFBRSxNQUFjLEVBQUUsaUJBQXlCO0lBQ2pKLE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTs7Y0FDNUIsR0FBRyxHQUFHLHlCQUF5QixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQztRQUNoRixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsTUFBTSxHQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDOUIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0FBQ25DLENBQUM7Ozs7Ozs7O0FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxJQUF5QixFQUFFLFlBQTJCLEVBQUUsTUFBYyxFQUFFLGlCQUF5QjtJQUNoSSxrQkFBa0I7SUFDbEIsSUFBRyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ2IsT0FBTztZQUNILFlBQVk7WUFDWixXQUFXLEVBQUUsQ0FBQztZQUNkLHNCQUFzQixFQUFFLFlBQVksQ0FBQyxrQkFBa0I7WUFDdkQsV0FBVyxFQUFFLENBQUM7U0FDakIsQ0FBQztLQUNMO0lBRUQsMERBQTBEO0lBQzFELElBQUcsWUFBWSxDQUFDLGdCQUFnQixLQUFLLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2xELE9BQU87WUFDSCxZQUFZO1lBQ1osV0FBVyxFQUFFLENBQUM7WUFDZCxzQkFBc0IsRUFBRSxDQUFDO1lBQ3pCLFdBQVcsRUFBRSxNQUFNO1NBQ3RCLENBQUM7S0FDTDtJQUVELElBQUcsSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUNuQixPQUFPLGdDQUFnQyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztLQUNwRjtJQUVKLElBQUcsSUFBSSxLQUFLLE9BQU8sRUFBRTtRQUNkLE9BQU8sOEJBQThCLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0tBQ2xGO0FBQ0wsQ0FBQzs7Ozs7OztBQUVELFNBQVMsZ0NBQWdDLENBQUMsWUFBMkIsRUFBRSxNQUFjLEVBQUUsaUJBQXlCOztVQUN0RyxhQUFhLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixHQUFHLE1BQU07O1VBQ3RELGVBQWUsR0FBRyxhQUFhLEdBQUcsaUJBQWlCLEdBQUcsR0FBRztJQUUvRCxlQUFlO0lBRWYsSUFBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ1gsbUZBQW1GO1FBQ25GLElBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLGVBQWUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTs7O2tCQUU1RSxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLGlCQUFpQjtZQUN4RSxPQUFPO2dCQUNILFlBQVk7Z0JBQ1osV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLHNCQUFzQixFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFDakQsV0FBVyxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLEdBQUcsWUFBWTthQUNyRSxDQUFDO1NBQ0w7UUFDRCxPQUFPO1lBQ0gsWUFBWTtZQUNaLFdBQVcsRUFBRSxNQUFNO1lBQ25CLHNCQUFzQixFQUFFLGVBQWUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsZUFBZTtZQUNyRSxXQUFXLEVBQUUsQ0FBQztTQUNqQixDQUFDO0tBQ0w7SUFFRCxjQUFjO1NBRVQsSUFBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2hCLG9GQUFvRjtRQUNwRixJQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxlQUFlLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7OztrQkFFNUUsWUFBWSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxpQkFBaUI7WUFDeEUsT0FBTztnQkFDSCxZQUFZO2dCQUNaLFdBQVcsRUFBRSxZQUFZO2dCQUN6QixzQkFBc0IsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU87Z0JBQ2pELFdBQVcsRUFBRSxZQUFZLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxHQUFHLFlBQVk7YUFDckUsQ0FBQztTQUNMO1FBQ0Qsa0RBQWtEO2FBQzdDLElBQUcsZUFBZSxHQUFHLENBQUMsRUFBRTtZQUN6QixnRUFBZ0U7WUFDaEUsT0FBTztnQkFDSCxZQUFZO2dCQUNaLFdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0I7Z0JBQzNDLHNCQUFzQixFQUFFLENBQUM7Z0JBQ3pCLFdBQVcsRUFBRSxNQUFNLEdBQUcsWUFBWSxDQUFDLGdCQUFnQjthQUN0RCxDQUFDO1NBQ0w7UUFDRCxPQUFPO1lBQ0gsWUFBWTtZQUNaLFdBQVcsRUFBRSxNQUFNO1lBQ25CLHNCQUFzQixFQUFFLGVBQWU7WUFDdkMsV0FBVyxFQUFFLENBQUM7U0FDakIsQ0FBQztLQUNMO0FBQ0wsQ0FBQzs7Ozs7OztBQUVELFNBQVMsOEJBQThCLENBQUMsWUFBMkIsRUFBRSxNQUFjLEVBQUUsa0JBQTBCOztVQUNyRyxhQUFhLEdBQUcsWUFBWSxDQUFDLGdCQUFnQixHQUFHLE1BQU07SUFFNUQsZUFBZTtJQUVmLElBQUcsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNYLG1GQUFtRjtRQUNuRixJQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEYsT0FBTztnQkFDSCxZQUFZO2dCQUNaLFdBQVcsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsZ0JBQWdCO2dCQUN0RSxzQkFBc0IsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLFdBQVcsRUFBRSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPO2FBQ3pELENBQUM7U0FDTDtRQUNELE9BQU87WUFDSCxZQUFZO1lBQ1osV0FBVyxFQUFFLE1BQU07WUFDbkIsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFdBQVcsRUFBRSxDQUFDO1NBQ2pCLENBQUM7S0FDTDtJQUVELGNBQWM7U0FFVCxJQUFHLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDaEIsb0ZBQW9GO1FBQ3BGLElBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxJQUFJLGFBQWEsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoRixPQUFPO2dCQUNILFlBQVk7Z0JBQ1osV0FBVyxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxhQUFhO2dCQUMvRCxzQkFBc0IsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLFdBQVcsRUFBRSxhQUFhLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPO2FBQ3pELENBQUM7U0FDTDtRQUNELGtEQUFrRDthQUM3QyxJQUFHLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDdkIsT0FBTztnQkFDSCxZQUFZO2dCQUNaLFdBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0I7Z0JBQzNDLHNCQUFzQixFQUFFLENBQUMsQ0FBQztnQkFDMUIsV0FBVyxFQUFFLE1BQU0sR0FBRyxZQUFZLENBQUMsZ0JBQWdCO2FBQ3RELENBQUM7U0FDTDtRQUNELE9BQU87WUFDSCxZQUFZO1lBQ1osV0FBVyxFQUFFLE1BQU07WUFDbkIsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFdBQVcsRUFBRSxDQUFDO1NBQ2pCLENBQUM7S0FDTDtBQUNMLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsSUFBeUIsRUFBRSxJQUE2QjtJQUVuRixJQUFHLElBQUksS0FBSyxTQUFTLEVBQUU7UUFDbkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztLQUM3RDtTQUNJLElBQUcsSUFBSSxLQUFLLE9BQU8sRUFBRTtRQUN0QixnREFBZ0Q7UUFDaEQsSUFBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDdkY7S0FDSjtBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBJQXJlYSwgSVBvaW50LCBJQXJlYVNuYXBzaG90LCBJU3BsaXRTaWRlQWJzb3JwdGlvbkNhcGFjaXR5LCBJQXJlYUFic29ycHRpb25DYXBhY2l0eSB9IGZyb20gJy4vaW50ZXJmYWNlJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQb2ludEZyb21FdmVudChldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpOiBJUG9pbnQge1xyXG4gICAgLy8gVG91Y2hFdmVudFxyXG4gICAgaWYoKDxUb3VjaEV2ZW50PiBldmVudCkuY2hhbmdlZFRvdWNoZXMgIT09IHVuZGVmaW5lZCAmJiAoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDogKDxUb3VjaEV2ZW50PiBldmVudCkuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICAgICAgeTogKDxUb3VjaEV2ZW50PiBldmVudCkuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLy8gTW91c2VFdmVudFxyXG4gICAgZWxzZSBpZigoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRYICE9PSB1bmRlZmluZWQgJiYgKDxNb3VzZUV2ZW50PiBldmVudCkuY2xpZW50WSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgeDogKDxNb3VzZUV2ZW50PiBldmVudCkuY2xpZW50WCxcclxuICAgICAgICAgICAgeTogKDxNb3VzZUV2ZW50PiBldmVudCkuY2xpZW50WSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50UGl4ZWxTaXplKGVsUmVmOiBFbGVtZW50UmVmLCBkaXJlY3Rpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcpOiBudW1iZXIge1xyXG4gICAgY29uc3QgcmVjdCA9ICg8SFRNTEVsZW1lbnQ+IGVsUmVmLm5hdGl2ZUVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgIHJldHVybiAoZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gcmVjdC53aWR0aCA6IHJlY3QuaGVpZ2h0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5wdXRCb29sZWFuKHY6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICh0eXBlb2YodikgPT09ICdib29sZWFuJykgPyB2IDogKHYgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcjxUPih2OiBhbnksIGRlZmF1bHRWYWx1ZTogVCk6IG51bWJlciB8IFQge1xyXG4gICAgaWYodiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQpIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcblxyXG4gICAgdiA9IE51bWJlcih2KTtcclxuICAgIHJldHVybiAhaXNOYU4odikgJiYgdiA+PSAwID8gdiA6IGRlZmF1bHRWYWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVXNlclNpemVzVmFsaWQodW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJywgc2l6ZXM6IEFycmF5PG51bWJlciB8IG51bGw+KTogYm9vbGVhbiB7XHJcbiAgICAvLyBBbGwgc2l6ZXMgaGF2ZSB0byBiZSBub3QgbnVsbCBhbmQgdG90YWwgc2hvdWxkIGJlIDEwMFxyXG4gICAgaWYodW5pdCA9PT0gJ3BlcmNlbnQnKSB7XHJcbiAgICAgICAgY29uc3QgdG90YWwgPSBzaXplcy5yZWR1Y2UoKHRvdGFsLCBzKSA9PiBzICE9PSBudWxsID8gdG90YWwgKyBzIDogdG90YWwsIDApO1xyXG4gICAgICAgIHJldHVybiBzaXplcy5ldmVyeShzID0+IHMgIT09IG51bGwpICYmIHRvdGFsID4gOTkuOSAmJiB0b3RhbCA8IDEwMC4xO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBBIHNpemUgYXQgbnVsbCBpcyBtYW5kYXRvcnkgYnV0IG9ubHkgb25lLlxyXG4gICAgaWYodW5pdCA9PT0gJ3BpeGVsJykge1xyXG4gICAgICAgIHJldHVybiBzaXplcy5maWx0ZXIocyA9PiBzID09PSBudWxsKS5sZW5ndGggPT09IDE7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmVhTWluU2l6ZShhOiBJQXJlYSk6IG51bGwgfCBudW1iZXIge1xyXG4gICAgaWYoYS5zaXplID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKGEuY29tcG9uZW50LmxvY2tTaXplID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGEuc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZihhLmNvbXBvbmVudC5taW5TaXplID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYS5jb21wb25lbnQubWluU2l6ZSA+IGEuc2l6ZSkge1xyXG4gICAgICAgIHJldHVybiBhLnNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGEuY29tcG9uZW50Lm1pblNpemU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmVhTWF4U2l6ZShhOiBJQXJlYSk6IG51bGwgfCBudW1iZXIge1xyXG4gICAgaWYoYS5zaXplID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKGEuY29tcG9uZW50LmxvY2tTaXplID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIGEuc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZihhLmNvbXBvbmVudC5tYXhTaXplID09PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYS5jb21wb25lbnQubWF4U2l6ZSA8IGEuc2l6ZSkge1xyXG4gICAgICAgIHJldHVybiBhLnNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGEuY29tcG9uZW50Lm1heFNpemU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KHVuaXQ6ICdwZXJjZW50JyB8ICdwaXhlbCcsIHNpZGVBcmVhczogQXJyYXk8SUFyZWFTbmFwc2hvdD4sIHBpeGVsczogbnVtYmVyLCBhbGxBcmVhc1NpemVQaXhlbDogbnVtYmVyKTogSVNwbGl0U2lkZUFic29ycHRpb25DYXBhY2l0eSB7XHJcbiAgICByZXR1cm4gc2lkZUFyZWFzLnJlZHVjZSgoYWNjLCBhcmVhKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eSh1bml0LCBhcmVhLCBhY2MucmVtYWluLCBhbGxBcmVhc1NpemVQaXhlbCk7XHJcbiAgICAgICAgYWNjLmxpc3QucHVzaChyZXMpO1xyXG4gICAgICAgIGFjYy5yZW1haW4gID0gcmVzLnBpeGVsUmVtYWluO1xyXG4gICAgICAgIHJldHVybiBhY2M7XHJcbiAgICB9LCB7cmVtYWluOiBwaXhlbHMsIGxpc3Q6IFtdfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkodW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJywgYXJlYVNuYXBzaG90OiBJQXJlYVNuYXBzaG90LCBwaXhlbHM6IG51bWJlciwgYWxsQXJlYXNTaXplUGl4ZWw6IG51bWJlcik6IElBcmVhQWJzb3JwdGlvbkNhcGFjaXR5IHtcclxuICAgIC8vIE5vIHBhaW4gbm8gZ2FpblxyXG4gICAgaWYocGl4ZWxzID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogMCxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogYXJlYVNuYXBzaG90LnNpemVQZXJjZW50QXRTdGFydCxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IDAsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gQXJlYSBzdGFydCBhdCB6ZXJvIGFuZCBuZWVkIHRvIGJlIHJlZHVjZWQsIG5vdCBwb3NzaWJsZVxyXG4gICAgaWYoYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgPT09IDAgJiYgcGl4ZWxzIDwgMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IDAsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IDAsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiBwaXhlbHMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYodW5pdCA9PT0gJ3BlcmNlbnQnKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHlQZXJjZW50KGFyZWFTbmFwc2hvdCwgcGl4ZWxzLCBhbGxBcmVhc1NpemVQaXhlbCk7XHJcbiAgICB9XHJcbiAgICBcclxuXHRpZih1bml0ID09PSAncGl4ZWwnKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHlQaXhlbChhcmVhU25hcHNob3QsIHBpeGVscywgYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5UGVyY2VudChhcmVhU25hcHNob3Q6IElBcmVhU25hcHNob3QsIHBpeGVsczogbnVtYmVyLCBhbGxBcmVhc1NpemVQaXhlbDogbnVtYmVyKTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgY29uc3QgdGVtcFBpeGVsU2l6ZSA9IGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ICsgcGl4ZWxzO1xyXG4gICAgY29uc3QgdGVtcFBlcmNlbnRTaXplID0gdGVtcFBpeGVsU2l6ZSAvIGFsbEFyZWFzU2l6ZVBpeGVsICogMTAwO1xyXG4gICAgXHJcbiAgICAvLyBFTkxBUkdFIEFSRUFcclxuICAgIFxyXG4gICAgaWYocGl4ZWxzID4gMCkge1xyXG4gICAgICAgIC8vIElmIG1heFNpemUgJiBuZXdTaXplIGJpZ2dlciB0aGFuIGl0ID4gYWJzb3JiIHRvIG1heCBhbmQgcmV0dXJuIHJlbWFpbmluZyBwaXhlbHMgXHJcbiAgICAgICAgaWYoYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSAhPT0gbnVsbCAmJiB0ZW1wUGVyY2VudFNpemUgPiBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSBhcmVhLmFyZWEubWF4U2l6ZSBhcyBuZXdQZXJjZW50U2l6ZSBhbmQgcmV0dXJuIGNhbGN1bGF0ZSBwaXhlbHMgcmVtYWluaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IG1heFNpemVQaXhlbCA9IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUgLyAxMDAgKiBhbGxBcmVhc1NpemVQaXhlbDtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBtYXhTaXplUGl4ZWwsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplLFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxSZW1haW46IGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ICsgcGl4ZWxzIC0gbWF4U2l6ZVBpeGVsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IHBpeGVscyxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogdGVtcFBlcmNlbnRTaXplID4gMTAwID8gMTAwIDogdGVtcFBlcmNlbnRTaXplLFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUkVEVUNFIEFSRUFcclxuICAgIFxyXG4gICAgZWxzZSBpZihwaXhlbHMgPCAwKSB7XHJcbiAgICAgICAgLy8gSWYgbWluU2l6ZSAmIG5ld1NpemUgc21hbGxlciB0aGFuIGl0ID4gYWJzb3JiIHRvIG1pbiBhbmQgcmV0dXJuIHJlbWFpbmluZyBwaXhlbHMgXHJcbiAgICAgICAgaWYoYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSAhPT0gbnVsbCAmJiB0ZW1wUGVyY2VudFNpemUgPCBhcmVhU25hcHNob3QuYXJlYS5taW5TaXplKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSBhcmVhLmFyZWEubWluU2l6ZSBhcyBuZXdQZXJjZW50U2l6ZSBhbmQgcmV0dXJuIGNhbGN1bGF0ZSBwaXhlbHMgcmVtYWluaW5nXHJcbiAgICAgICAgICAgIGNvbnN0IG1pblNpemVQaXhlbCA9IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUgLyAxMDAgKiBhbGxBcmVhc1NpemVQaXhlbDtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBtaW5TaXplUGl4ZWwsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiBhcmVhU25hcHNob3QuYXJlYS5taW5TaXplLFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxSZW1haW46IGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ICsgcGl4ZWxzIC0gbWluU2l6ZVBpeGVsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIHJlZHVjZWQgdW5kZXIgemVybyA+IHJldHVybiByZW1haW5pbmcgcGl4ZWxzXHJcbiAgICAgICAgZWxzZSBpZih0ZW1wUGVyY2VudFNpemUgPCAwKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSAwIGFzIG5ld1BlcmNlbnRTaXplIGFuZCByZXR1cm4gY2FsY3VsYXRlIHBpeGVscyByZW1haW5pbmdcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiAtYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAwLFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxSZW1haW46IHBpeGVscyArIGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IHBpeGVscyxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogdGVtcFBlcmNlbnRTaXplLFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHlQaXhlbChhcmVhU25hcHNob3Q6IElBcmVhU25hcHNob3QsIHBpeGVsczogbnVtYmVyLCBjb250YWluZXJTaXplUGl4ZWw6IG51bWJlcik6IElBcmVhQWJzb3JwdGlvbkNhcGFjaXR5IHtcclxuICAgIGNvbnN0IHRlbXBQaXhlbFNpemUgPSBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCArIHBpeGVscztcclxuICAgICAgICAgICAgXHJcbiAgICAvLyBFTkxBUkdFIEFSRUFcclxuXHJcbiAgICBpZihwaXhlbHMgPiAwKSB7XHJcbiAgICAgICAgLy8gSWYgbWF4U2l6ZSAmIG5ld1NpemUgYmlnZ2VyIHRoYW4gaXQgPiBhYnNvcmIgdG8gbWF4IGFuZCByZXR1cm4gcmVtYWluaW5nIHBpeGVscyBcclxuICAgICAgICBpZihhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplICE9PSBudWxsICYmIHRlbXBQaXhlbFNpemUgPiBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSAtIGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogdGVtcFBpeGVsU2l6ZSAtIGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IDBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJFRFVDRSBBUkVBXHJcbiAgICBcclxuICAgIGVsc2UgaWYocGl4ZWxzIDwgMCkge1xyXG4gICAgICAgIC8vIElmIG1pblNpemUgJiBuZXdTaXplIHNtYWxsZXIgdGhhbiBpdCA+IGFic29yYiB0byBtaW4gYW5kIHJldHVybiByZW1haW5pbmcgcGl4ZWxzIFxyXG4gICAgICAgIGlmKGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUgIT09IG51bGwgJiYgdGVtcFBpeGVsU2l6ZSA8IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBhcmVhU25hcHNob3QuYXJlYS5taW5TaXplICsgcGl4ZWxzIC0gdGVtcFBpeGVsU2l6ZSxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IC0xLFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxSZW1haW46IHRlbXBQaXhlbFNpemUgLSBhcmVhU25hcHNob3QuYXJlYS5taW5TaXplXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIHJlZHVjZWQgdW5kZXIgemVybyA+IHJldHVybiByZW1haW5pbmcgcGl4ZWxzXHJcbiAgICAgICAgZWxzZSBpZih0ZW1wUGl4ZWxTaXplIDwgMCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IC1hcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IC0xLFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxSZW1haW46IHBpeGVscyArIGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IHBpeGVscyxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUFyZWFTaXplKHVuaXQ6ICdwZXJjZW50JyB8ICdwaXhlbCcsIGl0ZW06IElBcmVhQWJzb3JwdGlvbkNhcGFjaXR5KSB7XHJcbiAgICBcclxuICAgIGlmKHVuaXQgPT09ICdwZXJjZW50Jykge1xyXG4gICAgICAgIGl0ZW0uYXJlYVNuYXBzaG90LmFyZWEuc2l6ZSA9IGl0ZW0ucGVyY2VudEFmdGVyQWJzb3JwdGlvbjtcclxuICAgIH1cclxuICAgIGVsc2UgaWYodW5pdCA9PT0gJ3BpeGVsJykge1xyXG4gICAgICAgIC8vIFVwZGF0ZSBzaXplIGV4Y2VwdCBmb3IgdGhlIHdpbGRjYXJkIHNpemUgYXJlYVxyXG4gICAgICAgIGlmKGl0ZW0uYXJlYVNuYXBzaG90LmFyZWEuc2l6ZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpdGVtLmFyZWFTbmFwc2hvdC5hcmVhLnNpemUgPSBpdGVtLmFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ICsgaXRlbS5waXhlbEFic29yYjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=