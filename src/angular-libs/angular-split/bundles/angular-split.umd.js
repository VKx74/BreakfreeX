(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('angular-split', ['exports', '@angular/core', 'rxjs', 'rxjs/operators', '@angular/common'], factory) :
    (factory((global['angular-split'] = {}),global.ng.core,global.rxjs,global.rxjs.operators,global.ng.common));
}(this, (function (exports,core,rxjs,operators,common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

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
        if ((( /** @type {?} */(event))).changedTouches !== undefined && (( /** @type {?} */(event))).changedTouches.length > 0) {
            return {
                x: (( /** @type {?} */(event))).changedTouches[0].clientX,
                y: (( /** @type {?} */(event))).changedTouches[0].clientY,
            };
        }
        // MouseEvent
        else if ((( /** @type {?} */(event))).clientX !== undefined && (( /** @type {?} */(event))).clientY !== undefined) {
            return {
                x: (( /** @type {?} */(event))).clientX,
                y: (( /** @type {?} */(event))).clientY,
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
        var rect = (( /** @type {?} */(elRef.nativeElement))).getBoundingClientRect();
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
    var SplitComponent = /** @class */ (function () {
        function SplitComponent(ngZone, elRef, cdRef, renderer) {
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
            this.dragStart = new core.EventEmitter(false);
            this.dragEnd = new core.EventEmitter(false);
            this.gutterClick = new core.EventEmitter(false);
            this.gutterDblClick = new core.EventEmitter(false);
            this.dragProgressSubject = new rxjs.Subject();
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
        Object.defineProperty(SplitComponent.prototype, "direction", {
            get: /**
             * @return {?}
             */ function () {
                return this._direction;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._direction = (v === 'vertical') ? 'vertical' : 'horizontal';
                this.renderer.addClass(this.elRef.nativeElement, "as-" + this._direction);
                this.renderer.removeClass(this.elRef.nativeElement, "as-" + ((this._direction === 'vertical') ? 'horizontal' : 'vertical'));
                this.build(false, false);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "isHorizontalDirection", {
            get: /**
             * @return {?}
             */ function () {
                return this.direction === 'horizontal';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "unit", {
            get: /**
             * @return {?}
             */ function () {
                return this._unit;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._unit = (v === 'pixel') ? 'pixel' : 'percent';
                this.renderer.addClass(this.elRef.nativeElement, "as-" + this._unit);
                this.renderer.removeClass(this.elRef.nativeElement, "as-" + ((this._unit === 'pixel') ? 'percent' : 'pixel'));
                this.build(false, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "gutterSize", {
            get: /**
             * @return {?}
             */ function () {
                return this._gutterSize;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._gutterSize = getInputPositiveNumber(v, 11);
                this.build(false, false);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "gutterStep", {
            get: /**
             * @return {?}
             */ function () {
                return this._gutterStep;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._gutterStep = getInputPositiveNumber(v, 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "restrictMove", {
            get: /**
             * @return {?}
             */ function () {
                return this._restrictMove;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._restrictMove = getInputBoolean(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "useTransition", {
            get: /**
             * @return {?}
             */ function () {
                return this._useTransition;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._useTransition = getInputBoolean(v);
                if (this._useTransition) {
                    this.renderer.addClass(this.elRef.nativeElement, 'as-transition');
                }
                else {
                    this.renderer.removeClass(this.elRef.nativeElement, 'as-transition');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "disabled", {
            get: /**
             * @return {?}
             */ function () {
                return this._disabled;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._disabled = getInputBoolean(v);
                if (this._disabled) {
                    this.renderer.addClass(this.elRef.nativeElement, 'as-disabled');
                }
                else {
                    this.renderer.removeClass(this.elRef.nativeElement, 'as-disabled');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "dir", {
            get: /**
             * @return {?}
             */ function () {
                return this._dir;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._dir = (v === 'rtl') ? 'rtl' : 'ltr';
                this.renderer.setAttribute(this.elRef.nativeElement, 'dir', this._dir);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "gutterDblClickDuration", {
            get: /**
             * @return {?}
             */ function () {
                return this._gutterDblClickDuration;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._gutterDblClickDuration = getInputPositiveNumber(v, 0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitComponent.prototype, "transitionEnd", {
            get: /**
             * @return {?}
             */ function () {
                var _this = this;
                return new rxjs.Observable(function (subscriber) { return _this.transitionEndSubscriber = subscriber; }).pipe(operators.debounceTime(20));
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @return {?}
         */
        SplitComponent.prototype.ngAfterViewInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this.ngZone.runOutsideAngular(function () {
                    // To avoid transition at first rendering
                    setTimeout(function () { return _this.renderer.addClass(_this.elRef.nativeElement, 'as-init'); });
                });
            };
        /**
         * @return {?}
         */
        SplitComponent.prototype.getNbGutters = /**
         * @return {?}
         */
            function () {
                return (this.displayedAreas.length === 0) ? 0 : this.displayedAreas.length - 1;
            };
        /**
         * @param {?} component
         * @return {?}
         */
        SplitComponent.prototype.addArea = /**
         * @param {?} component
         * @return {?}
         */
            function (component) {
                /** @type {?} */
                var newArea = {
                    component: component,
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
            };
        /**
         * @param {?} component
         * @return {?}
         */
        SplitComponent.prototype.removeArea = /**
         * @param {?} component
         * @return {?}
         */
            function (component) {
                if (this.displayedAreas.some(function (a) { return a.component === component; })) {
                    /** @type {?} */
                    var area = this.displayedAreas.find(function (a) { return a.component === component; });
                    this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
                    this.build(true, true);
                }
                else if (this.hidedAreas.some(function (a) { return a.component === component; })) {
                    /** @type {?} */
                    var area = this.hidedAreas.find(function (a) { return a.component === component; });
                    this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
                }
            };
        /**
         * @param {?} component
         * @param {?} resetOrders
         * @param {?} resetSizes
         * @return {?}
         */
        SplitComponent.prototype.updateArea = /**
         * @param {?} component
         * @param {?} resetOrders
         * @param {?} resetSizes
         * @return {?}
         */
            function (component, resetOrders, resetSizes) {
                if (component.visible === true) {
                    this.build(resetOrders, resetSizes);
                }
            };
        /**
         * @param {?} component
         * @return {?}
         */
        SplitComponent.prototype.showArea = /**
         * @param {?} component
         * @return {?}
         */
            function (component) {
                var _a;
                /** @type {?} */
                var area = this.hidedAreas.find(function (a) { return a.component === component; });
                if (area === undefined) {
                    return;
                }
                /** @type {?} */
                var areas = this.hidedAreas.splice(this.hidedAreas.indexOf(area), 1);
                (_a = this.displayedAreas).push.apply(_a, __spread(areas));
                this.build(true, true);
            };
        /**
         * @param {?} comp
         * @return {?}
         */
        SplitComponent.prototype.hideArea = /**
         * @param {?} comp
         * @return {?}
         */
            function (comp) {
                var _a;
                /** @type {?} */
                var area = this.displayedAreas.find(function (a) { return a.component === comp; });
                if (area === undefined) {
                    return;
                }
                /** @type {?} */
                var areas = this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
                areas.forEach(function (area) {
                    area.order = 0;
                    area.size = 0;
                });
                (_a = this.hidedAreas).push.apply(_a, __spread(areas));
                this.build(true, true);
            };
        /**
         * @return {?}
         */
        SplitComponent.prototype.getVisibleAreaSizes = /**
         * @return {?}
         */
            function () {
                return this.displayedAreas.map(function (a) { return a.size === null ? '*' : a.size; });
            };
        /**
         * @param {?} sizes
         * @return {?}
         */
        SplitComponent.prototype.setVisibleAreaSizes = /**
         * @param {?} sizes
         * @return {?}
         */
            function (sizes) {
                if (sizes.length !== this.displayedAreas.length) {
                    return false;
                }
                /** @type {?} */
                var formatedSizes = sizes.map(function (s) { return getInputPositiveNumber(s, null); });
                /** @type {?} */
                var isValid = isUserSizesValid(this.unit, formatedSizes);
                if (isValid === false) {
                    return false;
                }
                // @ts-ignore
                this.displayedAreas.forEach(function (area, i) { return area.component._size = formatedSizes[i]; });
                this.build(false, true);
                return true;
            };
        /**
         * @param {?} resetOrders
         * @param {?} resetSizes
         * @return {?}
         */
        SplitComponent.prototype.build = /**
         * @param {?} resetOrders
         * @param {?} resetSizes
         * @return {?}
         */
            function (resetOrders, resetSizes) {
                this.stopDragging();
                // ¤ AREAS ORDER
                if (resetOrders === true) {
                    // If user provided 'order' for each area, use it to sort them.
                    if (this.displayedAreas.every(function (a) { return a.component.order !== null; })) {
                        this.displayedAreas.sort(function (a, b) { return (( /** @type {?} */(a.component.order))) - (( /** @type {?} */(b.component.order))); });
                    }
                    // Then set real order with multiples of 2, numbers between will be used by gutters.
                    this.displayedAreas.forEach(function (area, i) {
                        area.order = i * 2;
                        area.component.setStyleOrder(area.order);
                    });
                }
                // ¤ AREAS SIZE
                if (resetSizes === true) {
                    /** @type {?} */
                    var useUserSizes_1 = isUserSizesValid(this.unit, this.displayedAreas.map(function (a) { return a.component.size; }));
                    switch (this.unit) {
                        case 'percent': {
                            /** @type {?} */
                            var defaultSize_1 = 100 / this.displayedAreas.length;
                            this.displayedAreas.forEach(function (area) {
                                area.size = useUserSizes_1 ? ( /** @type {?} */(area.component.size)) : defaultSize_1;
                                area.minSize = getAreaMinSize(area);
                                area.maxSize = getAreaMaxSize(area);
                            });
                            break;
                        }
                        case 'pixel': {
                            if (useUserSizes_1) {
                                this.displayedAreas.forEach(function (area) {
                                    area.size = area.component.size;
                                    area.minSize = getAreaMinSize(area);
                                    area.maxSize = getAreaMaxSize(area);
                                });
                            }
                            else {
                                /** @type {?} */
                                var wildcardSizeAreas = this.displayedAreas.filter(function (a) { return a.component.size === null; });
                                // No wildcard area > Need to select one arbitrarily > first
                                if (wildcardSizeAreas.length === 0 && this.displayedAreas.length > 0) {
                                    this.displayedAreas.forEach(function (area, i) {
                                        area.size = (i === 0) ? null : area.component.size;
                                        area.minSize = (i === 0) ? null : getAreaMinSize(area);
                                        area.maxSize = (i === 0) ? null : getAreaMaxSize(area);
                                    });
                                }
                                // More than one wildcard area > Need to keep only one arbitrarly > first
                                else if (wildcardSizeAreas.length > 1) {
                                    /** @type {?} */
                                    var alreadyGotOne_1 = false;
                                    this.displayedAreas.forEach(function (area) {
                                        if (area.component.size === null) {
                                            if (alreadyGotOne_1 === false) {
                                                area.size = null;
                                                area.minSize = null;
                                                area.maxSize = null;
                                                alreadyGotOne_1 = true;
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
            };
        /**
         * @return {?}
         */
        SplitComponent.prototype.refreshStyleSizes = /**
         * @return {?}
         */
            function () {
                var _this = this;
                ///////////////////////////////////////////
                // PERCENT MODE
                if (this.unit === 'percent') {
                    // Only one area > flex-basis 100%
                    if (this.displayedAreas.length === 1) {
                        this.displayedAreas[0].component.setStyleFlex(0, 0, "100%", false, false);
                    }
                    // Multiple areas > use each percent basis
                    else {
                        /** @type {?} */
                        var sumGutterSize_1 = this.getNbGutters() * this.gutterSize;
                        this.displayedAreas.forEach(function (area) {
                            area.component.setStyleFlex(0, 0, "calc( " + area.size + "% - " + ( /** @type {?} */(area.size)) / 100 * sumGutterSize_1 + "px )", (area.minSize !== null && area.minSize === area.size) ? true : false, (area.maxSize !== null && area.maxSize === area.size) ? true : false);
                        });
                    }
                }
                ///////////////////////////////////////////
                // PIXEL MODE
                else if (this.unit === 'pixel') {
                    this.displayedAreas.forEach(function (area) {
                        // Area with wildcard size
                        if (area.size === null) {
                            if (_this.displayedAreas.length === 1) {
                                area.component.setStyleFlex(1, 1, "100%", false, false);
                            }
                            else {
                                area.component.setStyleFlex(1, 1, "auto", false, false);
                            }
                        }
                        // Area with pixel size
                        else {
                            // Only one area > flex-basis 100%
                            if (_this.displayedAreas.length === 1) {
                                area.component.setStyleFlex(0, 0, "100%", false, false);
                            }
                            // Multiple areas > use each pixel basis
                            else {
                                area.component.setStyleFlex(0, 0, area.size + "px", (area.minSize !== null && area.minSize === area.size) ? true : false, (area.maxSize !== null && area.maxSize === area.size) ? true : false);
                            }
                        }
                    });
                }
            };
        /**
         * @param {?} event
         * @param {?} gutterNum
         * @return {?}
         */
        SplitComponent.prototype.clickGutter = /**
         * @param {?} event
         * @param {?} gutterNum
         * @return {?}
         */
            function (event, gutterNum) {
                var _this = this;
                /** @type {?} */
                var tempPoint = getPointFromEvent(event);
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
                        this._clickTimeout = window.setTimeout(function () {
                            _this._clickTimeout = null;
                            _this.notify('click', gutterNum);
                            _this.stopDragging();
                        }, this.gutterDblClickDuration);
                    }
                }
            };
        /**
         * @param {?} event
         * @param {?} gutterOrder
         * @param {?} gutterNum
         * @return {?}
         */
        SplitComponent.prototype.startDragging = /**
         * @param {?} event
         * @param {?} gutterOrder
         * @param {?} gutterNum
         * @return {?}
         */
            function (event, gutterOrder, gutterNum) {
                var _this = this;
                event.preventDefault();
                event.stopPropagation();
                this.startPoint = getPointFromEvent(event);
                if (this.startPoint === null || this.disabled === true) {
                    return;
                }
                this.snapshot = {
                    gutterNum: gutterNum,
                    lastSteppedOffset: 0,
                    allAreasSizePixel: getElementPixelSize(this.elRef, this.direction) - this.getNbGutters() * this.gutterSize,
                    allInvolvedAreasSizePercent: 100,
                    areasBeforeGutter: [],
                    areasAfterGutter: [],
                };
                this.displayedAreas.forEach(function (area) {
                    /** @type {?} */
                    var areaSnapshot = {
                        area: area,
                        sizePixelAtStart: getElementPixelSize(area.component.elRef, _this.direction),
                        sizePercentAtStart: (_this.unit === 'percent') ? area.size : -1 // If pixel mode, anyway, will not be used.
                    };
                    if (area.order < gutterOrder) {
                        if (_this.restrictMove === true) {
                            _this.snapshot.areasBeforeGutter = [areaSnapshot];
                        }
                        else {
                            _this.snapshot.areasBeforeGutter.unshift(areaSnapshot);
                        }
                    }
                    else if (area.order > gutterOrder) {
                        if (_this.restrictMove === true) {
                            if (_this.snapshot.areasAfterGutter.length === 0) {
                                _this.snapshot.areasAfterGutter = [areaSnapshot];
                            }
                        }
                        else {
                            _this.snapshot.areasAfterGutter.push(areaSnapshot);
                        }
                    }
                });
                this.snapshot.allInvolvedAreasSizePercent = __spread(this.snapshot.areasBeforeGutter, this.snapshot.areasAfterGutter).reduce(function (t, a) { return t + a.sizePercentAtStart; }, 0);
                if (this.snapshot.areasBeforeGutter.length === 0 || this.snapshot.areasAfterGutter.length === 0) {
                    return;
                }
                this.ngZone.runOutsideAngular(function () {
                    _this.dragListeners.push(_this.renderer.listen('document', 'mouseup', _this.stopDragging.bind(_this)));
                    _this.dragListeners.push(_this.renderer.listen('document', 'touchend', _this.stopDragging.bind(_this)));
                    _this.dragListeners.push(_this.renderer.listen('document', 'touchcancel', _this.stopDragging.bind(_this)));
                    _this.dragListeners.push(_this.renderer.listen('document', 'mousemove', _this.dragEvent.bind(_this)));
                    _this.dragListeners.push(_this.renderer.listen('document', 'touchmove', _this.dragEvent.bind(_this)));
                });
                this.displayedAreas.forEach(function (area) { return area.component.lockEvents(); });
                this.isDragging = true;
                this.renderer.addClass(this.elRef.nativeElement, 'as-dragging');
                this.renderer.addClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');
                this.notify('start', this.snapshot.gutterNum);
            };
        /**
         * @param {?} event
         * @return {?}
         */
        SplitComponent.prototype.dragEvent = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                var _this = this;
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
                var offset = (this.direction === 'horizontal') ? (this.startPoint.x - this.endPoint.x) : (this.startPoint.y - this.endPoint.y);
                if (this.dir === 'rtl') {
                    offset = -offset;
                }
                /** @type {?} */
                var steppedOffset = Math.round(offset / this.gutterStep) * this.gutterStep;
                if (steppedOffset === this.snapshot.lastSteppedOffset) {
                    return;
                }
                this.snapshot.lastSteppedOffset = steppedOffset;
                // Need to know if each gutter side areas could reacts to steppedOffset
                /** @type {?} */
                var areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -steppedOffset, this.snapshot.allAreasSizePixel);
                /** @type {?} */
                var areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset, this.snapshot.allAreasSizePixel);
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
                    var all = __spread(areasBefore.list, areasAfter.list);
                    /** @type {?} */
                    var areaToReset_1 = all.find(function (a) { return a.percentAfterAbsorption !== 0 && a.percentAfterAbsorption !== a.areaSnapshot.area.minSize && a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize; });
                    if (areaToReset_1) {
                        areaToReset_1.percentAfterAbsorption = this.snapshot.allInvolvedAreasSizePercent - all.filter(function (a) { return a !== areaToReset_1; }).reduce(function (total, a) { return total + a.percentAfterAbsorption; }, 0);
                    }
                }
                // Now we know areas could absorb steppedOffset, time to really update sizes
                areasBefore.list.forEach(function (item) { return updateAreaSize(_this.unit, item); });
                areasAfter.list.forEach(function (item) { return updateAreaSize(_this.unit, item); });
                /** @type {?} */
                var areasResized = areasBefore.remain === 0 && areasAfter.remain === 0;
                if (areasResized) {
                    this._moveGutter(this.snapshot.gutterNum - 1, steppedOffset);
                }
                // this.refreshStyleSizes();
                this.notify('progress', this.snapshot.gutterNum);
            };
        /**
         * @param {?=} event
         * @return {?}
         */
        SplitComponent.prototype.stopDragging = /**
         * @param {?=} event
         * @return {?}
         */
            function (event) {
                var _this = this;
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (this.isDragging === false) {
                    return;
                }
                this.refreshStyleSizes();
                this._resetGutterOffset(this.snapshot.gutterNum - 1);
                this.displayedAreas.forEach(function (area) { return area.component.unlockEvents(); });
                while (this.dragListeners.length > 0) {
                    /** @type {?} */
                    var fct = this.dragListeners.pop();
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
                this.ngZone.runOutsideAngular(function () {
                    setTimeout(function () {
                        _this.startPoint = null;
                        _this.endPoint = null;
                    });
                });
            };
        /**
         * @param {?} type
         * @param {?} gutterNum
         * @return {?}
         */
        SplitComponent.prototype.notify = /**
         * @param {?} type
         * @param {?} gutterNum
         * @return {?}
         */
            function (type, gutterNum) {
                var _this = this;
                /** @type {?} */
                var sizes = this.getVisibleAreaSizes();
                if (type === 'start') {
                    this.dragStart.emit({ gutterNum: gutterNum, sizes: sizes });
                }
                else if (type === 'end') {
                    this.dragEnd.emit({ gutterNum: gutterNum, sizes: sizes });
                }
                else if (type === 'click') {
                    this.gutterClick.emit({ gutterNum: gutterNum, sizes: sizes });
                }
                else if (type === 'dblclick') {
                    this.gutterDblClick.emit({ gutterNum: gutterNum, sizes: sizes });
                }
                else if (type === 'transitionEnd') {
                    if (this.transitionEndSubscriber) {
                        this.ngZone.run(function () { return _this.transitionEndSubscriber.next(sizes); });
                    }
                }
                else if (type === 'progress') {
                    // Stay outside zone to allow users do what they want about change detection mechanism.
                    this.dragProgressSubject.next({ gutterNum: gutterNum, sizes: sizes });
                }
            };
        /**
         * @param {?} gutterIndex
         * @param {?} offset
         * @return {?}
         */
        SplitComponent.prototype._moveGutter = /**
         * @param {?} gutterIndex
         * @param {?} offset
         * @return {?}
         */
            function (gutterIndex, offset) {
                /** @type {?} */
                var gutter = this.gutterEls.toArray()[gutterIndex].nativeElement;
                if (this.isHorizontalDirection) {
                    gutter.style.left = -offset + "px";
                }
                else {
                    gutter.style.top = -offset + "px";
                }
            };
        /**
         * @param {?} gutterIndex
         * @return {?}
         */
        SplitComponent.prototype._resetGutterOffset = /**
         * @param {?} gutterIndex
         * @return {?}
         */
            function (gutterIndex) {
                /** @type {?} */
                var gutter = this.gutterEls.toArray()[gutterIndex].nativeElement;
                if (this.isHorizontalDirection) {
                    gutter.style.left = '0px';
                }
                else {
                    gutter.style.top = '0px';
                }
            };
        /**
         * @return {?}
         */
        SplitComponent.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this.stopDragging();
            };
        SplitComponent.decorators = [
            { type: core.Component, args: [{
                        selector: 'as-split',
                        exportAs: 'asSplit',
                        changeDetection: core.ChangeDetectionStrategy.OnPush,
                        template: "\n        <ng-content></ng-content>\n        <ng-template ngFor [ngForOf]=\"displayedAreas\" let-index=\"index\" let-last=\"last\">\n            <div *ngIf=\"last === false\"\n                 #gutterEls\n                 class=\"as-split-gutter\"\n                 [style.flex-basis.px]=\"gutterSize\"\n                 [style.order]=\"index*2+1\"\n                 (mousedown)=\"startDragging($event, index*2+1, index+1)\"\n                 (touchstart)=\"startDragging($event, index*2+1, index+1)\"\n                 (mouseup)=\"clickGutter($event, index+1)\"\n                 (touchend)=\"clickGutter($event, index+1)\">\n                <div class=\"as-split-gutter-icon\"></div>\n            </div>\n        </ng-template>",
                        styles: [":host{display:flex;flex-wrap:nowrap;justify-content:flex-start;align-items:stretch;overflow:hidden;width:100%;height:100%}:host>.as-split-gutter{position:relative;flex-grow:0;flex-shrink:0;background-color:#eee;display:flex;align-items:center;justify-content:center}:host>.as-split-gutter>.as-split-gutter-icon{width:100%;height:100%;background-position:center center;background-repeat:no-repeat}:host ::ng-deep>.as-split-area{flex-grow:0;flex-shrink:0;overflow-x:hidden;overflow-y:auto}:host ::ng-deep>.as-split-area.as-hidden{flex:0 1 0!important;overflow-x:hidden;overflow-y:hidden}:host.as-horizontal{flex-direction:row}:host.as-horizontal>.as-split-gutter{flex-direction:row;cursor:col-resize;height:100%}:host.as-horizontal>.as-split-gutter>.as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-horizontal ::ng-deep>.as-split-area{height:100%}:host.as-vertical{flex-direction:column}:host.as-vertical>.as-split-gutter{flex-direction:column;cursor:row-resize;width:100%}:host.as-vertical>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC)}:host.as-vertical ::ng-deep>.as-split-area{width:100%}:host.as-vertical ::ng-deep>.as-split-area.as-hidden{max-width:0}:host.as-disabled>.as-split-gutter{cursor:default}:host.as-disabled>.as-split-gutter .as-split-gutter-icon{background-image:none}:host.as-transition.as-init:not(.as-dragging) ::ng-deep>.as-split-area,:host.as-transition.as-init:not(.as-dragging)>.as-split-gutter{transition:flex-basis .3s}"]
                    }] }
        ];
        /** @nocollapse */
        SplitComponent.ctorParameters = function () {
            return [
                { type: core.NgZone },
                { type: core.ElementRef },
                { type: core.ChangeDetectorRef },
                { type: core.Renderer2 }
            ];
        };
        SplitComponent.propDecorators = {
            direction: [{ type: core.Input }],
            unit: [{ type: core.Input }],
            gutterSize: [{ type: core.Input }],
            gutterStep: [{ type: core.Input }],
            restrictMove: [{ type: core.Input }],
            useTransition: [{ type: core.Input }],
            disabled: [{ type: core.Input }],
            dir: [{ type: core.Input }],
            gutterDblClickDuration: [{ type: core.Input }],
            dragStart: [{ type: core.Output }],
            dragEnd: [{ type: core.Output }],
            gutterClick: [{ type: core.Output }],
            gutterDblClick: [{ type: core.Output }],
            transitionEnd: [{ type: core.Output }],
            gutterEls: [{ type: core.ViewChildren, args: ['gutterEls',] }]
        };
        return SplitComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */
    var SplitAreaDirective = /** @class */ (function () {
        function SplitAreaDirective(ngZone, elRef, renderer, split) {
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
        Object.defineProperty(SplitAreaDirective.prototype, "order", {
            get: /**
             * @return {?}
             */ function () {
                return this._order;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._order = getInputPositiveNumber(v, null);
                this.split.updateArea(this, true, false);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitAreaDirective.prototype, "size", {
            get: /**
             * @return {?}
             */ function () {
                return this._size;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._size = getInputPositiveNumber(v, null);
                this.split.updateArea(this, false, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitAreaDirective.prototype, "minSize", {
            get: /**
             * @return {?}
             */ function () {
                return this._minSize;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._minSize = getInputPositiveNumber(v, null);
                this.split.updateArea(this, false, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitAreaDirective.prototype, "maxSize", {
            get: /**
             * @return {?}
             */ function () {
                return this._maxSize;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._maxSize = getInputPositiveNumber(v, null);
                this.split.updateArea(this, false, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitAreaDirective.prototype, "lockSize", {
            get: /**
             * @return {?}
             */ function () {
                return this._lockSize;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._lockSize = getInputBoolean(v);
                this.split.updateArea(this, false, true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitAreaDirective.prototype, "visible", {
            get: /**
             * @return {?}
             */ function () {
                return this._visible;
            },
            set: /**
             * @param {?} v
             * @return {?}
             */ function (v) {
                this._visible = getInputBoolean(v);
                if (this._visible) {
                    this.split.showArea(this);
                    this.renderer.removeClass(this.elRef.nativeElement, 'as-hidden');
                }
                else {
                    this.split.hideArea(this);
                    this.renderer.addClass(this.elRef.nativeElement, 'as-hidden');
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @return {?}
         */
        SplitAreaDirective.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this.split.addArea(this);
                this.ngZone.runOutsideAngular(function () {
                    _this.transitionListener = _this.renderer.listen(_this.elRef.nativeElement, 'transitionend', function (event) {
                        // Limit only flex-basis transition to trigger the event
                        if (event.propertyName === 'flex-basis') {
                            _this.split.notify('transitionEnd', -1);
                        }
                    });
                });
            };
        /**
         * @param {?} value
         * @return {?}
         */
        SplitAreaDirective.prototype.setStyleOrder = /**
         * @param {?} value
         * @return {?}
         */
            function (value) {
                this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
            };
        /**
         * @param {?} grow
         * @param {?} shrink
         * @param {?} basis
         * @param {?} isMin
         * @param {?} isMax
         * @return {?}
         */
        SplitAreaDirective.prototype.setStyleFlex = /**
         * @param {?} grow
         * @param {?} shrink
         * @param {?} basis
         * @param {?} isMin
         * @param {?} isMax
         * @return {?}
         */
            function (grow, shrink, basis, isMin, isMax) {
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
            };
        /**
         * @return {?}
         */
        SplitAreaDirective.prototype.lockEvents = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this.ngZone.runOutsideAngular(function () {
                    _this.lockListeners.push(_this.renderer.listen(_this.elRef.nativeElement, 'selectstart', function (e) { return false; }));
                    _this.lockListeners.push(_this.renderer.listen(_this.elRef.nativeElement, 'dragstart', function (e) { return false; }));
                });
            };
        /**
         * @return {?}
         */
        SplitAreaDirective.prototype.unlockEvents = /**
         * @return {?}
         */
            function () {
                while (this.lockListeners.length > 0) {
                    /** @type {?} */
                    var fct = this.lockListeners.pop();
                    if (fct)
                        fct();
                }
            };
        /**
         * @return {?}
         */
        SplitAreaDirective.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this.unlockEvents();
                if (this.transitionListener) {
                    this.transitionListener();
                }
                this.split.removeArea(this);
            };
        SplitAreaDirective.decorators = [
            { type: core.Directive, args: [{
                        selector: 'as-split-area, [as-split-area]',
                        exportAs: 'asSplitArea'
                    },] }
        ];
        /** @nocollapse */
        SplitAreaDirective.ctorParameters = function () {
            return [
                { type: core.NgZone },
                { type: core.ElementRef },
                { type: core.Renderer2 },
                { type: SplitComponent }
            ];
        };
        SplitAreaDirective.propDecorators = {
            order: [{ type: core.Input }],
            size: [{ type: core.Input }],
            minSize: [{ type: core.Input }],
            maxSize: [{ type: core.Input }],
            lockSize: [{ type: core.Input }],
            visible: [{ type: core.Input }]
        };
        return SplitAreaDirective;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */
    var AngularSplitModule = /** @class */ (function () {
        function AngularSplitModule() {
        }
        /**
         * @return {?}
         */
        AngularSplitModule.forRoot = /**
         * @return {?}
         */
            function () {
                return {
                    ngModule: AngularSplitModule,
                    providers: []
                };
            };
        /**
         * @return {?}
         */
        AngularSplitModule.forChild = /**
         * @return {?}
         */
            function () {
                return {
                    ngModule: AngularSplitModule,
                    providers: []
                };
            };
        AngularSplitModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [
                            common.CommonModule
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
        return AngularSplitModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
     */

    exports.AngularSplitModule = AngularSplitModule;
    exports.SplitComponent = SplitComponent;
    exports.SplitAreaDirective = SplitAreaDirective;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1zcGxpdC51bWQuanMubWFwIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwibmc6Ly9hbmd1bGFyLXNwbGl0L2xpYi91dGlscy50cyIsIm5nOi8vYW5ndWxhci1zcGxpdC9saWIvY29tcG9uZW50L3NwbGl0LmNvbXBvbmVudC50cyIsIm5nOi8vYW5ndWxhci1zcGxpdC9saWIvZGlyZWN0aXZlL3NwbGl0QXJlYS5kaXJlY3RpdmUudHMiLCJuZzovL2FuZ3VsYXItc3BsaXQvbGliL21vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxyXG50aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZVxyXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG5cclxuVEhJUyBDT0RFIElTIFBST1ZJREVEIE9OIEFOICpBUyBJUyogQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWVxyXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXHJcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXHJcbk1FUkNIQU5UQUJMSVRZIE9SIE5PTi1JTkZSSU5HRU1FTlQuXHJcblxyXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcclxuYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDApXHJcbiAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUocmVzdWx0LnZhbHVlKTsgfSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSByZXN1bHRba10gPSBtb2Rba107XHJcbiAgICByZXN1bHQuZGVmYXVsdCA9IG1vZDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcbiIsImltcG9ydCB7IEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IElBcmVhLCBJUG9pbnQsIElBcmVhU25hcHNob3QsIElTcGxpdFNpZGVBYnNvcnB0aW9uQ2FwYWNpdHksIElBcmVhQWJzb3JwdGlvbkNhcGFjaXR5IH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvaW50RnJvbUV2ZW50KGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCk6IElQb2ludCB7XHJcbiAgICAvLyBUb3VjaEV2ZW50XHJcbiAgICBpZigoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlcyAhPT0gdW5kZWZpbmVkICYmICg8VG91Y2hFdmVudD4gZXZlbnQpLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiAoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLFxyXG4gICAgICAgICAgICB5OiAoPFRvdWNoRXZlbnQ+IGV2ZW50KS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvLyBNb3VzZUV2ZW50XHJcbiAgICBlbHNlIGlmKCg8TW91c2VFdmVudD4gZXZlbnQpLmNsaWVudFggIT09IHVuZGVmaW5lZCAmJiAoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRZICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiAoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRYLFxyXG4gICAgICAgICAgICB5OiAoPE1vdXNlRXZlbnQ+IGV2ZW50KS5jbGllbnRZLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRQaXhlbFNpemUoZWxSZWY6IEVsZW1lbnRSZWYsIGRpcmVjdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyk6IG51bWJlciB7XHJcbiAgICBjb25zdCByZWN0ID0gKDxIVE1MRWxlbWVudD4gZWxSZWYubmF0aXZlRWxlbWVudCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgcmV0dXJuIChkaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykgPyByZWN0LndpZHRoIDogcmVjdC5oZWlnaHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnB1dEJvb2xlYW4odjogYW55KTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKHR5cGVvZih2KSA9PT0gJ2Jvb2xlYW4nKSA/IHYgOiAodiA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdHJ1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyPFQ+KHY6IGFueSwgZGVmYXVsdFZhbHVlOiBUKTogbnVtYmVyIHwgVCB7XHJcbiAgICBpZih2ID09PSBudWxsIHx8IHYgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuXHJcbiAgICB2ID0gTnVtYmVyKHYpO1xyXG4gICAgcmV0dXJuICFpc05hTih2KSAmJiB2ID49IDAgPyB2IDogZGVmYXVsdFZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNVc2VyU2l6ZXNWYWxpZCh1bml0OiAncGVyY2VudCcgfCAncGl4ZWwnLCBzaXplczogQXJyYXk8bnVtYmVyIHwgbnVsbD4pOiBib29sZWFuIHtcclxuICAgIC8vIEFsbCBzaXplcyBoYXZlIHRvIGJlIG5vdCBudWxsIGFuZCB0b3RhbCBzaG91bGQgYmUgMTAwXHJcbiAgICBpZih1bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgICBjb25zdCB0b3RhbCA9IHNpemVzLnJlZHVjZSgodG90YWwsIHMpID0+IHMgIT09IG51bGwgPyB0b3RhbCArIHMgOiB0b3RhbCwgMCk7XHJcbiAgICAgICAgcmV0dXJuIHNpemVzLmV2ZXJ5KHMgPT4gcyAhPT0gbnVsbCkgJiYgdG90YWwgPiA5OS45ICYmIHRvdGFsIDwgMTAwLjE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEEgc2l6ZSBhdCBudWxsIGlzIG1hbmRhdG9yeSBidXQgb25seSBvbmUuXHJcbiAgICBpZih1bml0ID09PSAncGl4ZWwnKSB7XHJcbiAgICAgICAgcmV0dXJuIHNpemVzLmZpbHRlcihzID0+IHMgPT09IG51bGwpLmxlbmd0aCA9PT0gMTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZWFNaW5TaXplKGE6IElBcmVhKTogbnVsbCB8IG51bWJlciB7XHJcbiAgICBpZihhLnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoYS5jb21wb25lbnQubG9ja1NpemUgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gYS5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGEuY29tcG9uZW50Lm1pblNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZihhLmNvbXBvbmVudC5taW5TaXplID4gYS5zaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGEuc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYS5jb21wb25lbnQubWluU2l6ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZWFNYXhTaXplKGE6IElBcmVhKTogbnVsbCB8IG51bWJlciB7XHJcbiAgICBpZihhLnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYoYS5jb21wb25lbnQubG9ja1NpemUgPT09IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gYS5zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGEuY29tcG9uZW50Lm1heFNpemUgPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZihhLmNvbXBvbmVudC5tYXhTaXplIDwgYS5zaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGEuc2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYS5jb21wb25lbnQubWF4U2l6ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkodW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJywgc2lkZUFyZWFzOiBBcnJheTxJQXJlYVNuYXBzaG90PiwgcGl4ZWxzOiBudW1iZXIsIGFsbEFyZWFzU2l6ZVBpeGVsOiBudW1iZXIpOiBJU3BsaXRTaWRlQWJzb3JwdGlvbkNhcGFjaXR5IHtcclxuICAgIHJldHVybiBzaWRlQXJlYXMucmVkdWNlKChhY2MsIGFyZWEpID0+IHtcclxuICAgICAgICBjb25zdCByZXMgPSBnZXRBcmVhQWJzb3JwdGlvbkNhcGFjaXR5KHVuaXQsIGFyZWEsIGFjYy5yZW1haW4sIGFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICBhY2MubGlzdC5wdXNoKHJlcyk7XHJcbiAgICAgICAgYWNjLnJlbWFpbiAgPSByZXMucGl4ZWxSZW1haW47XHJcbiAgICAgICAgcmV0dXJuIGFjYztcclxuICAgIH0sIHtyZW1haW46IHBpeGVscywgbGlzdDogW119KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eSh1bml0OiAncGVyY2VudCcgfCAncGl4ZWwnLCBhcmVhU25hcHNob3Q6IElBcmVhU25hcHNob3QsIHBpeGVsczogbnVtYmVyLCBhbGxBcmVhc1NpemVQaXhlbDogbnVtYmVyKTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgLy8gTm8gcGFpbiBubyBnYWluXHJcbiAgICBpZihwaXhlbHMgPT09IDApIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiAwLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiBhcmVhU25hcHNob3Quc2l6ZVBlcmNlbnRBdFN0YXJ0LFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBBcmVhIHN0YXJ0IGF0IHplcm8gYW5kIG5lZWQgdG8gYmUgcmVkdWNlZCwgbm90IHBvc3NpYmxlXHJcbiAgICBpZihhcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCA9PT0gMCAmJiBwaXhlbHMgPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogMCxcclxuICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogMCxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IHBpeGVscyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZih1bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgICByZXR1cm4gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBlcmNlbnQoYXJlYVNuYXBzaG90LCBwaXhlbHMsIGFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgIH1cclxuICAgIFxyXG5cdGlmKHVuaXQgPT09ICdwaXhlbCcpIHtcclxuICAgICAgICByZXR1cm4gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBpeGVsKGFyZWFTbmFwc2hvdCwgcGl4ZWxzLCBhbGxBcmVhc1NpemVQaXhlbCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEFyZWFBYnNvcnB0aW9uQ2FwYWNpdHlQZXJjZW50KGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCwgcGl4ZWxzOiBudW1iZXIsIGFsbEFyZWFzU2l6ZVBpeGVsOiBudW1iZXIpOiBJQXJlYUFic29ycHRpb25DYXBhY2l0eSB7XHJcbiAgICBjb25zdCB0ZW1wUGl4ZWxTaXplID0gYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHM7XHJcbiAgICBjb25zdCB0ZW1wUGVyY2VudFNpemUgPSB0ZW1wUGl4ZWxTaXplIC8gYWxsQXJlYXNTaXplUGl4ZWwgKiAxMDA7XHJcbiAgICBcclxuICAgIC8vIEVOTEFSR0UgQVJFQVxyXG4gICAgXHJcbiAgICBpZihwaXhlbHMgPiAwKSB7XHJcbiAgICAgICAgLy8gSWYgbWF4U2l6ZSAmIG5ld1NpemUgYmlnZ2VyIHRoYW4gaXQgPiBhYnNvcmIgdG8gbWF4IGFuZCByZXR1cm4gcmVtYWluaW5nIHBpeGVscyBcclxuICAgICAgICBpZihhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplICE9PSBudWxsICYmIHRlbXBQZXJjZW50U2l6ZSA+IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUpIHtcclxuICAgICAgICAgICAgLy8gVXNlIGFyZWEuYXJlYS5tYXhTaXplIGFzIG5ld1BlcmNlbnRTaXplIGFuZCByZXR1cm4gY2FsY3VsYXRlIHBpeGVscyByZW1haW5pbmdcclxuICAgICAgICAgICAgY29uc3QgbWF4U2l6ZVBpeGVsID0gYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZSAvIDEwMCAqIGFsbEFyZWFzU2l6ZVBpeGVsO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IG1heFNpemVQaXhlbCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHMgLSBtYXhTaXplUGl4ZWxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiB0ZW1wUGVyY2VudFNpemUgPiAxMDAgPyAxMDAgOiB0ZW1wUGVyY2VudFNpemUsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSRURVQ0UgQVJFQVxyXG4gICAgXHJcbiAgICBlbHNlIGlmKHBpeGVscyA8IDApIHtcclxuICAgICAgICAvLyBJZiBtaW5TaXplICYgbmV3U2l6ZSBzbWFsbGVyIHRoYW4gaXQgPiBhYnNvcmIgdG8gbWluIGFuZCByZXR1cm4gcmVtYWluaW5nIHBpeGVscyBcclxuICAgICAgICBpZihhcmVhU25hcHNob3QuYXJlYS5taW5TaXplICE9PSBudWxsICYmIHRlbXBQZXJjZW50U2l6ZSA8IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUpIHtcclxuICAgICAgICAgICAgLy8gVXNlIGFyZWEuYXJlYS5taW5TaXplIGFzIG5ld1BlcmNlbnRTaXplIGFuZCByZXR1cm4gY2FsY3VsYXRlIHBpeGVscyByZW1haW5pbmdcclxuICAgICAgICAgICAgY29uc3QgbWluU2l6ZVBpeGVsID0gYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSAvIDEwMCAqIGFsbEFyZWFzU2l6ZVBpeGVsO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IG1pblNpemVQaXhlbCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBwaXhlbHMgLSBtaW5TaXplUGl4ZWxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgcmVkdWNlZCB1bmRlciB6ZXJvID4gcmV0dXJuIHJlbWFpbmluZyBwaXhlbHNcclxuICAgICAgICBlbHNlIGlmKHRlbXBQZXJjZW50U2l6ZSA8IDApIHtcclxuICAgICAgICAgICAgLy8gVXNlIDAgYXMgbmV3UGVyY2VudFNpemUgYW5kIHJldHVybiBjYWxjdWxhdGUgcGl4ZWxzIHJlbWFpbmluZ1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IC1hcmVhU25hcHNob3Quc2l6ZVBpeGVsQXRTdGFydCxcclxuICAgICAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IDAsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogcGl4ZWxzICsgYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiB0ZW1wUGVyY2VudFNpemUsXHJcbiAgICAgICAgICAgIHBpeGVsUmVtYWluOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QXJlYUFic29ycHRpb25DYXBhY2l0eVBpeGVsKGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCwgcGl4ZWxzOiBudW1iZXIsIGNvbnRhaW5lclNpemVQaXhlbDogbnVtYmVyKTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkge1xyXG4gICAgY29uc3QgdGVtcFBpeGVsU2l6ZSA9IGFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0ICsgcGl4ZWxzO1xyXG4gICAgICAgICAgICBcclxuICAgIC8vIEVOTEFSR0UgQVJFQVxyXG5cclxuICAgIGlmKHBpeGVscyA+IDApIHtcclxuICAgICAgICAvLyBJZiBtYXhTaXplICYgbmV3U2l6ZSBiaWdnZXIgdGhhbiBpdCA+IGFic29yYiB0byBtYXggYW5kIHJldHVybiByZW1haW5pbmcgcGl4ZWxzIFxyXG4gICAgICAgIGlmKGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUgIT09IG51bGwgJiYgdGVtcFBpeGVsU2l6ZSA+IGFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFyZWFTbmFwc2hvdCxcclxuICAgICAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBhcmVhU25hcHNob3QuYXJlYS5tYXhTaXplIC0gYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQsXHJcbiAgICAgICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgICAgIHBpeGVsUmVtYWluOiB0ZW1wUGl4ZWxTaXplIC0gYXJlYVNuYXBzaG90LmFyZWEubWF4U2l6ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgIHBpeGVsQWJzb3JiOiBwaXhlbHMsXHJcbiAgICAgICAgICAgIHBlcmNlbnRBZnRlckFic29ycHRpb246IC0xLFxyXG4gICAgICAgICAgICBwaXhlbFJlbWFpbjogMFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUkVEVUNFIEFSRUFcclxuICAgIFxyXG4gICAgZWxzZSBpZihwaXhlbHMgPCAwKSB7XHJcbiAgICAgICAgLy8gSWYgbWluU2l6ZSAmIG5ld1NpemUgc21hbGxlciB0aGFuIGl0ID4gYWJzb3JiIHRvIG1pbiBhbmQgcmV0dXJuIHJlbWFpbmluZyBwaXhlbHMgXHJcbiAgICAgICAgaWYoYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSAhPT0gbnVsbCAmJiB0ZW1wUGl4ZWxTaXplIDwgYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICAgICAgcGl4ZWxBYnNvcmI6IGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemUgKyBwaXhlbHMgLSB0ZW1wUGl4ZWxTaXplLFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogdGVtcFBpeGVsU2l6ZSAtIGFyZWFTbmFwc2hvdC5hcmVhLm1pblNpemVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgcmVkdWNlZCB1bmRlciB6ZXJvID4gcmV0dXJuIHJlbWFpbmluZyBwaXhlbHNcclxuICAgICAgICBlbHNlIGlmKHRlbXBQaXhlbFNpemUgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhcmVhU25hcHNob3QsXHJcbiAgICAgICAgICAgICAgICBwaXhlbEFic29yYjogLWFyZWFTbmFwc2hvdC5zaXplUGl4ZWxBdFN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgcGVyY2VudEFmdGVyQWJzb3JwdGlvbjogLTEsXHJcbiAgICAgICAgICAgICAgICBwaXhlbFJlbWFpbjogcGl4ZWxzICsgYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYXJlYVNuYXBzaG90LFxyXG4gICAgICAgICAgICBwaXhlbEFic29yYjogcGl4ZWxzLFxyXG4gICAgICAgICAgICBwZXJjZW50QWZ0ZXJBYnNvcnB0aW9uOiAtMSxcclxuICAgICAgICAgICAgcGl4ZWxSZW1haW46IDBcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQXJlYVNpemUodW5pdDogJ3BlcmNlbnQnIHwgJ3BpeGVsJywgaXRlbTogSUFyZWFBYnNvcnB0aW9uQ2FwYWNpdHkpIHtcclxuICAgIFxyXG4gICAgaWYodW5pdCA9PT0gJ3BlcmNlbnQnKSB7XHJcbiAgICAgICAgaXRlbS5hcmVhU25hcHNob3QuYXJlYS5zaXplID0gaXRlbS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZih1bml0ID09PSAncGl4ZWwnKSB7XHJcbiAgICAgICAgLy8gVXBkYXRlIHNpemUgZXhjZXB0IGZvciB0aGUgd2lsZGNhcmQgc2l6ZSBhcmVhXHJcbiAgICAgICAgaWYoaXRlbS5hcmVhU25hcHNob3QuYXJlYS5zaXplICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uYXJlYVNuYXBzaG90LmFyZWEuc2l6ZSA9IGl0ZW0uYXJlYVNuYXBzaG90LnNpemVQaXhlbEF0U3RhcnQgKyBpdGVtLnBpeGVsQWJzb3JiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7XHJcbiAgICBDb21wb25lbnQsXHJcbiAgICBJbnB1dCxcclxuICAgIE91dHB1dCxcclxuICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gICAgQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICBSZW5kZXJlcjIsXHJcbiAgICBBZnRlclZpZXdJbml0LFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgRWxlbWVudFJlZixcclxuICAgIE5nWm9uZSxcclxuICAgIFZpZXdDaGlsZHJlbixcclxuICAgIFF1ZXJ5TGlzdCxcclxuICAgIEV2ZW50RW1pdHRlclxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge09ic2VydmFibGUsIFN1YnNjcmliZXIsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge2RlYm91bmNlVGltZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuaW1wb3J0IHtJQXJlYSwgSVBvaW50LCBJU3BsaXRTbmFwc2hvdCwgSUFyZWFTbmFwc2hvdCwgSU91dHB1dERhdGEsIElPdXRwdXRBcmVhU2l6ZXN9IGZyb20gJy4uL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7U3BsaXRBcmVhRGlyZWN0aXZlfSBmcm9tICcuLi9kaXJlY3RpdmUvc3BsaXRBcmVhLmRpcmVjdGl2ZSc7XHJcbmltcG9ydCB7XHJcbiAgICBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyLFxyXG4gICAgZ2V0SW5wdXRCb29sZWFuLFxyXG4gICAgaXNVc2VyU2l6ZXNWYWxpZCxcclxuICAgIGdldEFyZWFNaW5TaXplLFxyXG4gICAgZ2V0QXJlYU1heFNpemUsXHJcbiAgICBnZXRQb2ludEZyb21FdmVudCxcclxuICAgIGdldEVsZW1lbnRQaXhlbFNpemUsXHJcbiAgICBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5LFxyXG4gICAgdXBkYXRlQXJlYVNpemVcclxufSBmcm9tICcuLi91dGlscyc7XHJcblxyXG4vKipcclxuICogYW5ndWxhci1zcGxpdFxyXG4gKlxyXG4gKlxyXG4gKiAgUEVSQ0VOVCBNT0RFIChbdW5pdF09XCIncGVyY2VudCdcIilcclxuICogIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICogfCAgICAgICBBICAgICAgIFtnMV0gICAgICAgQiAgICAgICBbZzJdICAgICAgIEMgICAgICAgW2czXSAgICAgICBEICAgICAgIFtnNF0gICAgICAgRSAgICAgICB8XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxyXG4gKiB8ICAgICAgIDIwICAgICAgICAgICAgICAgICAzMCAgICAgICAgICAgICAgICAgMjAgICAgICAgICAgICAgICAgIDE1ICAgICAgICAgICAgICAgICAxNSAgICAgIHwgPC0tIFtzaXplXT1cInhcIlxyXG4gKiB8ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIHwgPC0tIFtndXR0ZXJTaXplXT1cIjEwXCJcclxuICogfGNhbGMoMjAlIC0gOHB4KSAgICBjYWxjKDMwJSAtIDEycHgpICAgY2FsYygyMCUgLSA4cHgpICAgIGNhbGMoMTUlIC0gNnB4KSAgICBjYWxjKDE1JSAtIDZweCl8IDwtLSBDU1MgZmxleC1iYXNpcyBwcm9wZXJ0eSAod2l0aCBmbGV4LWdyb3cmc2hyaW5rIGF0IDApXHJcbiAqIHwgICAgIDE1MnB4ICAgICAgICAgICAgICAyMjhweCAgICAgICAgICAgICAgMTUycHggICAgICAgICAgICAgIDExNHB4ICAgICAgICAgICAgICAxMTRweCAgICAgfCA8LS0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcclxuICogfF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgODAwcHggICAgICAgICA8LS0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcclxuICogIGZsZXgtYmFzaXMgPSBjYWxjKCB7IGFyZWEuc2l6ZSB9JSAtIHsgYXJlYS5zaXplLzEwMCAqIG5iR3V0dGVyKmd1dHRlclNpemUgfXB4ICk7XHJcbiAqXHJcbiAqXHJcbiAqICBQSVhFTCBNT0RFIChbdW5pdF09XCIncGl4ZWwnXCIpXHJcbiAqICBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXHJcbiAqIHwgICAgICAgQSAgICAgICBbZzFdICAgICAgIEIgICAgICAgW2cyXSAgICAgICBDICAgICAgIFtnM10gICAgICAgRCAgICAgICBbZzRdICAgICAgIEUgICAgICAgfFxyXG4gKiB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcclxuICogfCAgICAgIDEwMCAgICAgICAgICAgICAgICAyNTAgICAgICAgICAgICAgICAgICogICAgICAgICAgICAgICAgIDE1MCAgICAgICAgICAgICAgICAxMDAgICAgICB8IDwtLSBbc2l6ZV09XCJ5XCJcclxuICogfCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICB8IDwtLSBbZ3V0dGVyU2l6ZV09XCIxMFwiXHJcbiAqIHwgICAwIDAgMTAwcHggICAgICAgICAgMCAwIDI1MHB4ICAgICAgICAgICAxIDEgYXV0byAgICAgICAgICAwIDAgMTUwcHggICAgICAgICAgMCAwIDEwMHB4ICAgfCA8LS0gQ1NTIGZsZXggcHJvcGVydHkgKGZsZXgtZ3Jvdy9mbGV4LXNocmluay9mbGV4LWJhc2lzKVxyXG4gKiB8ICAgICAxMDBweCAgICAgICAgICAgICAgMjUwcHggICAgICAgICAgICAgIDIwMHB4ICAgICAgICAgICAgICAxNTBweCAgICAgICAgICAgICAgMTAwcHggICAgIHwgPC0tIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXHJcbiAqIHxfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19ffFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDgwMHB4ICAgICAgICAgPC0tIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXHJcbiAqXHJcbiAqL1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ2FzLXNwbGl0JyxcclxuICAgIGV4cG9ydEFzOiAnYXNTcGxpdCcsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIHN0eWxlVXJsczogW2AuL3NwbGl0LmNvbXBvbmVudC5zY3NzYF0sXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cclxuICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgW25nRm9yT2ZdPVwiZGlzcGxheWVkQXJlYXNcIiBsZXQtaW5kZXg9XCJpbmRleFwiIGxldC1sYXN0PVwibGFzdFwiPlxyXG4gICAgICAgICAgICA8ZGl2ICpuZ0lmPVwibGFzdCA9PT0gZmFsc2VcIlxyXG4gICAgICAgICAgICAgICAgICNndXR0ZXJFbHNcclxuICAgICAgICAgICAgICAgICBjbGFzcz1cImFzLXNwbGl0LWd1dHRlclwiXHJcbiAgICAgICAgICAgICAgICAgW3N0eWxlLmZsZXgtYmFzaXMucHhdPVwiZ3V0dGVyU2l6ZVwiXHJcbiAgICAgICAgICAgICAgICAgW3N0eWxlLm9yZGVyXT1cImluZGV4KjIrMVwiXHJcbiAgICAgICAgICAgICAgICAgKG1vdXNlZG93bik9XCJzdGFydERyYWdnaW5nKCRldmVudCwgaW5kZXgqMisxLCBpbmRleCsxKVwiXHJcbiAgICAgICAgICAgICAgICAgKHRvdWNoc3RhcnQpPVwic3RhcnREcmFnZ2luZygkZXZlbnQsIGluZGV4KjIrMSwgaW5kZXgrMSlcIlxyXG4gICAgICAgICAgICAgICAgIChtb3VzZXVwKT1cImNsaWNrR3V0dGVyKCRldmVudCwgaW5kZXgrMSlcIlxyXG4gICAgICAgICAgICAgICAgICh0b3VjaGVuZCk9XCJjbGlja0d1dHRlcigkZXZlbnQsIGluZGV4KzEpXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYXMtc3BsaXQtZ3V0dGVyLWljb25cIj48L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5gLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgU3BsaXRDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICAgIHByaXZhdGUgX2RpcmVjdGlvbjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyA9ICdob3Jpem9udGFsJztcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgZGlyZWN0aW9uKHY6ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcpIHtcclxuICAgICAgICB0aGlzLl9kaXJlY3Rpb24gPSAodiA9PT0gJ3ZlcnRpY2FsJykgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgYGFzLSR7dGhpcy5fZGlyZWN0aW9ufWApO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBgYXMtJHsodGhpcy5fZGlyZWN0aW9uID09PSAndmVydGljYWwnKSA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCd9YCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQoZmFsc2UsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGlyZWN0aW9uKCk6ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXJlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzSG9yaXpvbnRhbERpcmVjdGlvbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX3VuaXQ6ICdwZXJjZW50JyB8ICdwaXhlbCcgPSAncGVyY2VudCc7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IHVuaXQodjogJ3BlcmNlbnQnIHwgJ3BpeGVsJykge1xyXG4gICAgICAgIHRoaXMuX3VuaXQgPSAodiA9PT0gJ3BpeGVsJykgPyAncGl4ZWwnIDogJ3BlcmNlbnQnO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgYGFzLSR7dGhpcy5fdW5pdH1gKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgYGFzLSR7KHRoaXMuX3VuaXQgPT09ICdwaXhlbCcpID8gJ3BlcmNlbnQnIDogJ3BpeGVsJ31gKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZChmYWxzZSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHVuaXQoKTogJ3BlcmNlbnQnIHwgJ3BpeGVsJyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX2d1dHRlclNpemU6IG51bWJlciA9IDExO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBndXR0ZXJTaXplKHY6IG51bWJlciB8IG51bGwpIHtcclxuICAgICAgICB0aGlzLl9ndXR0ZXJTaXplID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCAxMSk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQoZmFsc2UsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZ3V0dGVyU2l6ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ndXR0ZXJTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9ndXR0ZXJTdGVwOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBndXR0ZXJTdGVwKHY6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2d1dHRlclN0ZXAgPSBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyKHYsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBndXR0ZXJTdGVwKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2d1dHRlclN0ZXA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX3Jlc3RyaWN0TW92ZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCByZXN0cmljdE1vdmUodjogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3Jlc3RyaWN0TW92ZSA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcmVzdHJpY3RNb3ZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9yZXN0cmljdE1vdmU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX3VzZVRyYW5zaXRpb246IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgdXNlVHJhbnNpdGlvbih2OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fdXNlVHJhbnNpdGlvbiA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3VzZVRyYW5zaXRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy10cmFuc2l0aW9uJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy10cmFuc2l0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCB1c2VUcmFuc2l0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91c2VUcmFuc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBkaXNhYmxlZCh2OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSBnZXRJbnB1dEJvb2xlYW4odik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWRpc2FibGVkJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1kaXNhYmxlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9kaXI6ICdsdHInIHwgJ3J0bCcgPSAnbHRyJztcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgZGlyKHY6ICdsdHInIHwgJ3J0bCcpIHtcclxuICAgICAgICB0aGlzLl9kaXIgPSAodiA9PT0gJ3J0bCcpID8gJ3J0bCcgOiAnbHRyJztcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnZGlyJywgdGhpcy5fZGlyKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGlyKCk6ICdsdHInIHwgJ3J0bCcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX2d1dHRlckRibENsaWNrRHVyYXRpb246IG51bWJlciA9IDA7XHJcblxyXG4gICAgQElucHV0KCkgc2V0IGd1dHRlckRibENsaWNrRHVyYXRpb24odjogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fZ3V0dGVyRGJsQ2xpY2tEdXJhdGlvbiA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGd1dHRlckRibENsaWNrRHVyYXRpb24oKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZ3V0dGVyRGJsQ2xpY2tEdXJhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vXHJcblxyXG4gICAgQE91dHB1dCgpIGRyYWdTdGFydCA9IG5ldyBFdmVudEVtaXR0ZXI8SU91dHB1dERhdGE+KGZhbHNlKTtcclxuICAgIEBPdXRwdXQoKSBkcmFnRW5kID0gbmV3IEV2ZW50RW1pdHRlcjxJT3V0cHV0RGF0YT4oZmFsc2UpO1xyXG4gICAgQE91dHB1dCgpIGd1dHRlckNsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxJT3V0cHV0RGF0YT4oZmFsc2UpO1xyXG4gICAgQE91dHB1dCgpIGd1dHRlckRibENsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxJT3V0cHV0RGF0YT4oZmFsc2UpO1xyXG5cclxuICAgIHByaXZhdGUgdHJhbnNpdGlvbkVuZFN1YnNjcmliZXI6IFN1YnNjcmliZXI8SU91dHB1dEFyZWFTaXplcz47XHJcblxyXG4gICAgQE91dHB1dCgpIGdldCB0cmFuc2l0aW9uRW5kKCk6IE9ic2VydmFibGU8SU91dHB1dEFyZWFTaXplcz4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZShzdWJzY3JpYmVyID0+IHRoaXMudHJhbnNpdGlvbkVuZFN1YnNjcmliZXIgPSBzdWJzY3JpYmVyKS5waXBlKFxyXG4gICAgICAgICAgICBkZWJvdW5jZVRpbWU8SU91dHB1dEFyZWFTaXplcz4oMjApXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRyYWdQcm9ncmVzc1N1YmplY3Q6IFN1YmplY3Q8SU91dHB1dERhdGE+ID0gbmV3IFN1YmplY3QoKTtcclxuICAgIGRyYWdQcm9ncmVzcyQ6IE9ic2VydmFibGU8SU91dHB1dERhdGE+ID0gdGhpcy5kcmFnUHJvZ3Jlc3NTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIGlzRHJhZ2dpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgZHJhZ0xpc3RlbmVyczogQXJyYXk8RnVuY3Rpb24+ID0gW107XHJcbiAgICBwcml2YXRlIHNuYXBzaG90OiBJU3BsaXRTbmFwc2hvdCB8IG51bGwgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBzdGFydFBvaW50OiBJUG9pbnQgfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgZW5kUG9pbnQ6IElQb2ludCB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIHB1YmxpYyByZWFkb25seSBkaXNwbGF5ZWRBcmVhczogQXJyYXk8SUFyZWE+ID0gW107XHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGhpZGVkQXJlYXM6IEFycmF5PElBcmVhPiA9IFtdO1xyXG5cclxuICAgIEBWaWV3Q2hpbGRyZW4oJ2d1dHRlckVscycpIHByaXZhdGUgZ3V0dGVyRWxzOiBRdWVyeUxpc3Q8RWxlbWVudFJlZj47XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgZWxSZWY6IEVsZW1lbnRSZWYsXHJcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMikge1xyXG4gICAgICAgIC8vIFRvIGZvcmNlIGFkZGluZyBkZWZhdWx0IGNsYXNzLCBjb3VsZCBiZSBvdmVycmlkZSBieSB1c2VyIEBJbnB1dCgpIG9yIG5vdFxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gdGhpcy5fZGlyZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUbyBhdm9pZCB0cmFuc2l0aW9uIGF0IGZpcnN0IHJlbmRlcmluZ1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtaW5pdCcpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldE5iR3V0dGVycygpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPT09IDApID8gMCA6IHRoaXMuZGlzcGxheWVkQXJlYXMubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkQXJlYShjb21wb25lbnQ6IFNwbGl0QXJlYURpcmVjdGl2ZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IG5ld0FyZWE6IElBcmVhID0ge1xyXG4gICAgICAgICAgICBjb21wb25lbnQsXHJcbiAgICAgICAgICAgIG9yZGVyOiAwLFxyXG4gICAgICAgICAgICBzaXplOiAwLFxyXG4gICAgICAgICAgICBtaW5TaXplOiBudWxsLFxyXG4gICAgICAgICAgICBtYXhTaXplOiBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChjb21wb25lbnQudmlzaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLnB1c2gobmV3QXJlYSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1aWxkKHRydWUsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZWRBcmVhcy5wdXNoKG5ld0FyZWEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVtb3ZlQXJlYShjb21wb25lbnQ6IFNwbGl0QXJlYURpcmVjdGl2ZSk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc3BsYXllZEFyZWFzLnNvbWUoYSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KSkge1xyXG4gICAgICAgICAgICBjb25zdCBhcmVhID0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5maW5kKGEgPT4gYS5jb21wb25lbnQgPT09IGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuc3BsaWNlKHRoaXMuZGlzcGxheWVkQXJlYXMuaW5kZXhPZihhcmVhKSwgMSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1aWxkKHRydWUsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oaWRlZEFyZWFzLnNvbWUoYSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KSkge1xyXG4gICAgICAgICAgICBjb25zdCBhcmVhID0gdGhpcy5oaWRlZEFyZWFzLmZpbmQoYSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KTtcclxuICAgICAgICAgICAgdGhpcy5oaWRlZEFyZWFzLnNwbGljZSh0aGlzLmhpZGVkQXJlYXMuaW5kZXhPZihhcmVhKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1cGRhdGVBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlLCByZXNldE9yZGVyczogYm9vbGVhbiwgcmVzZXRTaXplczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmIChjb21wb25lbnQudmlzaWJsZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1aWxkKHJlc2V0T3JkZXJzLCByZXNldFNpemVzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3dBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXJlYSA9IHRoaXMuaGlkZWRBcmVhcy5maW5kKGEgPT4gYS5jb21wb25lbnQgPT09IGNvbXBvbmVudCk7XHJcbiAgICAgICAgaWYgKGFyZWEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhcmVhcyA9IHRoaXMuaGlkZWRBcmVhcy5zcGxpY2UodGhpcy5oaWRlZEFyZWFzLmluZGV4T2YoYXJlYSksIDEpO1xyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMucHVzaCguLi5hcmVhcyk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQodHJ1ZSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpZGVBcmVhKGNvbXA6IFNwbGl0QXJlYURpcmVjdGl2ZSk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGFyZWEgPSB0aGlzLmRpc3BsYXllZEFyZWFzLmZpbmQoYSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcCk7XHJcbiAgICAgICAgaWYgKGFyZWEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhcmVhcyA9IHRoaXMuZGlzcGxheWVkQXJlYXMuc3BsaWNlKHRoaXMuZGlzcGxheWVkQXJlYXMuaW5kZXhPZihhcmVhKSwgMSk7XHJcbiAgICAgICAgYXJlYXMuZm9yRWFjaChhcmVhID0+IHtcclxuICAgICAgICAgICAgYXJlYS5vcmRlciA9IDA7XHJcbiAgICAgICAgICAgIGFyZWEuc2l6ZSA9IDA7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5oaWRlZEFyZWFzLnB1c2goLi4uYXJlYXMpO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkKHRydWUsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRWaXNpYmxlQXJlYVNpemVzKCk6IElPdXRwdXRBcmVhU2l6ZXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXllZEFyZWFzLm1hcChhID0+IGEuc2l6ZSA9PT0gbnVsbCA/ICcqJyA6IGEuc2l6ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldFZpc2libGVBcmVhU2l6ZXMoc2l6ZXM6IElPdXRwdXRBcmVhU2l6ZXMpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoc2l6ZXMubGVuZ3RoICE9PSB0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmb3JtYXRlZFNpemVzID0gc2l6ZXMubWFwKHMgPT4gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcihzLCBudWxsKSk7XHJcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IGlzVXNlclNpemVzVmFsaWQodGhpcy51bml0LCBmb3JtYXRlZFNpemVzKTtcclxuXHJcbiAgICAgICAgaWYgKGlzVmFsaWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goKGFyZWEsIGkpID0+IGFyZWEuY29tcG9uZW50Ll9zaXplID0gZm9ybWF0ZWRTaXplc1tpXSk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGQoZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnVpbGQocmVzZXRPcmRlcnM6IGJvb2xlYW4sIHJlc2V0U2l6ZXM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnN0b3BEcmFnZ2luZygpO1xyXG5cclxuICAgICAgICAvLyDDgsKkIEFSRUFTIE9SREVSXHJcblxyXG4gICAgICAgIGlmIChyZXNldE9yZGVycyA9PT0gdHJ1ZSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdXNlciBwcm92aWRlZCAnb3JkZXInIGZvciBlYWNoIGFyZWEsIHVzZSBpdCB0byBzb3J0IHRoZW0uXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXllZEFyZWFzLmV2ZXJ5KGEgPT4gYS5jb21wb25lbnQub3JkZXIgIT09IG51bGwpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLnNvcnQoKGEsIGIpID0+ICg8bnVtYmVyPmEuY29tcG9uZW50Lm9yZGVyKSAtICg8bnVtYmVyPmIuY29tcG9uZW50Lm9yZGVyKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRoZW4gc2V0IHJlYWwgb3JkZXIgd2l0aCBtdWx0aXBsZXMgb2YgMiwgbnVtYmVycyBiZXR3ZWVuIHdpbGwgYmUgdXNlZCBieSBndXR0ZXJzLlxyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goKGFyZWEsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGFyZWEub3JkZXIgPSBpICogMjtcclxuICAgICAgICAgICAgICAgIGFyZWEuY29tcG9uZW50LnNldFN0eWxlT3JkZXIoYXJlYS5vcmRlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gw4LCpCBBUkVBUyBTSVpFXHJcblxyXG4gICAgICAgIGlmIChyZXNldFNpemVzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVzZVVzZXJTaXplcyA9IGlzVXNlclNpemVzVmFsaWQodGhpcy51bml0LCB0aGlzLmRpc3BsYXllZEFyZWFzLm1hcChhID0+IGEuY29tcG9uZW50LnNpemUpKTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bml0KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwZXJjZW50Jzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRTaXplID0gMTAwIC8gdGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaChhcmVhID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5zaXplID0gdXNlVXNlclNpemVzID8gPG51bWJlcj5hcmVhLmNvbXBvbmVudC5zaXplIDogZGVmYXVsdFNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IGdldEFyZWFNaW5TaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBnZXRBcmVhTWF4U2l6ZShhcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BpeGVsJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VVc2VyU2l6ZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKGFyZWEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5zaXplID0gYXJlYS5jb21wb25lbnQuc2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IGdldEFyZWFNaW5TaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5tYXhTaXplID0gZ2V0QXJlYU1heFNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHdpbGRjYXJkU2l6ZUFyZWFzID0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5maWx0ZXIoYSA9PiBhLmNvbXBvbmVudC5zaXplID09PSBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIHdpbGRjYXJkIGFyZWEgPiBOZWVkIHRvIHNlbGVjdCBvbmUgYXJiaXRyYXJpbHkgPiBmaXJzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2lsZGNhcmRTaXplQXJlYXMubGVuZ3RoID09PSAwICYmIHRoaXMuZGlzcGxheWVkQXJlYXMubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEuc2l6ZSA9IChpID09PSAwKSA/IG51bGwgOiBhcmVhLmNvbXBvbmVudC5zaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IChpID09PSAwKSA/IG51bGwgOiBnZXRBcmVhTWluU2l6ZShhcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSAoaSA9PT0gMCkgPyBudWxsIDogZ2V0QXJlYU1heFNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNb3JlIHRoYW4gb25lIHdpbGRjYXJkIGFyZWEgPiBOZWVkIHRvIGtlZXAgb25seSBvbmUgYXJiaXRyYXJseSA+IGZpcnN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHdpbGRjYXJkU2l6ZUFyZWFzLmxlbmd0aCA+IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYWxyZWFkeUdvdE9uZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKGFyZWEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcmVhLmNvbXBvbmVudC5zaXplID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5R290T25lID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5zaXplID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxyZWFkeUdvdE9uZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1pblNpemUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5tYXhTaXplID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEuc2l6ZSA9IGFyZWEuY29tcG9uZW50LnNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IGdldEFyZWFNaW5TaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBnZXRBcmVhTWF4U2l6ZShhcmVhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZWZyZXNoU3R5bGVTaXplcygpO1xyXG4gICAgICAgIHRoaXMuY2RSZWYubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU3R5bGVTaXplcygpOiB2b2lkIHtcclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gUEVSQ0VOVCBNT0RFXHJcbiAgICAgICAgaWYgKHRoaXMudW5pdCA9PT0gJ3BlcmNlbnQnKSB7XHJcbiAgICAgICAgICAgIC8vIE9ubHkgb25lIGFyZWEgPiBmbGV4LWJhc2lzIDEwMCVcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGxheWVkQXJlYXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzWzBdLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoMCwgMCwgYDEwMCVgLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIE11bHRpcGxlIGFyZWFzID4gdXNlIGVhY2ggcGVyY2VudCBiYXNpc1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN1bUd1dHRlclNpemUgPSB0aGlzLmdldE5iR3V0dGVycygpICogdGhpcy5ndXR0ZXJTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaChhcmVhID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsIDAsIGBjYWxjKCAke2FyZWEuc2l6ZX0lIC0gJHs8bnVtYmVyPmFyZWEuc2l6ZSAvIDEwMCAqIHN1bUd1dHRlclNpemV9cHggKWAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChhcmVhLm1pblNpemUgIT09IG51bGwgJiYgYXJlYS5taW5TaXplID09PSBhcmVhLnNpemUpID8gdHJ1ZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoYXJlYS5tYXhTaXplICE9PSBudWxsICYmIGFyZWEubWF4U2l6ZSA9PT0gYXJlYS5zaXplKSA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIFBJWEVMIE1PREVcclxuICAgICAgICBlbHNlIGlmICh0aGlzLnVuaXQgPT09ICdwaXhlbCcpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKGFyZWEgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gQXJlYSB3aXRoIHdpbGRjYXJkIHNpemVcclxuICAgICAgICAgICAgICAgIGlmIChhcmVhLnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5jb21wb25lbnQuc2V0U3R5bGVGbGV4KDEsIDEsIGAxMDAlYCwgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoMSwgMSwgYGF1dG9gLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEFyZWEgd2l0aCBwaXhlbCBzaXplXHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IG9uZSBhcmVhID4gZmxleC1iYXNpcyAxMDAlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlzcGxheWVkQXJlYXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEuY29tcG9uZW50LnNldFN0eWxlRmxleCgwLCAwLCBgMTAwJWAsIGZhbHNlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIE11bHRpcGxlIGFyZWFzID4gdXNlIGVhY2ggcGl4ZWwgYmFzaXNcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYS5jb21wb25lbnQuc2V0U3R5bGVGbGV4KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgMCwgYCR7YXJlYS5zaXplfXB4YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChhcmVhLm1pblNpemUgIT09IG51bGwgJiYgYXJlYS5taW5TaXplID09PSBhcmVhLnNpemUpID8gdHJ1ZSA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGFyZWEubWF4U2l6ZSAhPT0gbnVsbCAmJiBhcmVhLm1heFNpemUgPT09IGFyZWEuc2l6ZSkgPyB0cnVlIDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2NsaWNrVGltZW91dDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHVibGljIGNsaWNrR3V0dGVyKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCwgZ3V0dGVyTnVtOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0ZW1wUG9pbnQgPSBnZXRQb2ludEZyb21FdmVudChldmVudCk7XHJcblxyXG4gICAgICAgIC8vIEJlIHN1cmUgbW91c2V1cC90b3VjaGVuZCBoYXBwZW5lZCBhdCBzYW1lIHBvaW50IGFzIG1vdXNlZG93bi90b3VjaHN0YXJ0IHRvIHRyaWdnZXIgY2xpY2svZGJsY2xpY2tcclxuICAgICAgICBpZiAodGhpcy5zdGFydFBvaW50ICYmIHRoaXMuc3RhcnRQb2ludC54ID09PSB0ZW1wUG9pbnQueCAmJiB0aGlzLnN0YXJ0UG9pbnQueSA9PT0gdGVtcFBvaW50LnkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRpbWVvdXQgaW4gcHJvZ3Jlc3MgYW5kIG5ldyBjbGljayA+IGNsZWFyVGltZW91dCAmIGRibENsaWNrRXZlbnRcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2NsaWNrVGltZW91dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9jbGlja1RpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpY2tUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCdkYmxjbGljaycsIGd1dHRlck51bSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEVsc2Ugc3RhcnQgdGltZW91dCB0byBjYWxsIGNsaWNrRXZlbnQgYXQgZW5kXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpY2tUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NsaWNrVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ2NsaWNrJywgZ3V0dGVyTnVtKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BEcmFnZ2luZygpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5ndXR0ZXJEYmxDbGlja0R1cmF0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhcnREcmFnZ2luZyhldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQsIGd1dHRlck9yZGVyOiBudW1iZXIsIGd1dHRlck51bTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFydFBvaW50ID0gZ2V0UG9pbnRGcm9tRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXJ0UG9pbnQgPT09IG51bGwgfHwgdGhpcy5kaXNhYmxlZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNuYXBzaG90ID0ge1xyXG4gICAgICAgICAgICBndXR0ZXJOdW0sXHJcbiAgICAgICAgICAgIGxhc3RTdGVwcGVkT2Zmc2V0OiAwLFxyXG4gICAgICAgICAgICBhbGxBcmVhc1NpemVQaXhlbDogZ2V0RWxlbWVudFBpeGVsU2l6ZSh0aGlzLmVsUmVmLCB0aGlzLmRpcmVjdGlvbikgLSB0aGlzLmdldE5iR3V0dGVycygpICogdGhpcy5ndXR0ZXJTaXplLFxyXG4gICAgICAgICAgICBhbGxJbnZvbHZlZEFyZWFzU2l6ZVBlcmNlbnQ6IDEwMCxcclxuICAgICAgICAgICAgYXJlYXNCZWZvcmVHdXR0ZXI6IFtdLFxyXG4gICAgICAgICAgICBhcmVhc0FmdGVyR3V0dGVyOiBbXSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goYXJlYSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCA9IHtcclxuICAgICAgICAgICAgICAgIGFyZWEsXHJcbiAgICAgICAgICAgICAgICBzaXplUGl4ZWxBdFN0YXJ0OiBnZXRFbGVtZW50UGl4ZWxTaXplKGFyZWEuY29tcG9uZW50LmVsUmVmLCB0aGlzLmRpcmVjdGlvbiksXHJcbiAgICAgICAgICAgICAgICBzaXplUGVyY2VudEF0U3RhcnQ6ICh0aGlzLnVuaXQgPT09ICdwZXJjZW50JykgPyBhcmVhLnNpemUgOiAtMSAvLyBJZiBwaXhlbCBtb2RlLCBhbnl3YXksIHdpbGwgbm90IGJlIHVzZWQuXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJlYS5vcmRlciA8IGd1dHRlck9yZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXN0cmljdE1vdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQmVmb3JlR3V0dGVyID0gW2FyZWFTbmFwc2hvdF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIudW5zaGlmdChhcmVhU25hcHNob3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZWEub3JkZXIgPiBndXR0ZXJPcmRlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVzdHJpY3RNb3ZlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFwc2hvdC5hcmVhc0FmdGVyR3V0dGVyID0gW2FyZWFTbmFwc2hvdF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIucHVzaChhcmVhU25hcHNob3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc25hcHNob3QuYWxsSW52b2x2ZWRBcmVhc1NpemVQZXJjZW50ID0gWy4uLnRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIsIC4uLnRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlcl0ucmVkdWNlKCh0LCBhKSA9PiB0ICsgYS5zaXplUGVyY2VudEF0U3RhcnQsIDApO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlci5sZW5ndGggPT09IDAgfHwgdGhpcy5zbmFwc2hvdC5hcmVhc0FmdGVyR3V0dGVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0xpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyZXIubGlzdGVuKCdkb2N1bWVudCcsICdtb3VzZXVwJywgdGhpcy5zdG9wRHJhZ2dpbmcuYmluZCh0aGlzKSkpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdMaXN0ZW5lcnMucHVzaCh0aGlzLnJlbmRlcmVyLmxpc3RlbignZG9jdW1lbnQnLCAndG91Y2hlbmQnLCB0aGlzLnN0b3BEcmFnZ2luZy5iaW5kKHRoaXMpKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0xpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyZXIubGlzdGVuKCdkb2N1bWVudCcsICd0b3VjaGNhbmNlbCcsIHRoaXMuc3RvcERyYWdnaW5nLmJpbmQodGhpcykpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0xpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyZXIubGlzdGVuKCdkb2N1bWVudCcsICdtb3VzZW1vdmUnLCB0aGlzLmRyYWdFdmVudC5iaW5kKHRoaXMpKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ0xpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyZXIubGlzdGVuKCdkb2N1bWVudCcsICd0b3VjaG1vdmUnLCB0aGlzLmRyYWdFdmVudC5iaW5kKHRoaXMpKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaChhcmVhID0+IGFyZWEuY29tcG9uZW50LmxvY2tFdmVudHMoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1kcmFnZ2luZycpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5ndXR0ZXJFbHMudG9BcnJheSgpW3RoaXMuc25hcHNob3QuZ3V0dGVyTnVtIC0gMV0ubmF0aXZlRWxlbWVudCwgJ2FzLWRyYWdnZWQnKTtcclxuXHJcbiAgICAgICAgdGhpcy5ub3RpZnkoJ3N0YXJ0JywgdGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhZ0V2ZW50KGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jbGlja1RpbWVvdXQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9jbGlja1RpbWVvdXQpO1xyXG4gICAgICAgICAgICB0aGlzLl9jbGlja1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNEcmFnZ2luZyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbmRQb2ludCA9IGdldFBvaW50RnJvbUV2ZW50KGV2ZW50KTtcclxuICAgICAgICBpZiAodGhpcy5lbmRQb2ludCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgc3RlcHBlZE9mZnNldFxyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0ID0gKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpID8gKHRoaXMuc3RhcnRQb2ludC54IC0gdGhpcy5lbmRQb2ludC54KSA6ICh0aGlzLnN0YXJ0UG9pbnQueSAtIHRoaXMuZW5kUG9pbnQueSk7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlyID09PSAncnRsJykge1xyXG4gICAgICAgICAgICBvZmZzZXQgPSAtb2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzdGVwcGVkT2Zmc2V0ID0gTWF0aC5yb3VuZChvZmZzZXQgLyB0aGlzLmd1dHRlclN0ZXApICogdGhpcy5ndXR0ZXJTdGVwO1xyXG5cclxuICAgICAgICBpZiAoc3RlcHBlZE9mZnNldCA9PT0gdGhpcy5zbmFwc2hvdC5sYXN0U3RlcHBlZE9mZnNldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNuYXBzaG90Lmxhc3RTdGVwcGVkT2Zmc2V0ID0gc3RlcHBlZE9mZnNldDtcclxuXHJcbiAgICAgICAgLy8gTmVlZCB0byBrbm93IGlmIGVhY2ggZ3V0dGVyIHNpZGUgYXJlYXMgY291bGQgcmVhY3RzIHRvIHN0ZXBwZWRPZmZzZXRcclxuXHJcbiAgICAgICAgbGV0IGFyZWFzQmVmb3JlID0gZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eSh0aGlzLnVuaXQsIHRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIsIC1zdGVwcGVkT2Zmc2V0LCB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICBsZXQgYXJlYXNBZnRlciA9IGdldEd1dHRlclNpZGVBYnNvcnB0aW9uQ2FwYWNpdHkodGhpcy51bml0LCB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIsIHN0ZXBwZWRPZmZzZXQsIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwpO1xyXG5cclxuICAgICAgICAvLyBFYWNoIGd1dHRlciBzaWRlIGFyZWFzIGNhbid0IGFic29yYiBhbGwgb2Zmc2V0IFxyXG4gICAgICAgIGlmIChhcmVhc0JlZm9yZS5yZW1haW4gIT09IDAgJiYgYXJlYXNBZnRlci5yZW1haW4gIT09IDApIHtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGFyZWFzQmVmb3JlLnJlbWFpbikgPT09IE1hdGguYWJzKGFyZWFzQWZ0ZXIucmVtYWluKSkge1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKE1hdGguYWJzKGFyZWFzQmVmb3JlLnJlbWFpbikgPiBNYXRoLmFicyhhcmVhc0FmdGVyLnJlbWFpbikpIHtcclxuICAgICAgICAgICAgICAgIGFyZWFzQWZ0ZXIgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KHRoaXMudW5pdCwgdGhpcy5zbmFwc2hvdC5hcmVhc0FmdGVyR3V0dGVyLCBzdGVwcGVkT2Zmc2V0ICsgYXJlYXNCZWZvcmUucmVtYWluLCB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFyZWFzQmVmb3JlID0gZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eSh0aGlzLnVuaXQsIHRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIsIC0oc3RlcHBlZE9mZnNldCAtIGFyZWFzQWZ0ZXIucmVtYWluKSwgdGhpcy5zbmFwc2hvdC5hbGxBcmVhc1NpemVQaXhlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQXJlYXMgYmVmb3JlIGd1dHRlciBjYW4ndCBhYnNvcmJzIGFsbCBvZmZzZXQgPiBuZWVkIHRvIHJlY2FsY3VsYXRlIHNpemVzIGZvciBhcmVhcyBhZnRlciBndXR0ZXIuXHJcbiAgICAgICAgZWxzZSBpZiAoYXJlYXNCZWZvcmUucmVtYWluICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGFyZWFzQWZ0ZXIgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KHRoaXMudW5pdCwgdGhpcy5zbmFwc2hvdC5hcmVhc0FmdGVyR3V0dGVyLCBzdGVwcGVkT2Zmc2V0ICsgYXJlYXNCZWZvcmUucmVtYWluLCB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQXJlYXMgYWZ0ZXIgZ3V0dGVyIGNhbid0IGFic29yYnMgYWxsIG9mZnNldCA+IG5lZWQgdG8gcmVjYWxjdWxhdGUgc2l6ZXMgZm9yIGFyZWFzIGJlZm9yZSBndXR0ZXIuXHJcbiAgICAgICAgZWxzZSBpZiAoYXJlYXNBZnRlci5yZW1haW4gIT09IDApIHtcclxuICAgICAgICAgICAgYXJlYXNCZWZvcmUgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KHRoaXMudW5pdCwgdGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlciwgLShzdGVwcGVkT2Zmc2V0IC0gYXJlYXNBZnRlci5yZW1haW4pLCB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnVuaXQgPT09ICdwZXJjZW50Jykge1xyXG4gICAgICAgICAgICAvLyBIYWNrIGJlY2F1c2Ugb2YgYnJvd3NlciBtZXNzaW5nIHVwIHdpdGggc2l6ZXMgdXNpbmcgY2FsYyhYJSAtIFlweCkgLT4gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICAgICAgICAgLy8gSWYgbm90IHRoZXJlLCBwbGF5aW5nIHdpdGggZ3V0dGVycyBtYWtlcyB0b3RhbCBnb2luZyBkb3duIHRvIDk5Ljk5ODc1JSB0aGVuIDk5Ljk5Mjg2JSwgOTkuOTg5ODYlLC4uXHJcbiAgICAgICAgICAgIGNvbnN0IGFsbCA9IFsuLi5hcmVhc0JlZm9yZS5saXN0LCAuLi5hcmVhc0FmdGVyLmxpc3RdO1xyXG4gICAgICAgICAgICBjb25zdCBhcmVhVG9SZXNldCA9IGFsbC5maW5kKGEgPT4gYS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uICE9PSAwICYmIGEucGVyY2VudEFmdGVyQWJzb3JwdGlvbiAhPT0gYS5hcmVhU25hcHNob3QuYXJlYS5taW5TaXplICYmIGEucGVyY2VudEFmdGVyQWJzb3JwdGlvbiAhPT0gYS5hcmVhU25hcHNob3QuYXJlYS5tYXhTaXplKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhcmVhVG9SZXNldCkge1xyXG4gICAgICAgICAgICAgICAgYXJlYVRvUmVzZXQucGVyY2VudEFmdGVyQWJzb3JwdGlvbiA9IHRoaXMuc25hcHNob3QuYWxsSW52b2x2ZWRBcmVhc1NpemVQZXJjZW50IC0gYWxsLmZpbHRlcihhID0+IGEgIT09IGFyZWFUb1Jlc2V0KS5yZWR1Y2UoKHRvdGFsLCBhKSA9PiB0b3RhbCArIGEucGVyY2VudEFmdGVyQWJzb3JwdGlvbiwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vdyB3ZSBrbm93IGFyZWFzIGNvdWxkIGFic29yYiBzdGVwcGVkT2Zmc2V0LCB0aW1lIHRvIHJlYWxseSB1cGRhdGUgc2l6ZXNcclxuXHJcbiAgICAgICAgYXJlYXNCZWZvcmUubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdXBkYXRlQXJlYVNpemUodGhpcy51bml0LCBpdGVtKSk7XHJcbiAgICAgICAgYXJlYXNBZnRlci5saXN0LmZvckVhY2goaXRlbSA9PiB1cGRhdGVBcmVhU2l6ZSh0aGlzLnVuaXQsIGl0ZW0pKTtcclxuXHJcbiAgICAgICAgY29uc3QgYXJlYXNSZXNpemVkID0gYXJlYXNCZWZvcmUucmVtYWluID09PSAwICYmIGFyZWFzQWZ0ZXIucmVtYWluID09PSAwO1xyXG5cclxuICAgICAgICBpZiAoYXJlYXNSZXNpemVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21vdmVHdXR0ZXIodGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0gLSAxLCBzdGVwcGVkT2Zmc2V0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHRoaXMucmVmcmVzaFN0eWxlU2l6ZXMoKTtcclxuICAgICAgICB0aGlzLm5vdGlmeSgncHJvZ3Jlc3MnLCB0aGlzLnNuYXBzaG90Lmd1dHRlck51bSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdG9wRHJhZ2dpbmcoZXZlbnQ/OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVmcmVzaFN0eWxlU2l6ZXMoKTtcclxuICAgICAgICB0aGlzLl9yZXNldEd1dHRlck9mZnNldCh0aGlzLnNuYXBzaG90Lmd1dHRlck51bSAtIDEpO1xyXG5cclxuICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goYXJlYSA9PiBhcmVhLmNvbXBvbmVudC51bmxvY2tFdmVudHMoKSk7XHJcblxyXG4gICAgICAgIHdoaWxlICh0aGlzLmRyYWdMaXN0ZW5lcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBmY3QgPSB0aGlzLmRyYWdMaXN0ZW5lcnMucG9wKCk7XHJcbiAgICAgICAgICAgIGlmIChmY3QpIHtcclxuICAgICAgICAgICAgICAgIGZjdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBXYXJuaW5nOiBIYXZlIHRvIGJlIGJlZm9yZSBcIm5vdGlmeSgnZW5kJylcIlxyXG4gICAgICAgIC8vIGJlY2F1c2UgXCJub3RpZnkoJ2VuZCcpXCJcIiBjYW4gYmUgbGlua2VkIHRvIFwiW3NpemVdPSd4J1wiID4gXCJidWlsZCgpXCIgPiBcInN0b3BEcmFnZ2luZygpXCJcclxuICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gSWYgbW92ZWQgZnJvbSBzdGFydGluZyBwb2ludCwgbm90aWZ5IGVuZFxyXG4gICAgICAgIGlmICh0aGlzLmVuZFBvaW50ICYmICh0aGlzLnN0YXJ0UG9pbnQueCAhPT0gdGhpcy5lbmRQb2ludC54IHx8IHRoaXMuc3RhcnRQb2ludC55ICE9PSB0aGlzLmVuZFBvaW50LnkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCdlbmQnLCB0aGlzLnNuYXBzaG90Lmd1dHRlck51bSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmd1dHRlckVscy50b0FycmF5KClbdGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0gLSAxXS5uYXRpdmVFbGVtZW50LCAnYXMtZHJhZ2dlZCcpO1xyXG4gICAgICAgIHRoaXMuc25hcHNob3QgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBOZWVkZWQgdG8gbGV0IChjbGljayk9XCJjbGlja0d1dHRlciguLi4pXCIgZXZlbnQgcnVuIGFuZCB2ZXJpZnkgaWYgbW91c2UgbW92ZWQgb3Igbm90XHJcbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnRQb2ludCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZFBvaW50ID0gbnVsbDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5vdGlmeSh0eXBlOiAnc3RhcnQnIHwgJ3Byb2dyZXNzJyB8ICdlbmQnIHwgJ2NsaWNrJyB8ICdkYmxjbGljaycgfCAndHJhbnNpdGlvbkVuZCcsIGd1dHRlck51bTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3Qgc2l6ZXMgPSB0aGlzLmdldFZpc2libGVBcmVhU2l6ZXMoKTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdGFydCcpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnU3RhcnQuZW1pdCh7Z3V0dGVyTnVtLCBzaXplc30pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2VuZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnRW5kLmVtaXQoe2d1dHRlck51bSwgc2l6ZXN9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjbGljaycpIHtcclxuICAgICAgICAgICAgdGhpcy5ndXR0ZXJDbGljay5lbWl0KHtndXR0ZXJOdW0sIHNpemVzfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZGJsY2xpY2snKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3V0dGVyRGJsQ2xpY2suZW1pdCh7Z3V0dGVyTnVtLCBzaXplc30pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3RyYW5zaXRpb25FbmQnKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb25FbmRTdWJzY3JpYmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gdGhpcy50cmFuc2l0aW9uRW5kU3Vic2NyaWJlci5uZXh0KHNpemVzKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdwcm9ncmVzcycpIHtcclxuICAgICAgICAgICAgLy8gU3RheSBvdXRzaWRlIHpvbmUgdG8gYWxsb3cgdXNlcnMgZG8gd2hhdCB0aGV5IHdhbnQgYWJvdXQgY2hhbmdlIGRldGVjdGlvbiBtZWNoYW5pc20uXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ1Byb2dyZXNzU3ViamVjdC5uZXh0KHtndXR0ZXJOdW0sIHNpemVzfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX21vdmVHdXR0ZXIoZ3V0dGVySW5kZXg6IG51bWJlciwgb2Zmc2V0OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBndXR0ZXIgPSB0aGlzLmd1dHRlckVscy50b0FycmF5KClbZ3V0dGVySW5kZXhdLm5hdGl2ZUVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzSG9yaXpvbnRhbERpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBndXR0ZXIuc3R5bGUubGVmdCA9IGAkey1vZmZzZXR9cHhgO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGd1dHRlci5zdHlsZS50b3AgPSBgJHstb2Zmc2V0fXB4YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVzZXRHdXR0ZXJPZmZzZXQoZ3V0dGVySW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGd1dHRlciA9IHRoaXMuZ3V0dGVyRWxzLnRvQXJyYXkoKVtndXR0ZXJJbmRleF0ubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIb3Jpem9udGFsRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGd1dHRlci5zdHlsZS5sZWZ0ID0gJzBweCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ3V0dGVyLnN0eWxlLnRvcCA9ICcwcHgnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbnB1dCwgRWxlbWVudFJlZiwgUmVuZGVyZXIyLCBPbkluaXQsIE9uRGVzdHJveSwgTmdab25lIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBTcGxpdENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudC9zcGxpdC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyLCBnZXRJbnB1dEJvb2xlYW4gfSBmcm9tICcuLi91dGlscyc7XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiAnYXMtc3BsaXQtYXJlYSwgW2FzLXNwbGl0LWFyZWFdJyxcclxuICAgIGV4cG9ydEFzOiAnYXNTcGxpdEFyZWEnXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTcGxpdEFyZWFEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgcHJpdmF0ZSBfb3JkZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBvcmRlcih2OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fb3JkZXIgPSBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyKHYsIG51bGwpO1xyXG5cclxuICAgICAgICB0aGlzLnNwbGl0LnVwZGF0ZUFyZWEodGhpcywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgb3JkZXIoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29yZGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9zaXplOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgc2l6ZSh2OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fc2l6ZSA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3BsaXQudXBkYXRlQXJlYSh0aGlzLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBzaXplKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9taW5TaXplOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgbWluU2l6ZSh2OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fbWluU2l6ZSA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3BsaXQudXBkYXRlQXJlYSh0aGlzLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBtaW5TaXplKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9taW5TaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9tYXhTaXplOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgICBASW5wdXQoKSBzZXQgbWF4U2l6ZSh2OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fbWF4U2l6ZSA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgbnVsbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc3BsaXQudXBkYXRlQXJlYSh0aGlzLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBtYXhTaXplKCk6IG51bWJlciB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXhTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy9cclxuXHJcbiAgICBwcml2YXRlIF9sb2NrU2l6ZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCBsb2NrU2l6ZSh2OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fbG9ja1NpemUgPSBnZXRJbnB1dEJvb2xlYW4odik7XHJcblxyXG4gICAgICAgIHRoaXMuc3BsaXQudXBkYXRlQXJlYSh0aGlzLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBsb2NrU2l6ZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbG9ja1NpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgX3Zpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldCB2aXNpYmxlKHY6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl92aXNpYmxlID0gZ2V0SW5wdXRCb29sZWFuKHYpO1xyXG5cclxuICAgICAgICBpZih0aGlzLl92aXNpYmxlKSB7IFxyXG4gICAgICAgICAgICB0aGlzLnNwbGl0LnNob3dBcmVhKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWhpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zcGxpdC5oaWRlQXJlYSh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1oaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8vL1xyXG5cclxuICAgIHByaXZhdGUgdHJhbnNpdGlvbkxpc3RlbmVyOiBGdW5jdGlvbjtcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9ja0xpc3RlbmVyczogQXJyYXk8RnVuY3Rpb24+ID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcclxuICAgICAgICAgICAgICAgIHB1YmxpYyBlbFJlZjogRWxlbWVudFJlZixcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgICAgICAgICAgICAgIHByaXZhdGUgc3BsaXQ6IFNwbGl0Q29tcG9uZW50KSB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1zcGxpdC1hcmVhJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc3BsaXQuYWRkQXJlYSh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25MaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ3RyYW5zaXRpb25lbmQnLCAoZXZlbnQ6IFRyYW5zaXRpb25FdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gTGltaXQgb25seSBmbGV4LWJhc2lzIHRyYW5zaXRpb24gdG8gdHJpZ2dlciB0aGUgZXZlbnRcclxuICAgICAgICAgICAgICAgIGlmKGV2ZW50LnByb3BlcnR5TmFtZSA9PT0gJ2ZsZXgtYmFzaXMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGxpdC5ub3RpZnkoJ3RyYW5zaXRpb25FbmQnLCAtMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRTdHlsZU9yZGVyKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ29yZGVyJywgdmFsdWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgc2V0U3R5bGVGbGV4KGdyb3c6IG51bWJlciwgc2hyaW5rOiBudW1iZXIsIGJhc2lzOiBzdHJpbmcsIGlzTWluOiBib29sZWFuLCBpc01heDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIC8vIE5lZWQgMyBzZXBhcmF0ZWQgcHJvcGVydGllcyB0byB3b3JrIG9uIElFMTEgKGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2ZsZXgtbGF5b3V0L2lzc3Vlcy8zMjMpXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdmbGV4LWdyb3cnLCBncm93KTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2ZsZXgtc2hyaW5rJywgc2hyaW5rKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2ZsZXgtYmFzaXMnLCBiYXNpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoaXNNaW4gPT09IHRydWUpICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLW1pbicpO1xyXG4gICAgICAgIGVsc2UgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1taW4nKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihpc01heCA9PT0gdHJ1ZSkgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtbWF4Jyk7XHJcbiAgICAgICAgZWxzZSAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLW1heCcpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgbG9ja0V2ZW50cygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubG9ja0xpc3RlbmVycy5wdXNoKCB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdzZWxlY3RzdGFydCcsIChlOiBFdmVudCkgPT4gZmFsc2UpICk7XHJcbiAgICAgICAgICAgIHRoaXMubG9ja0xpc3RlbmVycy5wdXNoKCB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdkcmFnc3RhcnQnLCAoZTogRXZlbnQpID0+IGZhbHNlKSApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB1bmxvY2tFdmVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgd2hpbGUodGhpcy5sb2NrTGlzdGVuZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgZmN0ID0gdGhpcy5sb2NrTGlzdGVuZXJzLnBvcCgpO1xyXG4gICAgICAgICAgICBpZihmY3QpIGZjdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy51bmxvY2tFdmVudHMoKTtcclxuXHJcbiAgICAgICAgaWYodGhpcy50cmFuc2l0aW9uTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uTGlzdGVuZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3BsaXQucmVtb3ZlQXJlYSh0aGlzKTtcclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOZ01vZHVsZSwgTW9kdWxlV2l0aFByb3ZpZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuaW1wb3J0IHsgU3BsaXRDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudC9zcGxpdC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBTcGxpdEFyZWFEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZS9zcGxpdEFyZWEuZGlyZWN0aXZlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbXHJcbiAgICAgICAgQ29tbW9uTW9kdWxlXHJcbiAgICBdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICAgICAgU3BsaXRDb21wb25lbnQsXHJcbiAgICAgICAgU3BsaXRBcmVhRGlyZWN0aXZlLFxyXG4gICAgXSxcclxuICAgIGV4cG9ydHM6IFtcclxuICAgICAgICBTcGxpdENvbXBvbmVudCxcclxuICAgICAgICBTcGxpdEFyZWFEaXJlY3RpdmUsXHJcbiAgICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbmd1bGFyU3BsaXRNb2R1bGUge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuZ01vZHVsZTogQW5ndWxhclNwbGl0TW9kdWxlLFxyXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZvckNoaWxkKCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5nTW9kdWxlOiBBbmd1bGFyU3BsaXRNb2R1bGUsXHJcbiAgICAgICAgICAgIHByb3ZpZGVyczogW11cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufVxyXG4iXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwiU3ViamVjdCIsIk9ic2VydmFibGUiLCJkZWJvdW5jZVRpbWUiLCJ0c2xpYl8xLl9fc3ByZWFkIiwiQ29tcG9uZW50IiwiQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiLCJOZ1pvbmUiLCJFbGVtZW50UmVmIiwiQ2hhbmdlRGV0ZWN0b3JSZWYiLCJSZW5kZXJlcjIiLCJJbnB1dCIsIk91dHB1dCIsIlZpZXdDaGlsZHJlbiIsIkRpcmVjdGl2ZSIsIk5nTW9kdWxlIiwiQ29tbW9uTW9kdWxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBQTs7Ozs7Ozs7Ozs7Ozs7QUFjQSxhQXVHZ0IsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFD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