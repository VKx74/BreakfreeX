import { Component, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, ElementRef, NgZone, ViewChildren, EventEmitter, Directive, NgModule } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @param {?} event
 * @return {?}
 */
function getPointFromEvent(event) {
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
function getElementPixelSize(elRef, direction) {
    /** @type {?} */
    const rect = ((/** @type {?} */ (elRef.nativeElement))).getBoundingClientRect();
    return (direction === 'horizontal') ? rect.width : rect.height;
}
/**
 * @param {?} v
 * @return {?}
 */
function getInputBoolean(v) {
    return (typeof (v) === 'boolean') ? v : (v === 'false' ? false : true);
}
/**
 * @template T
 * @param {?} v
 * @param {?} defaultValue
 * @return {?}
 */
function getInputPositiveNumber(v, defaultValue) {
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
function isUserSizesValid(unit, sizes) {
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
function getAreaMinSize(a) {
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
function getAreaMaxSize(a) {
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
function getGutterSideAbsorptionCapacity(unit, sideAreas, pixels, allAreasSizePixel) {
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
function updateAreaSize(unit, item) {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * angular-split
 *
 *
 *  PERCENT MODE ([unit]="'percent'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |       20                 30                 20                 15                 15      | <-- [size]="x"
 * |               10px               10px               10px               10px               | <-- [gutterSize]="10"
 * |calc(20% - 8px)    calc(30% - 12px)   calc(20% - 8px)    calc(15% - 6px)    calc(15% - 6px)| <-- CSS flex-basis property (with flex-grow&shrink at 0)
 * |     152px              228px              152px              114px              114px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <-- el.getBoundingClientRect().width
 *  flex-basis = calc( { area.size }% - { area.size/100 * nbGutter*gutterSize }px );
 *
 *
 *  PIXEL MODE ([unit]="'pixel'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |      100                250                 *                 150                100      | <-- [size]="y"
 * |               10px               10px               10px               10px               | <-- [gutterSize]="10"
 * |   0 0 100px          0 0 250px           1 1 auto          0 0 150px          0 0 100px   | <-- CSS flex property (flex-grow/flex-shrink/flex-basis)
 * |     100px              250px              200px              150px              100px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <-- el.getBoundingClientRect().width
 *
 */
class SplitComponent {
    /**
     * @param {?} ngZone
     * @param {?} elRef
     * @param {?} cdRef
     * @param {?} renderer
     */
    constructor(ngZone, elRef, cdRef, renderer) {
        this.ngZone = ngZone;
        this.elRef = elRef;
        this.cdRef = cdRef;
        this.renderer = renderer;
        this._direction = 'horizontal';
        ////
        this._unit = 'percent';
        ////
        this._gutterSize = 11;
        ////
        this._gutterStep = 1;
        ////
        this._restrictMove = false;
        ////
        this._useTransition = false;
        ////
        this._disabled = false;
        ////
        this._dir = 'ltr';
        ////
        this._gutterDblClickDuration = 0;
        ////
        this.dragStart = new EventEmitter(false);
        this.dragEnd = new EventEmitter(false);
        this.gutterClick = new EventEmitter(false);
        this.gutterDblClick = new EventEmitter(false);
        this.dragProgressSubject = new Subject();
        this.dragProgress$ = this.dragProgressSubject.asObservable();
        ////
        this.isDragging = false;
        this.dragListeners = [];
        this.snapshot = null;
        this.startPoint = null;
        this.endPoint = null;
        this.displayedAreas = [];
        this.hidedAreas = [];
        this._clickTimeout = null;
        // To force adding default class, could be override by user @Input() or not
        this.direction = this._direction;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set direction(v) {
        this._direction = (v === 'vertical') ? 'vertical' : 'horizontal';
        this.renderer.addClass(this.elRef.nativeElement, `as-${this._direction}`);
        this.renderer.removeClass(this.elRef.nativeElement, `as-${(this._direction === 'vertical') ? 'horizontal' : 'vertical'}`);
        this.build(false, false);
    }
    /**
     * @return {?}
     */
    get direction() {
        return this._direction;
    }
    /**
     * @return {?}
     */
    get isHorizontalDirection() {
        return this.direction === 'horizontal';
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set unit(v) {
        this._unit = (v === 'pixel') ? 'pixel' : 'percent';
        this.renderer.addClass(this.elRef.nativeElement, `as-${this._unit}`);
        this.renderer.removeClass(this.elRef.nativeElement, `as-${(this._unit === 'pixel') ? 'percent' : 'pixel'}`);
        this.build(false, true);
    }
    /**
     * @return {?}
     */
    get unit() {
        return this._unit;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set gutterSize(v) {
        this._gutterSize = getInputPositiveNumber(v, 11);
        this.build(false, false);
    }
    /**
     * @return {?}
     */
    get gutterSize() {
        return this._gutterSize;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set gutterStep(v) {
        this._gutterStep = getInputPositiveNumber(v, 1);
    }
    /**
     * @return {?}
     */
    get gutterStep() {
        return this._gutterStep;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set restrictMove(v) {
        this._restrictMove = getInputBoolean(v);
    }
    /**
     * @return {?}
     */
    get restrictMove() {
        return this._restrictMove;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set useTransition(v) {
        this._useTransition = getInputBoolean(v);
        if (this._useTransition) {
            this.renderer.addClass(this.elRef.nativeElement, 'as-transition');
        }
        else {
            this.renderer.removeClass(this.elRef.nativeElement, 'as-transition');
        }
    }
    /**
     * @return {?}
     */
    get useTransition() {
        return this._useTransition;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set disabled(v) {
        this._disabled = getInputBoolean(v);
        if (this._disabled) {
            this.renderer.addClass(this.elRef.nativeElement, 'as-disabled');
        }
        else {
            this.renderer.removeClass(this.elRef.nativeElement, 'as-disabled');
        }
    }
    /**
     * @return {?}
     */
    get disabled() {
        return this._disabled;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set dir(v) {
        this._dir = (v === 'rtl') ? 'rtl' : 'ltr';
        this.renderer.setAttribute(this.elRef.nativeElement, 'dir', this._dir);
    }
    /**
     * @return {?}
     */
    get dir() {
        return this._dir;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set gutterDblClickDuration(v) {
        this._gutterDblClickDuration = getInputPositiveNumber(v, 0);
    }
    /**
     * @return {?}
     */
    get gutterDblClickDuration() {
        return this._gutterDblClickDuration;
    }
    /**
     * @return {?}
     */
    get transitionEnd() {
        return new Observable(subscriber => this.transitionEndSubscriber = subscriber).pipe(debounceTime(20));
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.ngZone.runOutsideAngular(() => {
            // To avoid transition at first rendering
            setTimeout(() => this.renderer.addClass(this.elRef.nativeElement, 'as-init'));
        });
    }
    /**
     * @return {?}
     */
    getNbGutters() {
        return (this.displayedAreas.length === 0) ? 0 : this.displayedAreas.length - 1;
    }
    /**
     * @param {?} component
     * @return {?}
     */
    addArea(component) {
        /** @type {?} */
        const newArea = {
            component,
            order: 0,
            size: 0,
            minSize: null,
            maxSize: null,
        };
        if (component.visible === true) {
            this.displayedAreas.push(newArea);
            this.build(true, true);
        }
        else {
            this.hidedAreas.push(newArea);
        }
    }
    /**
     * @param {?} component
     * @return {?}
     */
    removeArea(component) {
        if (this.displayedAreas.some(a => a.component === component)) {
            /** @type {?} */
            const area = this.displayedAreas.find(a => a.component === component);
            this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
            this.build(true, true);
        }
        else if (this.hidedAreas.some(a => a.component === component)) {
            /** @type {?} */
            const area = this.hidedAreas.find(a => a.component === component);
            this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
        }
    }
    /**
     * @param {?} component
     * @param {?} resetOrders
     * @param {?} resetSizes
     * @return {?}
     */
    updateArea(component, resetOrders, resetSizes) {
        if (component.visible === true) {
            this.build(resetOrders, resetSizes);
        }
    }
    /**
     * @param {?} component
     * @return {?}
     */
    showArea(component) {
        /** @type {?} */
        const area = this.hidedAreas.find(a => a.component === component);
        if (area === undefined) {
            return;
        }
        /** @type {?} */
        const areas = this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
        this.displayedAreas.push(...areas);
        this.build(true, true);
    }
    /**
     * @param {?} comp
     * @return {?}
     */
    hideArea(comp) {
        /** @type {?} */
        const area = this.displayedAreas.find(a => a.component === comp);
        if (area === undefined) {
            return;
        }
        /** @type {?} */
        const areas = this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
        areas.forEach(area => {
            area.order = 0;
            area.size = 0;
        });
        this.hidedAreas.push(...areas);
        this.build(true, true);
    }
    /**
     * @return {?}
     */
    getVisibleAreaSizes() {
        return this.displayedAreas.map(a => a.size === null ? '*' : a.size);
    }
    /**
     * @param {?} sizes
     * @return {?}
     */
    setVisibleAreaSizes(sizes) {
        if (sizes.length !== this.displayedAreas.length) {
            return false;
        }
        /** @type {?} */
        const formatedSizes = sizes.map(s => getInputPositiveNumber(s, null));
        /** @type {?} */
        const isValid = isUserSizesValid(this.unit, formatedSizes);
        if (isValid === false) {
            return false;
        }
        // @ts-ignore
        this.displayedAreas.forEach((area, i) => area.component._size = formatedSizes[i]);
        this.build(false, true);
        return true;
    }
    /**
     * @param {?} resetOrders
     * @param {?} resetSizes
     * @return {?}
     */
    build(resetOrders, resetSizes) {
        this.stopDragging();
        // ¤ AREAS ORDER
        if (resetOrders === true) {
            // If user provided 'order' for each area, use it to sort them.
            if (this.displayedAreas.every(a => a.component.order !== null)) {
                this.displayedAreas.sort((a, b) => ((/** @type {?} */ (a.component.order))) - ((/** @type {?} */ (b.component.order))));
            }
            // Then set real order with multiples of 2, numbers between will be used by gutters.
            this.displayedAreas.forEach((area, i) => {
                area.order = i * 2;
                area.component.setStyleOrder(area.order);
            });
        }
        // ¤ AREAS SIZE
        if (resetSizes === true) {
            /** @type {?} */
            const useUserSizes = isUserSizesValid(this.unit, this.displayedAreas.map(a => a.component.size));
            switch (this.unit) {
                case 'percent': {
                    /** @type {?} */
                    const defaultSize = 100 / this.displayedAreas.length;
                    this.displayedAreas.forEach(area => {
                        area.size = useUserSizes ? (/** @type {?} */ (area.component.size)) : defaultSize;
                        area.minSize = getAreaMinSize(area);
                        area.maxSize = getAreaMaxSize(area);
                    });
                    break;
                }
                case 'pixel': {
                    if (useUserSizes) {
                        this.displayedAreas.forEach(area => {
                            area.size = area.component.size;
                            area.minSize = getAreaMinSize(area);
                            area.maxSize = getAreaMaxSize(area);
                        });
                    }
                    else {
                        /** @type {?} */
                        const wildcardSizeAreas = this.displayedAreas.filter(a => a.component.size === null);
                        // No wildcard area > Need to select one arbitrarily > first
                        if (wildcardSizeAreas.length === 0 && this.displayedAreas.length > 0) {
                            this.displayedAreas.forEach((area, i) => {
                                area.size = (i === 0) ? null : area.component.size;
                                area.minSize = (i === 0) ? null : getAreaMinSize(area);
                                area.maxSize = (i === 0) ? null : getAreaMaxSize(area);
                            });
                        }
                        // More than one wildcard area > Need to keep only one arbitrarly > first
                        else if (wildcardSizeAreas.length > 1) {
                            /** @type {?} */
                            let alreadyGotOne = false;
                            this.displayedAreas.forEach(area => {
                                if (area.component.size === null) {
                                    if (alreadyGotOne === false) {
                                        area.size = null;
                                        area.minSize = null;
                                        area.maxSize = null;
                                        alreadyGotOne = true;
                                    }
                                    else {
                                        area.size = 100;
                                        area.minSize = null;
                                        area.maxSize = null;
                                    }
                                }
                                else {
                                    area.size = area.component.size;
                                    area.minSize = getAreaMinSize(area);
                                    area.maxSize = getAreaMaxSize(area);
                                }
                            });
                        }
                    }
                    break;
                }
            }
        }
        this.refreshStyleSizes();
        this.cdRef.markForCheck();
    }
    /**
     * @return {?}
     */
    refreshStyleSizes() {
        ///////////////////////////////////////////
        // PERCENT MODE
        if (this.unit === 'percent') {
            // Only one area > flex-basis 100%
            if (this.displayedAreas.length === 1) {
                this.displayedAreas[0].component.setStyleFlex(0, 0, `100%`, false, false);
            }
            // Multiple areas > use each percent basis
            else {
                /** @type {?} */
                const sumGutterSize = this.getNbGutters() * this.gutterSize;
                this.displayedAreas.forEach(area => {
                    area.component.setStyleFlex(0, 0, `calc( ${area.size}% - ${(/** @type {?} */ (area.size)) / 100 * sumGutterSize}px )`, (area.minSize !== null && area.minSize === area.size) ? true : false, (area.maxSize !== null && area.maxSize === area.size) ? true : false);
                });
            }
        }
        ///////////////////////////////////////////
        // PIXEL MODE
        else if (this.unit === 'pixel') {
            this.displayedAreas.forEach(area => {
                // Area with wildcard size
                if (area.size === null) {
                    if (this.displayedAreas.length === 1) {
                        area.component.setStyleFlex(1, 1, `100%`, false, false);
                    }
                    else {
                        area.component.setStyleFlex(1, 1, `auto`, false, false);
                    }
                }
                // Area with pixel size
                else {
                    // Only one area > flex-basis 100%
                    if (this.displayedAreas.length === 1) {
                        area.component.setStyleFlex(0, 0, `100%`, false, false);
                    }
                    // Multiple areas > use each pixel basis
                    else {
                        area.component.setStyleFlex(0, 0, `${area.size}px`, (area.minSize !== null && area.minSize === area.size) ? true : false, (area.maxSize !== null && area.maxSize === area.size) ? true : false);
                    }
                }
            });
        }
    }
    /**
     * @param {?} event
     * @param {?} gutterNum
     * @return {?}
     */
    clickGutter(event, gutterNum) {
        /** @type {?} */
        const tempPoint = getPointFromEvent(event);
        // Be sure mouseup/touchend happened at same point as mousedown/touchstart to trigger click/dblclick
        if (this.startPoint && this.startPoint.x === tempPoint.x && this.startPoint.y === tempPoint.y) {
            // If timeout in progress and new click > clearTimeout & dblClickEvent
            if (this._clickTimeout !== null) {
                window.clearTimeout(this._clickTimeout);
                this._clickTimeout = null;
                this.notify('dblclick', gutterNum);
                this.stopDragging();
            }
            // Else start timeout to call clickEvent at end
            else {
                this._clickTimeout = window.setTimeout(() => {
                    this._clickTimeout = null;
                    this.notify('click', gutterNum);
                    this.stopDragging();
                }, this.gutterDblClickDuration);
            }
        }
    }
    /**
     * @param {?} event
     * @param {?} gutterOrder
     * @param {?} gutterNum
     * @return {?}
     */
    startDragging(event, gutterOrder, gutterNum) {
        event.preventDefault();
        event.stopPropagation();
        this.startPoint = getPointFromEvent(event);
        if (this.startPoint === null || this.disabled === true) {
            return;
        }
        this.snapshot = {
            gutterNum,
            lastSteppedOffset: 0,
            allAreasSizePixel: getElementPixelSize(this.elRef, this.direction) - this.getNbGutters() * this.gutterSize,
            allInvolvedAreasSizePercent: 100,
            areasBeforeGutter: [],
            areasAfterGutter: [],
        };
        this.displayedAreas.forEach(area => {
            /** @type {?} */
            const areaSnapshot = {
                area,
                sizePixelAtStart: getElementPixelSize(area.component.elRef, this.direction),
                sizePercentAtStart: (this.unit === 'percent') ? area.size : -1 // If pixel mode, anyway, will not be used.
            };
            if (area.order < gutterOrder) {
                if (this.restrictMove === true) {
                    this.snapshot.areasBeforeGutter = [areaSnapshot];
                }
                else {
                    this.snapshot.areasBeforeGutter.unshift(areaSnapshot);
                }
            }
            else if (area.order > gutterOrder) {
                if (this.restrictMove === true) {
                    if (this.snapshot.areasAfterGutter.length === 0) {
                        this.snapshot.areasAfterGutter = [areaSnapshot];
                    }
                }
                else {
                    this.snapshot.areasAfterGutter.push(areaSnapshot);
                }
            }
        });
        this.snapshot.allInvolvedAreasSizePercent = [...this.snapshot.areasBeforeGutter, ...this.snapshot.areasAfterGutter].reduce((t, a) => t + a.sizePercentAtStart, 0);
        if (this.snapshot.areasBeforeGutter.length === 0 || this.snapshot.areasAfterGutter.length === 0) {
            return;
        }
        this.ngZone.runOutsideAngular(() => {
            this.dragListeners.push(this.renderer.listen('document', 'mouseup', this.stopDragging.bind(this)));
            this.dragListeners.push(this.renderer.listen('document', 'touchend', this.stopDragging.bind(this)));
            this.dragListeners.push(this.renderer.listen('document', 'touchcancel', this.stopDragging.bind(this)));
            this.dragListeners.push(this.renderer.listen('document', 'mousemove', this.dragEvent.bind(this)));
            this.dragListeners.push(this.renderer.listen('document', 'touchmove', this.dragEvent.bind(this)));
        });
        this.displayedAreas.forEach(area => area.component.lockEvents());
        this.isDragging = true;
        this.renderer.addClass(this.elRef.nativeElement, 'as-dragging');
        this.renderer.addClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');
        this.notify('start', this.snapshot.gutterNum);
    }
    /**
     * @param {?} event
     * @return {?}
     */
    dragEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this._clickTimeout !== null) {
            window.clearTimeout(this._clickTimeout);
            this._clickTimeout = null;
        }
        if (this.isDragging === false) {
            return;
        }
        this.endPoint = getPointFromEvent(event);
        if (this.endPoint === null) {
            return;
        }
        // Calculate steppedOffset
        /** @type {?} */
        let offset = (this.direction === 'horizontal') ? (this.startPoint.x - this.endPoint.x) : (this.startPoint.y - this.endPoint.y);
        if (this.dir === 'rtl') {
            offset = -offset;
        }
        /** @type {?} */
        const steppedOffset = Math.round(offset / this.gutterStep) * this.gutterStep;
        if (steppedOffset === this.snapshot.lastSteppedOffset) {
            return;
        }
        this.snapshot.lastSteppedOffset = steppedOffset;
        // Need to know if each gutter side areas could reacts to steppedOffset
        /** @type {?} */
        let areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -steppedOffset, this.snapshot.allAreasSizePixel);
        /** @type {?} */
        let areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset, this.snapshot.allAreasSizePixel);
        // Each gutter side areas can't absorb all offset 
        if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
            if (Math.abs(areasBefore.remain) === Math.abs(areasAfter.remain)) ;
            else if (Math.abs(areasBefore.remain) > Math.abs(areasAfter.remain)) {
                areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset + areasBefore.remain, this.snapshot.allAreasSizePixel);
            }
            else {
                areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -(steppedOffset - areasAfter.remain), this.snapshot.allAreasSizePixel);
            }
        }
        // Areas before gutter can't absorbs all offset > need to recalculate sizes for areas after gutter.
        else if (areasBefore.remain !== 0) {
            areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset + areasBefore.remain, this.snapshot.allAreasSizePixel);
        }
        // Areas after gutter can't absorbs all offset > need to recalculate sizes for areas before gutter.
        else if (areasAfter.remain !== 0) {
            areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -(steppedOffset - areasAfter.remain), this.snapshot.allAreasSizePixel);
        }
        if (this.unit === 'percent') {
            // Hack because of browser messing up with sizes using calc(X% - Ypx) -> el.getBoundingClientRect()
            // If not there, playing with gutters makes total going down to 99.99875% then 99.99286%, 99.98986%,..
            /** @type {?} */
            const all = [...areasBefore.list, ...areasAfter.list];
            /** @type {?} */
            const areaToReset = all.find(a => a.percentAfterAbsorption !== 0 && a.percentAfterAbsorption !== a.areaSnapshot.area.minSize && a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize);
            if (areaToReset) {
                areaToReset.percentAfterAbsorption = this.snapshot.allInvolvedAreasSizePercent - all.filter(a => a !== areaToReset).reduce((total, a) => total + a.percentAfterAbsorption, 0);
            }
        }
        // Now we know areas could absorb steppedOffset, time to really update sizes
        areasBefore.list.forEach(item => updateAreaSize(this.unit, item));
        areasAfter.list.forEach(item => updateAreaSize(this.unit, item));
        /** @type {?} */
        const areasResized = areasBefore.remain === 0 && areasAfter.remain === 0;
        if (areasResized) {
            this._moveGutter(this.snapshot.gutterNum - 1, steppedOffset);
        }
        // this.refreshStyleSizes();
        this.notify('progress', this.snapshot.gutterNum);
    }
    /**
     * @param {?=} event
     * @return {?}
     */
    stopDragging(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.isDragging === false) {
            return;
        }
        this.refreshStyleSizes();
        this._resetGutterOffset(this.snapshot.gutterNum - 1);
        this.displayedAreas.forEach(area => area.component.unlockEvents());
        while (this.dragListeners.length > 0) {
            /** @type {?} */
            const fct = this.dragListeners.pop();
            if (fct) {
                fct();
            }
        }
        // Warning: Have to be before "notify('end')"
        // because "notify('end')"" can be linked to "[size]='x'" > "build()" > "stopDragging()"
        this.isDragging = false;
        // If moved from starting point, notify end
        if (this.endPoint && (this.startPoint.x !== this.endPoint.x || this.startPoint.y !== this.endPoint.y)) {
            this.notify('end', this.snapshot.gutterNum);
        }
        this.renderer.removeClass(this.elRef.nativeElement, 'as-dragging');
        this.renderer.removeClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');
        this.snapshot = null;
        // Needed to let (click)="clickGutter(...)" event run and verify if mouse moved or not
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.startPoint = null;
                this.endPoint = null;
            });
        });
    }
    /**
     * @param {?} type
     * @param {?} gutterNum
     * @return {?}
     */
    notify(type, gutterNum) {
        /** @type {?} */
        const sizes = this.getVisibleAreaSizes();
        if (type === 'start') {
            this.dragStart.emit({ gutterNum, sizes });
        }
        else if (type === 'end') {
            this.dragEnd.emit({ gutterNum, sizes });
        }
        else if (type === 'click') {
            this.gutterClick.emit({ gutterNum, sizes });
        }
        else if (type === 'dblclick') {
            this.gutterDblClick.emit({ gutterNum, sizes });
        }
        else if (type === 'transitionEnd') {
            if (this.transitionEndSubscriber) {
                this.ngZone.run(() => this.transitionEndSubscriber.next(sizes));
            }
        }
        else if (type === 'progress') {
            // Stay outside zone to allow users do what they want about change detection mechanism.
            this.dragProgressSubject.next({ gutterNum, sizes });
        }
    }
    /**
     * @param {?} gutterIndex
     * @param {?} offset
     * @return {?}
     */
    _moveGutter(gutterIndex, offset) {
        /** @type {?} */
        const gutter = this.gutterEls.toArray()[gutterIndex].nativeElement;
        if (this.isHorizontalDirection) {
            gutter.style.left = `${-offset}px`;
        }
        else {
            gutter.style.top = `${-offset}px`;
        }
    }
    /**
     * @param {?} gutterIndex
     * @return {?}
     */
    _resetGutterOffset(gutterIndex) {
        /** @type {?} */
        const gutter = this.gutterEls.toArray()[gutterIndex].nativeElement;
        if (this.isHorizontalDirection) {
            gutter.style.left = '0px';
        }
        else {
            gutter.style.top = '0px';
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.stopDragging();
    }
}
SplitComponent.decorators = [
    { type: Component, args: [{
                selector: 'as-split',
                exportAs: 'asSplit',
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: `
        <ng-content></ng-content>
        <ng-template ngFor [ngForOf]="displayedAreas" let-index="index" let-last="last">
            <div *ngIf="last === false"
                 #gutterEls
                 class="as-split-gutter"
                 [style.flex-basis.px]="gutterSize"
                 [style.order]="index*2+1"
                 (mousedown)="startDragging($event, index*2+1, index+1)"
                 (touchstart)="startDragging($event, index*2+1, index+1)"
                 (mouseup)="clickGutter($event, index+1)"
                 (touchend)="clickGutter($event, index+1)">
                <div class="as-split-gutter-icon"></div>
            </div>
        </ng-template>`,
                styles: [":host{display:flex;flex-wrap:nowrap;justify-content:flex-start;align-items:stretch;overflow:hidden;width:100%;height:100%}:host>.as-split-gutter{position:relative;flex-grow:0;flex-shrink:0;background-color:#eee;display:flex;align-items:center;justify-content:center}:host>.as-split-gutter>.as-split-gutter-icon{width:100%;height:100%;background-position:center center;background-repeat:no-repeat}:host ::ng-deep>.as-split-area{flex-grow:0;flex-shrink:0;overflow-x:hidden;overflow-y:auto}:host ::ng-deep>.as-split-area.as-hidden{flex:0 1 0!important;overflow-x:hidden;overflow-y:hidden}:host.as-horizontal{flex-direction:row}:host.as-horizontal>.as-split-gutter{flex-direction:row;cursor:col-resize;height:100%}:host.as-horizontal>.as-split-gutter>.as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-horizontal ::ng-deep>.as-split-area{height:100%}:host.as-vertical{flex-direction:column}:host.as-vertical>.as-split-gutter{flex-direction:column;cursor:row-resize;width:100%}:host.as-vertical>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC)}:host.as-vertical ::ng-deep>.as-split-area{width:100%}:host.as-vertical ::ng-deep>.as-split-area.as-hidden{max-width:0}:host.as-disabled>.as-split-gutter{cursor:default}:host.as-disabled>.as-split-gutter .as-split-gutter-icon{background-image:none}:host.as-transition.as-init:not(.as-dragging) ::ng-deep>.as-split-area,:host.as-transition.as-init:not(.as-dragging)>.as-split-gutter{transition:flex-basis .3s}"]
            }] }
];
/** @nocollapse */
SplitComponent.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: Renderer2 }
];
SplitComponent.propDecorators = {
    direction: [{ type: Input }],
    unit: [{ type: Input }],
    gutterSize: [{ type: Input }],
    gutterStep: [{ type: Input }],
    restrictMove: [{ type: Input }],
    useTransition: [{ type: Input }],
    disabled: [{ type: Input }],
    dir: [{ type: Input }],
    gutterDblClickDuration: [{ type: Input }],
    dragStart: [{ type: Output }],
    dragEnd: [{ type: Output }],
    gutterClick: [{ type: Output }],
    gutterDblClick: [{ type: Output }],
    transitionEnd: [{ type: Output }],
    gutterEls: [{ type: ViewChildren, args: ['gutterEls',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
class SplitAreaDirective {
    /**
     * @param {?} ngZone
     * @param {?} elRef
     * @param {?} renderer
     * @param {?} split
     */
    constructor(ngZone, elRef, renderer, split) {
        this.ngZone = ngZone;
        this.elRef = elRef;
        this.renderer = renderer;
        this.split = split;
        this._order = null;
        ////
        this._size = null;
        ////
        this._minSize = null;
        ////
        this._maxSize = null;
        ////
        this._lockSize = false;
        ////
        this._visible = true;
        this.lockListeners = [];
        this.renderer.addClass(this.elRef.nativeElement, 'as-split-area');
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set order(v) {
        this._order = getInputPositiveNumber(v, null);
        this.split.updateArea(this, true, false);
    }
    /**
     * @return {?}
     */
    get order() {
        return this._order;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set size(v) {
        this._size = getInputPositiveNumber(v, null);
        this.split.updateArea(this, false, true);
    }
    /**
     * @return {?}
     */
    get size() {
        return this._size;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set minSize(v) {
        this._minSize = getInputPositiveNumber(v, null);
        this.split.updateArea(this, false, true);
    }
    /**
     * @return {?}
     */
    get minSize() {
        return this._minSize;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set maxSize(v) {
        this._maxSize = getInputPositiveNumber(v, null);
        this.split.updateArea(this, false, true);
    }
    /**
     * @return {?}
     */
    get maxSize() {
        return this._maxSize;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set lockSize(v) {
        this._lockSize = getInputBoolean(v);
        this.split.updateArea(this, false, true);
    }
    /**
     * @return {?}
     */
    get lockSize() {
        return this._lockSize;
    }
    /**
     * @param {?} v
     * @return {?}
     */
    set visible(v) {
        this._visible = getInputBoolean(v);
        if (this._visible) {
            this.split.showArea(this);
            this.renderer.removeClass(this.elRef.nativeElement, 'as-hidden');
        }
        else {
            this.split.hideArea(this);
            this.renderer.addClass(this.elRef.nativeElement, 'as-hidden');
        }
    }
    /**
     * @return {?}
     */
    get visible() {
        return this._visible;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.split.addArea(this);
        this.ngZone.runOutsideAngular(() => {
            this.transitionListener = this.renderer.listen(this.elRef.nativeElement, 'transitionend', (event) => {
                // Limit only flex-basis transition to trigger the event
                if (event.propertyName === 'flex-basis') {
                    this.split.notify('transitionEnd', -1);
                }
            });
        });
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setStyleOrder(value) {
        this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
    }
    /**
     * @param {?} grow
     * @param {?} shrink
     * @param {?} basis
     * @param {?} isMin
     * @param {?} isMax
     * @return {?}
     */
    setStyleFlex(grow, shrink, basis, isMin, isMax) {
        // Need 3 separated properties to work on IE11 (https://github.com/angular/flex-layout/issues/323)
        this.renderer.setStyle(this.elRef.nativeElement, 'flex-grow', grow);
        this.renderer.setStyle(this.elRef.nativeElement, 'flex-shrink', shrink);
        this.renderer.setStyle(this.elRef.nativeElement, 'flex-basis', basis);
        if (isMin === true)
            this.renderer.addClass(this.elRef.nativeElement, 'as-min');
        else
            this.renderer.removeClass(this.elRef.nativeElement, 'as-min');
        if (isMax === true)
            this.renderer.addClass(this.elRef.nativeElement, 'as-max');
        else
            this.renderer.removeClass(this.elRef.nativeElement, 'as-max');
    }
    /**
     * @return {?}
     */
    lockEvents() {
        this.ngZone.runOutsideAngular(() => {
            this.lockListeners.push(this.renderer.listen(this.elRef.nativeElement, 'selectstart', (e) => false));
            this.lockListeners.push(this.renderer.listen(this.elRef.nativeElement, 'dragstart', (e) => false));
        });
    }
    /**
     * @return {?}
     */
    unlockEvents() {
        while (this.lockListeners.length > 0) {
            /** @type {?} */
            const fct = this.lockListeners.pop();
            if (fct)
                fct();
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.unlockEvents();
        if (this.transitionListener) {
            this.transitionListener();
        }
        this.split.removeArea(this);
    }
}
SplitAreaDirective.decorators = [
    { type: Directive, args: [{
                selector: 'as-split-area, [as-split-area]',
                exportAs: 'asSplitArea'
            },] }
];
/** @nocollapse */
SplitAreaDirective.ctorParameters = () => [
    { type: NgZone },
    { type: ElementRef },
    { type: Renderer2 },
    { type: SplitComponent }
];
SplitAreaDirective.propDecorators = {
    order: [{ type: Input }],
    size: [{ type: Input }],
    minSize: [{ type: Input }],
    maxSize: [{ type: Input }],
    lockSize: [{ type: Input }],
    visible: [{ type: Input }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
class AngularSplitModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: AngularSplitModule,
            providers: []
        };
    }
    /**
     * @return {?}
     */
    static forChild() {
        return {
            ngModule: AngularSplitModule,
            providers: []
        };
    }
}
AngularSplitModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [
                    SplitComponent,
                    SplitAreaDirective,
                ],
                exports: [
                    SplitComponent,
                    SplitAreaDirective,
                ]
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */

export { AngularSplitModule, SplitComponent, SplitAreaDirective };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1zcGxpdC5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8vYW5ndWxhci1zcGxpdC9saWIvdXRpbHMudHMiLCJuZzovL2FuZ3VsYXItc3BsaXQvbGliL2NvbXBvbmVudC9zcGxpdC5jb21wb25lbnQudHMiLCJuZzovL2FuZ3VsYXItc3BsaXQvbGliL2RpcmVjdGl2ZS9zcGxpdEFyZWEuZGlyZWN0aXZlLnRzIiwibmc6Ly9hbmd1bGFyLXNwbGl0L2xpYi9tb2R1bGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgSUFyZWEsIElQb2ludCwgSUFyZWFTbmFwc2hvdCwgSVNwbGl0U2lkZUFic29ycHRpb25DYXBhY2l0eSwgSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkgfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9pbnRGcm9tRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogSVBvaW50IHtcclxuICAgIC8vIFRvdWNoRXZlbnRcclxuICAgIGlmKCg8VG91Y2hFdmVudD4gZXZlbnQpLmNoYW5nZWRUb3VjaGVzICE9PSB1bmRlZmluZWQgJiYgKDxUb3VjaEV2ZW50PiBldmVudCkuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6ICg8VG91Y2hFdmVudD4gZXZlbnQpLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHk6ICg8VG91Y2hFdmVudD4gZXZlbnQpLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8vIE1vdXNlRXZlbnRcclxuICAgIGVsc2UgaWYoKDxNb3VzZUV2ZW50PiBldmVudCkuY2xpZW50WCAhPT0gdW5kZWZpbmVkICYmICg8TW91c2VFdmVudD4gZXZlbnQpLmNsaWVudFkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6ICg8TW91c2VFdmVudD4gZXZlbnQpLmNsaWVudFgsXHJcbiAgICAgICAgICAgIHk6ICg8TW91c2VFdmVudD4gZXZlbnQpLmNsaWVudFksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudFBpeGVsU2l6ZShlbFJlZjogRWxlbWVudFJlZiwgZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHJlY3QgPSAoPEhUTUxFbGVtZW50PiBlbFJlZi5uYXRpdmVFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICByZXR1cm4gKGRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSA/IHJlY3Qud2lkdGggOiByZWN0LmhlaWdodDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldElucHV0Qm9vbGVhbih2OiBhbnkpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAodHlwZW9mKHYpID09PSAnYm9vbGVhbicpID8gdiA6ICh2ID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldElucHV0UG9zaXRpdmVOdW1iZXI8VD4odjogYW55LCBkZWZhdWx0VmFsdWU6IFQpOiBudW1iZXIgfCBUIHtcclxuICAgIGlmKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG5cclxuICAgIHYgPSBOdW1iZXIodik7XHJcbiAgICByZXR1cm4gIWlzTmFOKHYpICYmIHYgPj0gMCA/IHYgOiBkZWZhdWx0VmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1VzZXJTaXplc1ZhbGlkKHVuaXQ6ICdwZXJjZW50JyB8ICdwaXhlbCcsIHNpemVzOiBBcnJheTxudW1iZXIgfCBudWxsPik6IGJvb2xlYW4ge1xyXG4gICAgLy8gQWxsIHNpemVzIGhhdmUgdG8gYmUgbm90IG51bGwgYW5kIHRvdGFsIHNob3VsZCBiZSAxMDBcclxuICAgIGlmKHVuaXQgPT09ICdwZXJjZW50Jykge1xyXG4gICAgICAgIGNvbnN0IHRvdGFsID0gc2l6ZXMucmVkdWNlKCh0b3RhbCwgcykgPT4gcyAhPT0gbnVsbCA/IHRvdGFsICsgcyA6IHRvdGFsLCAwKTtcclxuICAgICAgICByZXR1cm4gc2l6ZXMuZXZlcnkocyA9PiBzICE9PSBudWxsKSAmJiB0b3RhbCA+IDk5LjkgJiYgdG90YWwgPCAxMDAuMTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gQSBzaXplIGF0IG51bGwgaXMgbWFuZGF0b3J5IGJ1dCBvbmx5IG9uZS5cclxuICAgIGlmKHVuaXQgPT09ICdwaXhlbCcpIHtcclxuICAgICAgICByZXR1cm4gc2l6ZXMuZmlsdGVyKHMgPT4gcyA9PT0gbnVsbCkubGVuZ3RoID09PSAxO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXJlYU1pblNpemUoYTogSUFyZWEpOiBudWxsIHwgbnVtYmVyIHtcclxuICAgIGlmKGEuc2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZihhLmNvbXBvbmVudC5sb2NrU2l6ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBhLnNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYS5jb21wb25lbnQubWluU2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGEuY29tcG9uZW50Lm1pblNpemUgPiBhLnNpemUpIHtcclxuICAgICAgICByZXR1cm4gYS5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhLmNvbXBvbmVudC5taW5TaXplO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXJlYU1heFNpemUoYTogSUFyZWEpOiBudWxsIHwgbnVtYmVyIHtcclxuICAgIGlmKGEuc2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZihhLmNvbXBvbmVudC5sb2NrU2l6ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBhLnNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYS5jb21wb25lbnQubWF4U2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGEuY29tcG9uZW50Lm1heFNpemUgPCBhLnNpemUpIHtcclxuICAgICAgICByZXR1cm4gYS5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhLmNvbXBvbmVudC5tYXhTaXplO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eSh1bml0OiAncGVyY2VudCcgfCAncGl4ZWwnLCBzaWRlQXJlYXM6IEFycmF5PElBcmVhU25hcHNob3Q+LCBwaXhlbHM6IG51bWJlciwgYWxsQXJlYXNTaXplUGl4ZWw6IG51bWJlcik6IElTcGxpdFNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgcmV0dXJuIHNpZGVBcmVhcy5yZWR1Y2UoKGFjYywgYXJlYSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkodW5pdCwgYXJlYSwgYWNjLnJlbWFpbiwgYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgICAgIGFjYy5saXN0LnB1c2gocmVzKTtcclxuICAgICAgICBhY2MucmVtYWluICA9IHJlcy5waXhlbFJlbWFpbjtcclxuICAgICAgICByZXR1cm4gYWNjO1xyXG4gICAgfSwge3JlbWFpbjogcGl4ZWxzLCBsaXN0OiBbXX0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5KHVuaXQ6ICdwZXJjZW50JyB8ICdwaXhlbCcsIGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCwgcGl4ZWxzOiBudW1iZXIsIGFsbEFyZWFzU2l6ZVBpeGVsOiBudW1iZXIpOiBJQXJlYUFic29ycHRpb25DYXBhY2l0eSB7XHJcbiAgICAvLyBObyBwYWluIG5vIGdhaW5cclxuICAgIGlmKHBpeGVscyA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IDAsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IGFyZWFTbmFwc2hvdC5zaXplUGVyY2VudEF0U3RhcnQsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEFyZWEgc3RhcnQgYXQgemVybyBhbmQgbmVlZCB0byBiZSByZWR1Y2VkLCBub3QgcG9zc2libGVcclxuICAgIGlmKGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ID09PSAwICYmIHBpeGVscyA8IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiAwLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAwLFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogcGl4ZWxzLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKHVuaXQgPT09ICdwZXJjZW50Jykge1xyXG4gICAgICAgIHJldHVybiBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5UGVyY2VudChhcmVhU25hcHNob3QsIHBpeGVscywgYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgfVxyXG4gICAgXHJcblx0aWYodW5pdCA9PT0gJ3BpeGVsJykge1xyXG4gICAgICAgIHJldHVybiBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5UGl4ZWwoYXJlYVNuYXBzaG90LCBwaXhlbHMsIGFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBlcmNlbnQoYXJlYVNuYXBzaG90OiBJQXJlYVNuYXBzaG90LCBwaXhlbHM6IG51bWJlciwgYWxsQXJlYXNTaXplUGl4ZWw6IG51bWJlcik6IElBcmVhQWJzb3JwdGlvbkNhcGFjaXR5IHtcclxuICAgIGNvbnN0IHRlbXBQaXhlbFNpemUgPSBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCArIHBpeGVscztcclxuICAgIGNvbnN0IHRlbXBQZXJjZW50U2l6ZSA9IHRlbXBQaXhlbFNpemUgLyBhbGxBcmVhc1NpemVQaXhlbCAqIDEwMDtcclxuICAgIFxyXG4gICAgLy8gRU5MQVJHRSBBUkVBXHJcbiAgICBcclxuICAgIGlmKHBpeGVscyA+IDApIHtcclxuICAgICAgICAvLyBJZiBtYXhTaXplICYgbmV3U2l6ZSBiaWdnZXIgdGhhbiBpdCA+IGFic29yYiB0byBtYXggYW5kIHJldHVybiByZW1haW5pbmcgcGl4ZWxzIFxyXG4gICAgICAgIGlmKGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUgIT09IG51bGwgJiYgdGVtcFBlcmNlbnRTaXplID4gYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSkge1xyXG4gICAgICAgICAgICAvLyBVc2UgYXJlYS5hcmVhLm1heFNpemUgYXMgbmV3UGVyY2VudFNpemUgYW5kIHJldHVybiBjYWxjdWxhdGUgcGl4ZWxzIHJlbWFpbmluZ1xyXG4gICAgICAgICAgICBjb25zdCBtYXhTaXplUGl4ZWwgPSBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplIC8gMTAwICogYWxsQXJlYXNTaXplUGl4ZWw7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogbWF4U2l6ZVBpeGVsLFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCArIHBpeGVscyAtIG1heFNpemVQaXhlbFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBwaXhlbHMsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IHRlbXBQZXJjZW50U2l6ZSA+IDEwMCA/IDEwMCA6IHRlbXBQZXJjZW50U2l6ZSxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IDBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJFRFVDRSBBUkVBXHJcbiAgICBcclxuICAgIGVsc2UgaWYocGl4ZWxzIDwgMCkge1xyXG4gICAgICAgIC8vIElmIG1pblNpemUgJiBuZXdTaXplIHNtYWxsZXIgdGhhbiBpdCA+IGFic29yYiB0byBtaW4gYW5kIHJldHVybiByZW1haW5pbmcgcGl4ZWxzIFxyXG4gICAgICAgIGlmKGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUgIT09IG51bGwgJiYgdGVtcFBlcmNlbnRTaXplIDwgYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSkge1xyXG4gICAgICAgICAgICAvLyBVc2UgYXJlYS5hcmVhLm1pblNpemUgYXMgbmV3UGVyY2VudFNpemUgYW5kIHJldHVybiBjYWxjdWxhdGUgcGl4ZWxzIHJlbWFpbmluZ1xyXG4gICAgICAgICAgICBjb25zdCBtaW5TaXplUGl4ZWwgPSBhcmVhU25hcHNob3QuYXJlYS5taW5TaXplIC8gMTAwICogYWxsQXJlYXNTaXplUGl4ZWw7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogbWluU2l6ZVBpeGVsLFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCArIHBpeGVscyAtIG1pblNpemVQaXhlbFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiByZWR1Y2VkIHVuZGVyIHplcm8gPiByZXR1cm4gcmVtYWluaW5nIHBpeGVsc1xyXG4gICAgICAgIGVsc2UgaWYodGVtcFBlcmNlbnRTaXplIDwgMCkge1xyXG4gICAgICAgICAgICAvLyBVc2UgMCBhcyBuZXdQZXJjZW50U2l6ZSBhbmQgcmV0dXJuIGNhbGN1bGF0ZSBwaXhlbHMgcmVtYWluaW5nXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogLWFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogMCxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiBwaXhlbHMgKyBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBwaXhlbHMsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IHRlbXBQZXJjZW50U2l6ZSxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IDBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5UGl4ZWwoYXJlYVNuYXBzaG90OiBJQXJlYVNuYXBzaG90LCBwaXhlbHM6IG51bWJlciwgY29udGFpbmVyU2l6ZVBpeGVsOiBudW1iZXIpOiBJQXJlYUFic29ycHRpb25DYXBhY2l0eSB7XHJcbiAgICBjb25zdCB0ZW1wUGl4ZWxTaXplID0gYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHM7XHJcbiAgICAgICAgICAgIFxyXG4gICAgLy8gRU5MQVJHRSBBUkVBXHJcblxyXG4gICAgaWYocGl4ZWxzID4gMCkge1xyXG4gICAgICAgIC8vIElmIG1heFNpemUgJiBuZXdTaXplIGJpZ2dlciB0aGFuIGl0ID4gYWJzb3JiIHRvIG1heCBhbmQgcmV0dXJuIHJlbWFpbmluZyBwaXhlbHMgXHJcbiAgICAgICAgaWYoYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSAhPT0gbnVsbCAmJiB0ZW1wUGl4ZWxTaXplID4gYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUgLSBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IC0xLFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxSZW1haW46IHRlbXBQaXhlbFNpemUgLSBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IHBpeGVscyxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSRURVQ0UgQVJFQVxyXG4gICAgXHJcbiAgICBlbHNlIGlmKHBpeGVscyA8IDApIHtcclxuICAgICAgICAvLyBJZiBtaW5TaXplICYgbmV3U2l6ZSBzbWFsbGVyIHRoYW4gaXQgPiBhYnNvcmIgdG8gbWluIGFuZCByZXR1cm4gcmVtYWluaW5nIHBpeGVscyBcclxuICAgICAgICBpZihhcmVhU25hcHNob3QuYXJlYS5taW5TaXplICE9PSBudWxsICYmIHRlbXBQaXhlbFNpemUgPCBhcmVhU25hcHNob3QuYXJlYS5taW5TaXplKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSArIHBpeGVscyAtIHRlbXBQaXhlbFNpemUsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiB0ZW1wUGl4ZWxTaXplIC0gYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiByZWR1Y2VkIHVuZGVyIHplcm8gPiByZXR1cm4gcmVtYWluaW5nIHBpeGVsc1xyXG4gICAgICAgIGVsc2UgaWYodGVtcFBpeGVsU2l6ZSA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiAtYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiBwaXhlbHMgKyBhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBwaXhlbHMsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IC0xLFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVBcmVhU2l6ZSh1bml0OiAncGVyY2VudCcgfCAncGl4ZWwnLCBpdGVtOiBJQXJlYUFic29ycHRpb25DYXBhY2l0eSkge1xyXG4gICAgXHJcbiAgICBpZih1bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgICBpdGVtLmFyZWFTbmFwc2hvdC5hcmVhLnNpemUgPSBpdGVtLnBlcmNlbnRBZnRlckFic29ycHRpb247XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHVuaXQgPT09ICdwaXhlbCcpIHtcclxuICAgICAgICAvLyBVcGRhdGUgc2l6ZSBleGNlcHQgZm9yIHRoZSB3aWxkY2FyZCBzaXplIGFyZWFcclxuICAgICAgICBpZihpdGVtLmFyZWFTbmFwc2hvdC5hcmVhLnNpemUgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaXRlbS5hcmVhU25hcHNob3QuYXJlYS5zaXplID0gaXRlbS5hcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCArIGl0ZW0ucGl4ZWxBYnNvcmI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHtcclxuICAgIENvbXBvbmVudCxcclxuICAgIElucHV0LFxyXG4gICAgT3V0cHV0LFxyXG4gICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXHJcbiAgICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIFJlbmRlcmVyMixcclxuICAgIEFmdGVyVmlld0luaXQsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBFbGVtZW50UmVmLFxyXG4gICAgTmdab25lLFxyXG4gICAgVmlld0NoaWxkcmVuLFxyXG4gICAgUXVlcnlMaXN0LFxyXG4gICAgRXZlbnRFbWl0dGVyXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3Vic2NyaWJlciwgU3ViamVjdH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7ZGVib3VuY2VUaW1lfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5pbXBvcnQge0lBcmVhLCBJUG9pbnQsIElTcGxpdFNuYXBzaG90LCBJQXJlYVNuYXBzaG90LCBJT3V0cHV0RGF0YSwgSU91dHB1dEFyZWFTaXplc30gZnJvbSAnLi4vaW50ZXJmYWNlJztcclxuaW1wb3J0IHtTcGxpdEFyZWFEaXJlY3RpdmV9IGZyb20gJy4uL2RpcmVjdGl2ZS9zcGxpdEFyZWEuZGlyZWN0aXZlJztcclxuaW1wb3J0IHtcclxuICAgIGdldElucHV0UG9zaXRpdmVOdW1iZXIsXHJcbiAgICBnZXRJbnB1dEJvb2xlYW4sXHJcbiAgICBpc1VzZXJTaXplc1ZhbGlkLFxyXG4gICAgZ2V0QXJlYU1pblNpemUsXHJcbiAgICBnZXRBcmVhTWF4U2l6ZSxcclxuICAgIGdldFBvaW50RnJvbUV2ZW50LFxyXG4gICAgZ2V0RWxlbWVudFBpeGVsU2l6ZSxcclxuICAgIGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHksXHJcbiAgICB1cGRhdGVBcmVhU2l6ZVxyXG59IGZyb20gJy4uL3V0aWxzJztcclxuXHJcbi8qKlxyXG4gKiBhbmd1bGFyLXNwbGl0XHJcbiAqXHJcbiAqXHJcbiAqICBQRVJDRU5UIE1PREUgKFt1bml0XT1cIidwZXJjZW50J1wiKVxyXG4gKiAgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gKiB8ICAgICAgIEEgICAgICAgW2cxXSAgICAgICBCICAgICAgIFtnMl0gICAgICAgQyAgICAgICBbZzNdICAgICAgIEQgICAgICAgW2c0XSAgICAgICBFICAgICAgIHxcclxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XHJcbiAqIHwgICAgICAgMjAgICAgICAgICAgICAgICAgIDMwICAgICAgICAgICAgICAgICAyMCAgICAgICAgICAgICAgICAgMTUgICAgICAgICAgICAgICAgIDE1ICAgICAgfCA8LS0gW3NpemVdPVwieFwiXHJcbiAqIHwgICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgfCA8LS0gW2d1dHRlclNpemVdPVwiMTBcIlxyXG4gKiB8Y2FsYygyMCUgLSA4cHgpICAgIGNhbGMoMzAlIC0gMTJweCkgICBjYWxjKDIwJSAtIDhweCkgICAgY2FsYygxNSUgLSA2cHgpICAgIGNhbGMoMTUlIC0gNnB4KXwgPC0tIENTUyBmbGV4LWJhc2lzIHByb3BlcnR5ICh3aXRoIGZsZXgtZ3JvdyZzaHJpbmsgYXQgMClcclxuICogfCAgICAgMTUycHggICAgICAgICAgICAgIDIyOHB4ICAgICAgICAgICAgICAxNTJweCAgICAgICAgICAgICAgMTE0cHggICAgICAgICAgICAgIDExNHB4ICAgICB8IDwtLSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxyXG4gKiB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3xcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA4MDBweCAgICAgICAgIDwtLSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxyXG4gKiAgZmxleC1iYXNpcyA9IGNhbGMoIHsgYXJlYS5zaXplIH0lIC0geyBhcmVhLnNpemUvMTAwICogbmJHdXR0ZXIqZ3V0dGVyU2l6ZSB9cHggKTtcclxuICpcclxuICpcclxuICogIFBJWEVMIE1PREUgKFt1bml0XT1cIidwaXhlbCdcIilcclxuICogIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICogfCAgICAgICBBICAgICAgIFtnMV0gICAgICAgQiAgICAgICBbZzJdICAgICAgIEMgICAgICAgW2czXSAgICAgICBEICAgICAgIFtnNF0gICAgICAgRSAgICAgICB8XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxyXG4gKiB8ICAgICAgMTAwICAgICAgICAgICAgICAgIDI1MCAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgMTUwICAgICAgICAgICAgICAgIDEwMCAgICAgIHwgPC0tIFtzaXplXT1cInlcIlxyXG4gKiB8ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIHwgPC0tIFtndXR0ZXJTaXplXT1cIjEwXCJcclxuICogfCAgIDAgMCAxMDBweCAgICAgICAgICAwIDAgMjUwcHggICAgICAgICAgIDEgMSBhdXRvICAgICAgICAgIDAgMCAxNTBweCAgICAgICAgICAwIDAgMTAwcHggICB8IDwtLSBDU1MgZmxleCBwcm9wZXJ0eSAoZmxleC1ncm93L2ZsZXgtc2hyaW5rL2ZsZXgtYmFzaXMpXHJcbiAqIHwgICAgIDEwMHB4ICAgICAgICAgICAgICAyNTBweCAgICAgICAgICAgICAgMjAwcHggICAgICAgICAgICAgIDE1MHB4ICAgICAgICAgICAgICAxMDBweCAgICAgfCA8LS0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcclxuICogfF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgODAwcHggICAgICAgICA8LS0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcclxuICpcclxuICovXHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAnYXMtc3BsaXQnLFxyXG4gICAgZXhwb3J0QXM6ICdhc1NwbGl0JyxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgc3R5bGVVcmxzOiBbYC4vc3BsaXQuY29tcG9uZW50LnNjc3NgXSxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBbbmdGb3JPZl09XCJkaXNwbGF5ZWRBcmVhc1wiIGxldC1pbmRleD1cImluZGV4XCIgbGV0LWxhc3Q9XCJsYXN0XCI+XHJcbiAgICAgICAgICAgIDxkaXYgKm5nSWY9XCJsYXN0ID09PSBmYWxzZVwiXHJcbiAgICAgICAgICAgICAgICAgI2d1dHRlckVsc1xyXG4gICAgICAgICAgICAgICAgIGNsYXNzPVwiYXMtc3BsaXQtZ3V0dGVyXCJcclxuICAgICAgICAgICAgICAgICBbc3R5bGUuZmxleC1iYXNpcy5weF09XCJndXR0ZXJTaXplXCJcclxuICAgICAgICAgICAgICAgICBbc3R5bGUub3JkZXJdPVwiaW5kZXgqMisxXCJcclxuICAgICAgICAgICAgICAgICAobW91c2Vkb3duKT1cInN0YXJ0RHJhZ2dpbmcoJGV2ZW50LCBpbmRleCoyKzEsIGluZGV4KzEpXCJcclxuICAgICAgICAgICAgICAgICAodG91Y2hzdGFydCk9XCJzdGFydERyYWdnaW5nKCRldmVudCwgaW5kZXgqMisxLCBpbmRleCsxKVwiXHJcbiAgICAgICAgICAgICAgICAgKG1vdXNldXApPVwiY2xpY2tHdXR0ZXIoJGV2ZW50LCBpbmRleCsxKVwiXHJcbiAgICAgICAgICAgICAgICAgKHRvdWNoZW5kKT1cImNsaWNrR3V0dGVyKCRldmVudCwgaW5kZXgrMSlcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhcy1zcGxpdC1ndXR0ZXItaWNvblwiPjwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L25nLXRlbXBsYXRlPmAsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTcGxpdENvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfZGlyZWN0aW9uOiAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnID0gJ2hvcml6b250YWwnO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBkaXJlY3Rpb24odjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJykge1xyXG4gICAgICAgIHRoaXMuX2RpcmVjdGlvbiA9ICh2ID09PSAndmVydGljYWwnKSA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCc7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBgYXMtJHt0aGlzLl9kaXJlY3Rpb259YCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsIGBhcy0keyh0aGlzLl9kaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCcpID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ31gKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZChmYWxzZSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBkaXJlY3Rpb24oKTogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNIb3Jpem9udGFsRGlyZWN0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSBfdW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJyA9ICdwZXJjZW50JztcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgdW5pdCh2OiAncGVyY2VudCcgfCAncGl4ZWwnKSB7XHJcbiAgICAgICAgdGhpcy5fdW5pdCA9ICh2ID09PSAncGl4ZWwnKSA/ICdwaXhlbCcgOiAncGVyY2VudCc7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBgYXMtJHt0aGlzLl91bml0fWApO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBgYXMtJHsodGhpcy5fdW5pdCA9PT0gJ3BpeGVsJykgPyAncGVyY2VudCcgOiAncGl4ZWwnfWApO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkKGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdW5pdCgpOiAncGVyY2VudCcgfCAncGl4ZWwnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdW5pdDtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSBfZ3V0dGVyU2l6ZTogbnVtYmVyID0gMTE7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IGd1dHRlclNpemUodjogbnVtYmVyIHwgbnVsbCkge1xyXG4gICAgICAgIHRoaXMuX2d1dHRlclNpemUgPSBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyKHYsIDExKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZChmYWxzZSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBndXR0ZXJTaXplKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2d1dHRlclNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX2d1dHRlclN0ZXA6IG51bWJlciA9IDE7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IGd1dHRlclN0ZXAodjogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fZ3V0dGVyU3RlcCA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGd1dHRlclN0ZXAoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZ3V0dGVyU3RlcDtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSBfcmVzdHJpY3RNb3ZlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IHJlc3RyaWN0TW92ZSh2OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fcmVzdHJpY3RNb3ZlID0gZ2V0SW5wdXRCb29sZWFuKHYpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByZXN0cmljdE1vdmUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3RyaWN0TW92ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSBfdXNlVHJhbnNpdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCB1c2VUcmFuc2l0aW9uKHY6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl91c2VUcmFuc2l0aW9uID0gZ2V0SW5wdXRCb29sZWFuKHYpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fdXNlVHJhbnNpdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLXRyYW5zaXRpb24nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLXRyYW5zaXRpb24nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHVzZVRyYW5zaXRpb24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VzZVRyYW5zaXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IGRpc2FibGVkKHY6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9kaXNhYmxlZCA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtZGlzYWJsZWQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWRpc2FibGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX2RpcjogJ2x0cicgfCAncnRsJyA9ICdsdHInO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBkaXIodjogJ2x0cicgfCAncnRsJykge1xyXG4gICAgICAgIHRoaXMuX2RpciA9ICh2ID09PSAncnRsJykgPyAncnRsJyA6ICdsdHInO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZSh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdkaXInLCB0aGlzLl9kaXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBkaXIoKTogJ2x0cicgfCAncnRsJyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcjtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSBfZ3V0dGVyRGJsQ2xpY2tEdXJhdGlvbjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgZ3V0dGVyRGJsQ2xpY2tEdXJhdGlvbih2OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9ndXR0ZXJEYmxDbGlja0R1cmF0aW9uID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZ3V0dGVyRGJsQ2xpY2tEdXJhdGlvbigpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ndXR0ZXJEYmxDbGlja0R1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBAT3V0cHV0KCkgZHJhZ1N0YXJ0ID0gbmV3IEV2ZW50RW1pdHRlcjxJT3V0cHV0RGF0YT4oZmFsc2UpO1xyXG4gICAgQE91dHB1dCgpIGRyYWdFbmQgPSBuZXcgRXZlbnRFbWl0dGVyPElPdXRwdXREYXRhPihmYWxzZSk7XHJcbiAgICBAT3V0cHV0KCkgZ3V0dGVyQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPElPdXRwdXREYXRhPihmYWxzZSk7XHJcbiAgICBAT3V0cHV0KCkgZ3V0dGVyRGJsQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPElPdXRwdXREYXRhPihmYWxzZSk7XHJcblxyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uRW5kU3Vic2NyaWJlcjogU3Vic2NyaWJlcjxJT3V0cHV0QXJlYVNpemVzPjtcclxuXHJcbiAgICBAT3V0cHV0KCkgZ2V0IHRyYW5zaXRpb25FbmQoKTogT2JzZXJ2YWJsZTxJT3V0cHV0QXJlYVNpemVzPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YnNjcmliZXIgPT4gdGhpcy50cmFuc2l0aW9uRW5kU3Vic2NyaWJlciA9IHN1YnNjcmliZXIpLnBpcGUoXHJcbiAgICAgICAgICAgIGRlYm91bmNlVGltZTxJT3V0cHV0QXJlYVNpemVzPigyMClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhZ1Byb2dyZXNzU3ViamVjdDogU3ViamVjdDxJT3V0cHV0RGF0YT4gPSBuZXcgU3ViamVjdCgpO1xyXG4gICAgZHJhZ1Byb2dyZXNzJDogT2JzZXJ2YWJsZTxJT3V0cHV0RGF0YT4gPSB0aGlzLmRyYWdQcm9ncmVzc1N1YmplY3QuYXNPYnNlcnZhYmxlKCk7XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgaXNEcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBkcmFnTGlzdGVuZXJzOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcclxuICAgIHByaXZhdGUgc25hcHNob3Q6IElTcGxpdFNuYXBzaG90IHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIHN0YXJ0UG9pbnQ6IElQb2ludCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBlbmRQb2ludDogSVBvaW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIHJlYWRvbmx5IGRpc3BsYXllZEFyZWFzOiBBcnJheTxJQXJlYT4gPSBbXTtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgaGlkZWRBcmVhczogQXJyYXk8SUFyZWE+ID0gW107XHJcblxyXG4gICAgQFZpZXdDaGlsZHJlbignZ3V0dGVyRWxzJykgcHJpdmF0ZSBndXR0ZXJFbHM6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nWm9uZTogTmdab25lLFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBlbFJlZjogRWxlbWVudFJlZixcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgY2RSZWY6IENoYW5nZURldGVjdG9yUmVmLFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyKSB7XHJcbiAgICAgICAgLy8gVG8gZm9yY2UgYWRkaW5nIGRlZmF1bHQgY2xhc3MsIGNvdWxkIGJlIG92ZXJyaWRlIGJ5IHVzZXIgQElucHV0KCkgb3Igbm90XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSB0aGlzLl9kaXJlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFRvIGF2b2lkIHRyYW5zaXRpb24gYXQgZmlyc3QgcmVuZGVyaW5nXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1pbml0JykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TmJHdXR0ZXJzKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aCA9PT0gMCkgPyAwIDogdGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgbmV3QXJlYTogSUFyZWEgPSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudCxcclxuICAgICAgICAgICAgb3JkZXI6IDAsXHJcbiAgICAgICAgICAgIHNpemU6IDAsXHJcbiAgICAgICAgICAgIG1pblNpemU6IG51bGwsXHJcbiAgICAgICAgICAgIG1heFNpemU6IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBvbmVudC52aXNpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMucHVzaChuZXdBcmVhKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGQodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlZEFyZWFzLnB1c2gobmV3QXJlYSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW1vdmVBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzcGxheWVkQXJlYXMuc29tZShhID0+IGEuY29tcG9uZW50ID09PSBjb21wb25lbnQpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZWEgPSB0aGlzLmRpc3BsYXllZEFyZWFzLmZpbmQoYSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5zcGxpY2UodGhpcy5kaXNwbGF5ZWRBcmVhcy5pbmRleE9mKGFyZWEpLCAxKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGQodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhpZGVkQXJlYXMuc29tZShhID0+IGEuY29tcG9uZW50ID09PSBjb21wb25lbnQpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZWEgPSB0aGlzLmhpZGVkQXJlYXMuZmluZChhID0+IGEuY29tcG9uZW50ID09PSBjb21wb25lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVkQXJlYXMuc3BsaWNlKHRoaXMuaGlkZWRBcmVhcy5pbmRleE9mKGFyZWEpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVwZGF0ZUFyZWEoY29tcG9uZW50OiBTcGxpdEFyZWFEaXJlY3RpdmUsIHJlc2V0T3JkZXJzOiBib29sZWFuLCByZXNldFNpemVzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGNvbXBvbmVudC52aXNpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGQocmVzZXRPcmRlcnMsIHJlc2V0U2l6ZXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvd0FyZWEoY29tcG9uZW50OiBTcGxpdEFyZWFEaXJlY3RpdmUpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBhcmVhID0gdGhpcy5oaWRlZEFyZWFzLmZpbmQoYSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KTtcclxuICAgICAgICBpZiAoYXJlYSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFyZWFzID0gdGhpcy5oaWRlZEFyZWFzLnNwbGljZSh0aGlzLmhpZGVkQXJlYXMuaW5kZXhPZihhcmVhKSwgMSk7XHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5wdXNoKC4uLmFyZWFzKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZCh0cnVlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZUFyZWEoY29tcDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXJlYSA9IHRoaXMuZGlzcGxheWVkQXJlYXMuZmluZChhID0+IGEuY29tcG9uZW50ID09PSBjb21wKTtcclxuICAgICAgICBpZiAoYXJlYSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFyZWFzID0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5zcGxpY2UodGhpcy5kaXNwbGF5ZWRBcmVhcy5pbmRleE9mKGFyZWEpLCAxKTtcclxuICAgICAgICBhcmVhcy5mb3JFYWNoKGFyZWEgPT4ge1xyXG4gICAgICAgICAgICBhcmVhLm9yZGVyID0gMDtcclxuICAgICAgICAgICAgYXJlYS5zaXplID0gMDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmhpZGVkQXJlYXMucHVzaCguLi5hcmVhcyk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQodHJ1ZSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFZpc2libGVBcmVhU2l6ZXMoKTogSU91dHB1dEFyZWFTaXplcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkQXJlYXMubWFwKGEgPT4gYS5zaXplID09PSBudWxsID8gJyonIDogYS5zaXplKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0VmlzaWJsZUFyZWFTaXplcyhzaXplczogSU91dHB1dEFyZWFTaXplcyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChzaXplcy5sZW5ndGggIT09IHRoaXMuZGlzcGxheWVkQXJlYXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGZvcm1hdGVkU2l6ZXMgPSBzaXplcy5tYXAocyA9PiBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyKHMsIG51bGwpKTtcclxuICAgICAgICBjb25zdCBpc1ZhbGlkID0gaXNVc2VyU2l6ZXNWYWxpZCh0aGlzLnVuaXQsIGZvcm1hdGVkU2l6ZXMpO1xyXG5cclxuICAgICAgICBpZiAoaXNWYWxpZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSwgaSkgPT4gYXJlYS5jb21wb25lbnQuX3NpemUgPSBmb3JtYXRlZFNpemVzW2ldKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZChmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBidWlsZChyZXNldE9yZGVyczogYm9vbGVhbiwgcmVzZXRTaXplczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcblxyXG4gICAgICAgIC8vIMOCwqQgQVJFQVMgT1JERVJcclxuXHJcbiAgICAgICAgaWYgKHJlc2V0T3JkZXJzID09PSB0cnVlKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB1c2VyIHByb3ZpZGVkICdvcmRlcicgZm9yIGVhY2ggYXJlYSwgdXNlIGl0IHRvIHNvcnQgdGhlbS5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGxheWVkQXJlYXMuZXZlcnkoYSA9PiBhLmNvbXBvbmVudC5vcmRlciAhPT0gbnVsbCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuc29ydCgoYSwgYikgPT4gKDxudW1iZXI+YS5jb21wb25lbnQub3JkZXIpIC0gKDxudW1iZXI+Yi5jb21wb25lbnQub3JkZXIpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVGhlbiBzZXQgcmVhbCBvcmRlciB3aXRoIG11bHRpcGxlcyBvZiAyLCBudW1iZXJzIGJldHdlZW4gd2lsbCBiZSB1c2VkIGJ5IGd1dHRlcnMuXHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYS5vcmRlciA9IGkgKiAyO1xyXG4gICAgICAgICAgICAgICAgYXJlYS5jb21wb25lbnQuc2V0U3R5bGVPcmRlcihhcmVhLm9yZGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDDgsKkIEFSRUFTIFNJWkVcclxuXHJcbiAgICAgICAgaWYgKHJlc2V0U2l6ZXMgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgY29uc3QgdXNlVXNlclNpemVzID0gaXNVc2VyU2l6ZXNWYWxpZCh0aGlzLnVuaXQsIHRoaXMuZGlzcGxheWVkQXJlYXMubWFwKGEgPT4gYS5jb21wb25lbnQuc2l6ZSkpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuaXQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BlcmNlbnQnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdFNpemUgPSAxMDAgLyB0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKGFyZWEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSB1c2VVc2VyU2l6ZXMgPyA8bnVtYmVyPmFyZWEuY29tcG9uZW50LnNpemUgOiBkZWZhdWx0U2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gZ2V0QXJlYU1pblNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWF4U2l6ZSA9IGdldEFyZWFNYXhTaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSAncGl4ZWwnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZVVzZXJTaXplcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goYXJlYSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSBhcmVhLmNvbXBvbmVudC5zaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gZ2V0QXJlYU1pblNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBnZXRBcmVhTWF4U2l6ZShhcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2lsZGNhcmRTaXplQXJlYXMgPSB0aGlzLmRpc3BsYXllZEFyZWFzLmZpbHRlcihhID0+IGEuY29tcG9uZW50LnNpemUgPT09IG51bGwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gd2lsZGNhcmQgYXJlYSA+IE5lZWQgdG8gc2VsZWN0IG9uZSBhcmJpdHJhcmlseSA+IGZpcnN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aWxkY2FyZFNpemVBcmVhcy5sZW5ndGggPT09IDAgJiYgdGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKChhcmVhLCBpKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5zaXplID0gKGkgPT09IDApID8gbnVsbCA6IGFyZWEuY29tcG9uZW50LnNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gKGkgPT09IDApID8gbnVsbCA6IGdldEFyZWFNaW5TaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWF4U2l6ZSA9IChpID09PSAwKSA/IG51bGwgOiBnZXRBcmVhTWF4U2l6ZShhcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vcmUgdGhhbiBvbmUgd2lsZGNhcmQgYXJlYSA+IE5lZWQgdG8ga2VlcCBvbmx5IG9uZSBhcmJpdHJhcmx5ID4gZmlyc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAod2lsZGNhcmRTaXplQXJlYXMubGVuZ3RoID4gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbHJlYWR5R290T25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goYXJlYSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFyZWEuY29tcG9uZW50LnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFscmVhZHlHb3RPbmUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWF4U2l6ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHJlYWR5R290T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEuc2l6ZSA9IDEwMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5zaXplID0gYXJlYS5jb21wb25lbnQuc2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gZ2V0QXJlYU1pblNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWF4U2l6ZSA9IGdldEFyZWFNYXhTaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlZnJlc2hTdHlsZVNpemVzKCk7XHJcbiAgICAgICAgdGhpcy5jZFJlZi5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTdHlsZVNpemVzKCk6IHZvaWQge1xyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBQRVJDRU5UIE1PREVcclxuICAgICAgICBpZiAodGhpcy51bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgICAgICAgLy8gT25seSBvbmUgYXJlYSA+IGZsZXgtYmFzaXMgMTAwJVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXNbMF0uY29tcG9uZW50LnNldFN0eWxlRmxleCgwLCAwLCBgMTAwJWAsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gTXVsdGlwbGUgYXJlYXMgPiB1c2UgZWFjaCBwZXJjZW50IGJhc2lzXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3VtR3V0dGVyU2l6ZSA9IHRoaXMuZ2V0TmJHdXR0ZXJzKCkgKiB0aGlzLmd1dHRlclNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKGFyZWEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZWEuY29tcG9uZW50LnNldFN0eWxlRmxleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgYGNhbGMoICR7YXJlYS5zaXplfSUgLSAkezxudW1iZXI+YXJlYS5zaXplIC8gMTAwICogc3VtR3V0dGVyU2l6ZX1weCApYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGFyZWEubWluU2l6ZSAhPT0gbnVsbCAmJiBhcmVhLm1pblNpemUgPT09IGFyZWEuc2l6ZSkgPyB0cnVlIDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChhcmVhLm1heFNpemUgIT09IG51bGwgJiYgYXJlYS5tYXhTaXplID09PSBhcmVhLnNpemUpID8gdHJ1ZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gUElYRUwgTU9ERVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudW5pdCA9PT0gJ3BpeGVsJykge1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goYXJlYSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBBcmVhIHdpdGggd2lsZGNhcmQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgaWYgKGFyZWEuc2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoMSwgMSwgYDEwMCVgLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEuY29tcG9uZW50LnNldFN0eWxlRmxleCgxLCAxLCBgYXV0b2AsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQXJlYSB3aXRoIHBpeGVsIHNpemVcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgb25lIGFyZWEgPiBmbGV4LWJhc2lzIDEwMCVcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5jb21wb25lbnQuc2V0U3R5bGVGbGV4KDAsIDAsIGAxMDAlYCwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTXVsdGlwbGUgYXJlYXMgPiB1c2UgZWFjaCBwaXhlbCBiYXNpc1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCBgJHthcmVhLnNpemV9cHhgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGFyZWEubWluU2l6ZSAhPT0gbnVsbCAmJiBhcmVhLm1pblNpemUgPT09IGFyZWEuc2l6ZSkgPyB0cnVlIDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYXJlYS5tYXhTaXplICE9PSBudWxsICYmIGFyZWEubWF4U2l6ZSA9PT0gYXJlYS5zaXplKSA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfY2xpY2tUaW1lb3V0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBwdWJsaWMgY2xpY2tHdXR0ZXIoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50LCBndXR0ZXJOdW06IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRlbXBQb2ludCA9IGdldFBvaW50RnJvbUV2ZW50KGV2ZW50KTtcclxuXHJcbiAgICAgICAgLy8gQmUgc3VyZSBtb3VzZXVwL3RvdWNoZW5kIGhhcHBlbmVkIGF0IHNhbWUgcG9pbnQgYXMgbW91c2Vkb3duL3RvdWNoc3RhcnQgdG8gdHJpZ2dlciBjbGljay9kYmxjbGlja1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXJ0UG9pbnQgJiYgdGhpcy5zdGFydFBvaW50LnggPT09IHRlbXBQb2ludC54ICYmIHRoaXMuc3RhcnRQb2ludC55ID09PSB0ZW1wUG9pbnQueSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGltZW91dCBpbiBwcm9ncmVzcyBhbmQgbmV3IGNsaWNrID4gY2xlYXJUaW1lb3V0ICYgZGJsQ2xpY2tFdmVudFxyXG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpY2tUaW1lb3V0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX2NsaWNrVGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlja1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2RibGNsaWNrJywgZ3V0dGVyTnVtKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gRWxzZSBzdGFydCB0aW1lb3V0IHRvIGNhbGwgY2xpY2tFdmVudCBhdCBlbmRcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlja1RpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2xpY2tUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgnY2xpY2snLCBndXR0ZXJOdW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgICAgICAgICAgICB9LCB0aGlzLmd1dHRlckRibENsaWNrRHVyYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGFydERyYWdnaW5nKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCwgZ3V0dGVyT3JkZXI6IG51bWJlciwgZ3V0dGVyTnVtOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0UG9pbnQgPSBnZXRQb2ludEZyb21FdmVudChldmVudCk7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhcnRQb2ludCA9PT0gbnVsbCB8fCB0aGlzLmRpc2FibGVkID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc25hcHNob3QgPSB7XHJcbiAgICAgICAgICAgIGd1dHRlck51bSxcclxuICAgICAgICAgICAgbGFzdFN0ZXBwZWRPZmZzZXQ6IDAsXHJcbiAgICAgICAgICAgIGFsbEFyZWFzU2l6ZVBpeGVsOiBnZXRFbGVtZW50UGl4ZWxTaXplKHRoaXMuZWxSZWYsIHRoaXMuZGlyZWN0aW9uKSAtIHRoaXMuZ2V0TmJHdXR0ZXJzKCkgKiB0aGlzLmd1dHRlclNpemUsXHJcbiAgICAgICAgICAgIGFsbEludm9sdmVkQXJlYXNTaXplUGVyY2VudDogMTAwLFxyXG4gICAgICAgICAgICBhcmVhc0JlZm9yZUd1dHRlcjogW10sXHJcbiAgICAgICAgICAgIGFyZWFzQWZ0ZXJHdXR0ZXI6IFtdLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaChhcmVhID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXJlYVNuYXBzaG90OiBJQXJlYVNuYXBzaG90ID0ge1xyXG4gICAgICAgICAgICAgICAgYXJlYSxcclxuICAgICAgICAgICAgICAgIHNpemVQaXhlbEF0U3RhcnQ6IGdldEVsZW1lbnRQaXhlbFNpemUoYXJlYS5jb21wb25lbnQuZWxSZWYsIHRoaXMuZGlyZWN0aW9uKSxcclxuICAgICAgICAgICAgICAgIHNpemVQZXJjZW50QXRTdGFydDogKHRoaXMudW5pdCA9PT0gJ3BlcmNlbnQnKSA/IGFyZWEuc2l6ZSA6IC0xIC8vIElmIHBpeGVsIG1vZGUsIGFueXdheSwgd2lsbCBub3QgYmUgdXNlZC5cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhcmVhLm9yZGVyIDwgZ3V0dGVyT3JkZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlc3RyaWN0TW92ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIgPSBbYXJlYVNuYXBzaG90XTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlci51bnNoaWZ0KGFyZWFTbmFwc2hvdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJlYS5vcmRlciA+IGd1dHRlck9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXN0cmljdE1vdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zbmFwc2hvdC5hcmVhc0FmdGVyR3V0dGVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIgPSBbYXJlYVNuYXBzaG90XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlci5wdXNoKGFyZWFTbmFwc2hvdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zbmFwc2hvdC5hbGxJbnZvbHZlZEFyZWFzU2l6ZVBlcmNlbnQgPSBbLi4udGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlciwgLi4udGhpcy5zbmFwc2hvdC5hcmVhc0FmdGVyR3V0dGVyXS5yZWR1Y2UoKHQsIGEpID0+IHQgKyBhLnNpemVQZXJjZW50QXRTdGFydCwgMCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNuYXBzaG90LmFyZWFzQmVmb3JlR3V0dGVyLmxlbmd0aCA9PT0gMCB8fCB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ21vdXNldXAnLCB0aGlzLnN0b3BEcmFnZ2luZy5iaW5kKHRoaXMpKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0xpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyZXIubGlzdGVuKCdkb2N1bWVudCcsICd0b3VjaGVuZCcsIHRoaXMuc3RvcERyYWdnaW5nLmJpbmQodGhpcykpKTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ3RvdWNoY2FuY2VsJywgdGhpcy5zdG9wRHJhZ2dpbmcuYmluZCh0aGlzKSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ21vdXNlbW92ZScsIHRoaXMuZHJhZ0V2ZW50LmJpbmQodGhpcykpKTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ3RvdWNobW92ZScsIHRoaXMuZHJhZ0V2ZW50LmJpbmQodGhpcykpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKGFyZWEgPT4gYXJlYS5jb21wb25lbnQubG9ja0V2ZW50cygpKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmd1dHRlckVscy50b0FycmF5KClbdGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0gLSAxXS5uYXRpdmVFbGVtZW50LCAnYXMtZHJhZ2dlZCcpO1xyXG5cclxuICAgICAgICB0aGlzLm5vdGlmeSgnc3RhcnQnLCB0aGlzLnNuYXBzaG90Lmd1dHRlck51bSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkcmFnRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NsaWNrVGltZW91dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX2NsaWNrVGltZW91dCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NsaWNrVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0RyYWdnaW5nID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVuZFBvaW50ID0gZ2V0UG9pbnRGcm9tRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIGlmICh0aGlzLmVuZFBvaW50ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBzdGVwcGVkT2Zmc2V0XHJcblxyXG4gICAgICAgIGxldCBvZmZzZXQgPSAodGhpcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykgPyAodGhpcy5zdGFydFBvaW50LnggLSB0aGlzLmVuZFBvaW50LngpIDogKHRoaXMuc3RhcnRQb2ludC55IC0gdGhpcy5lbmRQb2ludC55KTtcclxuICAgICAgICBpZiAodGhpcy5kaXIgPT09ICdydGwnKSB7XHJcbiAgICAgICAgICAgIG9mZnNldCA9IC1vZmZzZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHN0ZXBwZWRPZmZzZXQgPSBNYXRoLnJvdW5kKG9mZnNldCAvIHRoaXMuZ3V0dGVyU3RlcCkgKiB0aGlzLmd1dHRlclN0ZXA7XHJcblxyXG4gICAgICAgIGlmIChzdGVwcGVkT2Zmc2V0ID09PSB0aGlzLnNuYXBzaG90Lmxhc3RTdGVwcGVkT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc25hcHNob3QubGFzdFN0ZXBwZWRPZmZzZXQgPSBzdGVwcGVkT2Zmc2V0O1xyXG5cclxuICAgICAgICAvLyBOZWVkIHRvIGtub3cgaWYgZWFjaCBndXR0ZXIgc2lkZSBhcmVhcyBjb3VsZCByZWFjdHMgdG8gc3RlcHBlZE9mZnNldFxyXG5cclxuICAgICAgICBsZXQgYXJlYXNCZWZvcmUgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KHRoaXMudW5pdCwgdGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlciwgLXN0ZXBwZWRPZmZzZXQsIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgICAgIGxldCBhcmVhc0FmdGVyID0gZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eSh0aGlzLnVuaXQsIHRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlciwgc3RlcHBlZE9mZnNldCwgdGhpcy5zbmFwc2hvdC5hbGxBcmVhc1NpemVQaXhlbCk7XHJcblxyXG4gICAgICAgIC8vIEVhY2ggZ3V0dGVyIHNpZGUgYXJlYXMgY2FuJ3QgYWJzb3JiIGFsbCBvZmZzZXQgXHJcbiAgICAgICAgaWYgKGFyZWFzQmVmb3JlLnJlbWFpbiAhPT0gMCAmJiBhcmVhc0FmdGVyLnJlbWFpbiAhPT0gMCkge1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoYXJlYXNCZWZvcmUucmVtYWluKSA9PT0gTWF0aC5hYnMoYXJlYXNBZnRlci5yZW1haW4pKSB7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoYXJlYXNCZWZvcmUucmVtYWluKSA+IE1hdGguYWJzKGFyZWFzQWZ0ZXIucmVtYWluKSkge1xyXG4gICAgICAgICAgICAgICAgYXJlYXNBZnRlciA9IGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkodGhpcy51bml0LCB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIsIHN0ZXBwZWRPZmZzZXQgKyBhcmVhc0JlZm9yZS5yZW1haW4sIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXJlYXNCZWZvcmUgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KHRoaXMudW5pdCwgdGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlciwgLShzdGVwcGVkT2Zmc2V0IC0gYXJlYXNBZnRlci5yZW1haW4pLCB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBcmVhcyBiZWZvcmUgZ3V0dGVyIGNhbid0IGFic29yYnMgYWxsIG9mZnNldCA+IG5lZWQgdG8gcmVjYWxjdWxhdGUgc2l6ZXMgZm9yIGFyZWFzIGFmdGVyIGd1dHRlci5cclxuICAgICAgICBlbHNlIGlmIChhcmVhc0JlZm9yZS5yZW1haW4gIT09IDApIHtcclxuICAgICAgICAgICAgYXJlYXNBZnRlciA9IGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkodGhpcy51bml0LCB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIsIHN0ZXBwZWRPZmZzZXQgKyBhcmVhc0JlZm9yZS5yZW1haW4sIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBcmVhcyBhZnRlciBndXR0ZXIgY2FuJ3QgYWJzb3JicyBhbGwgb2Zmc2V0ID4gbmVlZCB0byByZWNhbGN1bGF0ZSBzaXplcyBmb3IgYXJlYXMgYmVmb3JlIGd1dHRlci5cclxuICAgICAgICBlbHNlIGlmIChhcmVhc0FmdGVyLnJlbWFpbiAhPT0gMCkge1xyXG4gICAgICAgICAgICBhcmVhc0JlZm9yZSA9IGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkodGhpcy51bml0LCB0aGlzLnNuYXBzaG90LmFyZWFzQmVmb3JlR3V0dGVyLCAtKHN0ZXBwZWRPZmZzZXQgLSBhcmVhc0FmdGVyLnJlbWFpbiksIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudW5pdCA9PT0gJ3BlcmNlbnQnKSB7XHJcbiAgICAgICAgICAgIC8vIEhhY2sgYmVjYXVzZSBvZiBicm93c2VyIG1lc3NpbmcgdXAgd2l0aCBzaXplcyB1c2luZyBjYWxjKFglIC0gWXB4KSAtPiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICAgICAgICAvLyBJZiBub3QgdGhlcmUsIHBsYXlpbmcgd2l0aCBndXR0ZXJzIG1ha2VzIHRvdGFsIGdvaW5nIGRvd24gdG8gOTkuOTk4NzUlIHRoZW4gOTkuOTkyODYlLCA5OS45ODk4NiUsLi5cclxuICAgICAgICAgICAgY29uc3QgYWxsID0gWy4uLmFyZWFzQmVmb3JlLmxpc3QsIC4uLmFyZWFzQWZ0ZXIubGlzdF07XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZWFUb1Jlc2V0ID0gYWxsLmZpbmQoYSA9PiBhLnBlcmNlbnRBZnRlckFic29ycHRpb24gIT09IDAgJiYgYS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uICE9PSBhLmFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUgJiYgYS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uICE9PSBhLmFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFyZWFUb1Jlc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBhcmVhVG9SZXNldC5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uID0gdGhpcy5zbmFwc2hvdC5hbGxJbnZvbHZlZEFyZWFzU2l6ZVBlcmNlbnQgLSBhbGwuZmlsdGVyKGEgPT4gYSAhPT0gYXJlYVRvUmVzZXQpLnJlZHVjZSgodG90YWwsIGEpID0+IHRvdGFsICsgYS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm93IHdlIGtub3cgYXJlYXMgY291bGQgYWJzb3JiIHN0ZXBwZWRPZmZzZXQsIHRpbWUgdG8gcmVhbGx5IHVwZGF0ZSBzaXplc1xyXG5cclxuICAgICAgICBhcmVhc0JlZm9yZS5saXN0LmZvckVhY2goaXRlbSA9PiB1cGRhdGVBcmVhU2l6ZSh0aGlzLnVuaXQsIGl0ZW0pKTtcclxuICAgICAgICBhcmVhc0FmdGVyLmxpc3QuZm9yRWFjaChpdGVtID0+IHVwZGF0ZUFyZWFTaXplKHRoaXMudW5pdCwgaXRlbSkpO1xyXG5cclxuICAgICAgICBjb25zdCBhcmVhc1Jlc2l6ZWQgPSBhcmVhc0JlZm9yZS5yZW1haW4gPT09IDAgJiYgYXJlYXNBZnRlci5yZW1haW4gPT09IDA7XHJcblxyXG4gICAgICAgIGlmIChhcmVhc1Jlc2l6ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbW92ZUd1dHRlcih0aGlzLnNuYXBzaG90Lmd1dHRlck51bSAtIDEsIHN0ZXBwZWRPZmZzZXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdGhpcy5yZWZyZXNoU3R5bGVTaXplcygpO1xyXG4gICAgICAgIHRoaXMubm90aWZ5KCdwcm9ncmVzcycsIHRoaXMuc25hcHNob3QuZ3V0dGVyTnVtKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0b3BEcmFnZ2luZyhldmVudD86IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNEcmFnZ2luZyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZWZyZXNoU3R5bGVTaXplcygpO1xyXG4gICAgICAgIHRoaXMuX3Jlc2V0R3V0dGVyT2Zmc2V0KHRoaXMuc25hcHNob3QuZ3V0dGVyTnVtIC0gMSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaChhcmVhID0+IGFyZWEuY29tcG9uZW50LnVubG9ja0V2ZW50cygpKTtcclxuXHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZHJhZ0xpc3RlbmVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZjdCA9IHRoaXMuZHJhZ0xpc3RlbmVycy5wb3AoKTtcclxuICAgICAgICAgICAgaWYgKGZjdCkge1xyXG4gICAgICAgICAgICAgICAgZmN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFdhcm5pbmc6IEhhdmUgdG8gYmUgYmVmb3JlIFwibm90aWZ5KCdlbmQnKVwiXHJcbiAgICAgICAgLy8gYmVjYXVzZSBcIm5vdGlmeSgnZW5kJylcIlwiIGNhbiBiZSBsaW5rZWQgdG8gXCJbc2l6ZV09J3gnXCIgPiBcImJ1aWxkKClcIiA+IFwic3RvcERyYWdnaW5nKClcIlxyXG4gICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBJZiBtb3ZlZCBmcm9tIHN0YXJ0aW5nIHBvaW50LCBub3RpZnkgZW5kXHJcbiAgICAgICAgaWYgKHRoaXMuZW5kUG9pbnQgJiYgKHRoaXMuc3RhcnRQb2ludC54ICE9PSB0aGlzLmVuZFBvaW50LnggfHwgdGhpcy5zdGFydFBvaW50LnkgIT09IHRoaXMuZW5kUG9pbnQueSkpIHtcclxuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2VuZCcsIHRoaXMuc25hcHNob3QuZ3V0dGVyTnVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtZHJhZ2dpbmcnKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZ3V0dGVyRWxzLnRvQXJyYXkoKVt0aGlzLnNuYXBzaG90Lmd1dHRlck51bSAtIDFdLm5hdGl2ZUVsZW1lbnQsICdhcy1kcmFnZ2VkJyk7XHJcbiAgICAgICAgdGhpcy5zbmFwc2hvdCA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIE5lZWRlZCB0byBsZXQgKGNsaWNrKT1cImNsaWNrR3V0dGVyKC4uLilcIiBldmVudCBydW4gYW5kIHZlcmlmeSBpZiBtb3VzZSBtb3ZlZCBvciBub3RcclxuICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydFBvaW50ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW5kUG9pbnQgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbm90aWZ5KHR5cGU6ICdzdGFydCcgfCAncHJvZ3Jlc3MnIHwgJ2VuZCcgfCAnY2xpY2snIHwgJ2RibGNsaWNrJyB8ICd0cmFuc2l0aW9uRW5kJywgZ3V0dGVyTnVtOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzaXplcyA9IHRoaXMuZ2V0VmlzaWJsZUFyZWFTaXplcygpO1xyXG5cclxuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0YXJ0Jykge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdTdGFydC5lbWl0KHtndXR0ZXJOdW0sIHNpemVzfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZW5kJykge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdFbmQuZW1pdCh7Z3V0dGVyTnVtLCBzaXplc30pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NsaWNrJykge1xyXG4gICAgICAgICAgICB0aGlzLmd1dHRlckNsaWNrLmVtaXQoe2d1dHRlck51bSwgc2l6ZXN9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdkYmxjbGljaycpIHtcclxuICAgICAgICAgICAgdGhpcy5ndXR0ZXJEYmxDbGljay5lbWl0KHtndXR0ZXJOdW0sIHNpemVzfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAndHJhbnNpdGlvbkVuZCcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbkVuZFN1YnNjcmliZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB0aGlzLnRyYW5zaXRpb25FbmRTdWJzY3JpYmVyLm5leHQoc2l6ZXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3Byb2dyZXNzJykge1xyXG4gICAgICAgICAgICAvLyBTdGF5IG91dHNpZGUgem9uZSB0byBhbGxvdyB1c2VycyBkbyB3aGF0IHRoZXkgd2FudCBhYm91dCBjaGFuZ2UgZGV0ZWN0aW9uIG1lY2hhbmlzbS5cclxuICAgICAgICAgICAgdGhpcy5kcmFnUHJvZ3Jlc3NTdWJqZWN0Lm5leHQoe2d1dHRlck51bSwgc2l6ZXN9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbW92ZUd1dHRlcihndXR0ZXJJbmRleDogbnVtYmVyLCBvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGd1dHRlciA9IHRoaXMuZ3V0dGVyRWxzLnRvQXJyYXkoKVtndXR0ZXJJbmRleF0ubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb3Jpem9udGFsRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGd1dHRlci5zdHlsZS5sZWZ0ID0gYCR7LW9mZnNldH1weGA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ3V0dGVyLnN0eWxlLnRvcCA9IGAkey1vZmZzZXR9cHhgO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZXNldEd1dHRlck9mZnNldChndXR0ZXJJbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgZ3V0dGVyID0gdGhpcy5ndXR0ZXJFbHMudG9BcnJheSgpW2d1dHRlckluZGV4XS5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0hvcml6b250YWxEaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgZ3V0dGVyLnN0eWxlLmxlZnQgPSAnMHB4JztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBndXR0ZXIuc3R5bGUudG9wID0gJzBweCc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zdG9wRHJhZ2dpbmcoKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0LCBFbGVtZW50UmVmLCBSZW5kZXJlcjIsIE9uSW5pdCwgT25EZXN0cm95LCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IFNwbGl0Q29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50L3NwbGl0LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IGdldElucHV0UG9zaXRpdmVOdW1iZXIsIGdldElucHV0Qm9vbGVhbiB9IGZyb20gJy4uL3V0aWxzJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdhcy1zcGxpdC1hcmVhLCBbYXMtc3BsaXQtYXJlYV0nLFxyXG4gICAgZXhwb3J0QXM6ICdhc1NwbGl0QXJlYSdcclxufSlcclxuZXhwb3J0IGNsYXNzIFNwbGl0QXJlYURpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBwcml2YXRlIF9vcmRlcjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IG9yZGVyKHY6IG51bWJlciB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9vcmRlciA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3BsaXQudXBkYXRlQXJlYSh0aGlzLCB0cnVlLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBvcmRlcigpOiBudW1iZXIgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3JkZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX3NpemU6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBzaXplKHY6IG51bWJlciB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9zaXplID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCBudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcGxpdC51cGRhdGVBcmVhKHRoaXMsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IHNpemUoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX21pblNpemU6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBtaW5TaXplKHY6IG51bWJlciB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9taW5TaXplID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCBudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcGxpdC51cGRhdGVBcmVhKHRoaXMsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IG1pblNpemUoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21pblNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX21heFNpemU6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBtYXhTaXplKHY6IG51bWJlciB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9tYXhTaXplID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCBudWxsKTtcclxuXHJcbiAgICAgICAgdGhpcy5zcGxpdC51cGRhdGVBcmVhKHRoaXMsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IG1heFNpemUoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21heFNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX2xvY2tTaXplOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IGxvY2tTaXplKHY6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9sb2NrU2l6ZSA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuXHJcbiAgICAgICAgdGhpcy5zcGxpdC51cGRhdGVBcmVhKHRoaXMsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGxvY2tTaXplKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NrU2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSBfdmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IHZpc2libGUodjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3Zpc2libGUgPSBnZXRJbnB1dEJvb2xlYW4odik7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuX3Zpc2libGUpIHsgXHJcbiAgICAgICAgICAgIHRoaXMuc3BsaXQuc2hvd0FyZWEodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtaGlkZGVuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNwbGl0LmhpZGVBcmVhKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWhpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgdmlzaWJsZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmlzaWJsZTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uTGlzdGVuZXI6IEZ1bmN0aW9uO1xyXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2NrTGlzdGVuZXJzOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nWm9uZTogTmdab25lLFxyXG4gICAgICAgICAgICAgICAgcHVibGljIGVsUmVmOiBFbGVtZW50UmVmLFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxyXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBzcGxpdDogU3BsaXRDb21wb25lbnQpIHtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLXNwbGl0LWFyZWEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmdPbkluaXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zcGxpdC5hZGRBcmVhKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbkxpc3RlbmVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4odGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAndHJhbnNpdGlvbmVuZCcsIChldmVudDogVHJhbnNpdGlvbkV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBMaW1pdCBvbmx5IGZsZXgtYmFzaXMgdHJhbnNpdGlvbiB0byB0cmlnZ2VyIHRoZSBldmVudFxyXG4gICAgICAgICAgICAgICAgaWYoZXZlbnQucHJvcGVydHlOYW1lID09PSAnZmxleC1iYXNpcycpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwbGl0Lm5vdGlmeSgndHJhbnNpdGlvbkVuZCcsIC0xKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFN0eWxlT3JkZXIodmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnb3JkZXInLCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBzZXRTdHlsZUZsZXgoZ3JvdzogbnVtYmVyLCBzaHJpbms6IG51bWJlciwgYmFzaXM6IHN0cmluZywgaXNNaW46IGJvb2xlYW4sIGlzTWF4OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgLy8gTmVlZCAzIHNlcGFyYXRlZCBwcm9wZXJ0aWVzIHRvIHdvcmsgb24gSUUxMSAoaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvZmxleC1sYXlvdXQvaXNzdWVzLzMyMylcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2ZsZXgtZ3JvdycsIGdyb3cpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnZmxleC1zaHJpbmsnLCBzaHJpbmspO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnZmxleC1iYXNpcycsIGJhc2lzKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihpc01pbiA9PT0gdHJ1ZSkgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtbWluJyk7XHJcbiAgICAgICAgZWxzZSAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLW1pbicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKGlzTWF4ID09PSB0cnVlKSAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1tYXgnKTtcclxuICAgICAgICBlbHNlICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtbWF4Jyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBsb2NrRXZlbnRzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5sb2NrTGlzdGVuZXJzLnB1c2goIHRoaXMucmVuZGVyZXIubGlzdGVuKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ3NlbGVjdHN0YXJ0JywgKGU6IEV2ZW50KSA9PiBmYWxzZSkgKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NrTGlzdGVuZXJzLnB1c2goIHRoaXMucmVuZGVyZXIubGlzdGVuKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2RyYWdzdGFydCcsIChlOiBFdmVudCkgPT4gZmFsc2UpICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHVubG9ja0V2ZW50cygpOiB2b2lkIHtcclxuICAgICAgICB3aGlsZSh0aGlzLmxvY2tMaXN0ZW5lcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBmY3QgPSB0aGlzLmxvY2tMaXN0ZW5lcnMucG9wKCk7XHJcbiAgICAgICAgICAgIGlmKGZjdCkgZmN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnVubG9ja0V2ZW50cygpO1xyXG5cclxuICAgICAgICBpZih0aGlzLnRyYW5zaXRpb25MaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25MaXN0ZW5lcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zcGxpdC5yZW1vdmVBcmVhKHRoaXMpO1xyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcblxyXG5pbXBvcnQgeyBTcGxpdENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50L3NwbGl0LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNwbGl0QXJlYURpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlL3NwbGl0QXJlYS5kaXJlY3RpdmUnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtcclxuICAgICAgICBDb21tb25Nb2R1bGVcclxuICAgIF0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtcclxuICAgICAgICBTcGxpdENvbXBvbmVudCxcclxuICAgICAgICBTcGxpdEFyZWFEaXJlY3RpdmUsXHJcbiAgICBdLFxyXG4gICAgZXhwb3J0czogW1xyXG4gICAgICAgIFNwbGl0Q29tcG9uZW50LFxyXG4gICAgICAgIFNwbGl0QXJlYURpcmVjdGl2ZSxcclxuICAgIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJTcGxpdE1vZHVsZSB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5nTW9kdWxlOiBBbmd1bGFyU3BsaXRNb2R1bGUsXHJcbiAgICAgICAgICAgIHByb3ZpZGVyczogW11cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZm9yQ2hpbGQoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmdNb2R1bGU6IEFuZ3VsYXJTcGxpdE1vZHVsZSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBSUEsU0FBZ0IsaUJBQWlCLENBQUMsS0FBOEI7O0lBRTVELElBQUcsb0JBQWMsS0FBSyxJQUFFLGNB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LEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbEssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzdGLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDckcs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