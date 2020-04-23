import { __values, __spread, __assign, __awaiter, __generator, __extends } from 'tslib';
import { InjectionToken, Injectable, ReflectiveInjector, Component, ViewContainerRef, ComponentFactoryResolver, NgZone, ChangeDetectorRef, ApplicationRef, Injector, Inject, ViewChild, HostListener, SkipSelf, NgModule } from '@angular/core';
import { Subject, of, BehaviorSubject, fromEvent } from 'rxjs';
import { auditTime, takeUntil, first, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * Generated from: lib/tokens/golden-layout-container.token.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var GoldenLayoutContainer = new InjectionToken('GoldenLayoutContainer');

/**
 * @fileoverview added by tsickle
 * Generated from: lib/tokens/golden-layout-item-component-factory.token.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var GoldenLayoutItemComponentResolver = new InjectionToken('GoldenLayoutItemComponentResolver');

/**
 * @fileoverview added by tsickle
 * Generated from: lib/services/layout-manager.service.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
function AddComponentData() { }
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
if (false) {
    /**
     * @type {?}
     * @private
     */
    LayoutManagerService.prototype._layout;
}

/**
 * @fileoverview added by tsickle
 * Generated from: lib/utils/JsUtils.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var JsUtils = /** @class */ (function () {
    function JsUtils() {
    }
    /**
     * @return {?}
     */
    JsUtils.generateGUID = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var s4 = (/**
         * @return {?}
         */
        function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        });
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    return JsUtils;
}());

/**
 * @fileoverview added by tsickle
 * Generated from: lib/popup-window-manager.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
function IPopupWindowManagerConfig() { }
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
function IPopupWindowConfig() { }
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
var PopupWindowConfigKey = 'popupWindowConfigKey';
var PopupWindowManager = /** @class */ (function () {
    function PopupWindowManager(window, popupConfig) {
        var _this = this;
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
            function (compConfig) {
                popupConfig.popinHandler(compConfig);
            })))),
            fireStateChanged: (/** @type {?} */ (((/**
             * @return {?}
             */
            function () {
                popupConfig.popupStateChangedHandler();
            })))),
            runChangeDetectionInRootWindow: (/**
             * @return {?}
             */
            function () {
                popupConfig.runChangeDetectionHandler();
            }),
            needRunChangeDetection: this._runChangeDetection$.asObservable(),
            onLayoutCreated: (/**
             * @param {?} layout
             * @return {?}
             */
            function (layout) {
                _this._popupLayout = layout;
            })
        }));
        $(this.window).one('load', (/**
         * @return {?}
         */
        function () {
            $(_this.window).one('unload', (/**
             * @return {?}
             */
            function () {
                popupConfig.popupClosedHandler(_this._closedByUser);
                _this.window.close();
            }));
        }));
    }
    /**
     * @param {?} url
     * @return {?}
     */
    PopupWindowManager.openWindow = /**
     * @param {?} url
     * @return {?}
     */
    function (url) {
        /** @type {?} */
        var windowOptions = {
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
        var popupWindowNative = window.open(url, "" + JsUtils.generateGUID(), PopupWindowManager.serializeWindowOptions(windowOptions));
        if (popupWindowNative == null) {
            return null;
        }
        return popupWindowNative;
    };
    /**
     * @param {?} windowOptions
     * @return {?}
     */
    PopupWindowManager.serializeWindowOptions = /**
     * @param {?} windowOptions
     * @return {?}
     */
    function (windowOptions) {
        /** @type {?} */
        var windowOptionsString = [];
        for (var key in windowOptions) {
            windowOptionsString.push(key + '=' + windowOptions[key]);
        }
        return windowOptionsString.join(',');
    };
    /**
     * @return {?}
     */
    PopupWindowManager.prototype.runChangeDetection = /**
     * @return {?}
     */
    function () {
        this._runChangeDetection$.next();
    };
    /**
     * @return {?}
     */
    PopupWindowManager.prototype.saveState = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var componentConfig = (/** @type {?} */ (this._popupLayout.saveState().content[0]));
        delete componentConfig['width'];
        return componentConfig;
    };
    /**
     * @return {?}
     */
    PopupWindowManager.prototype.close = /**
     * @return {?}
     */
    function () {
        this._closedByUser = false;
        this.window.close();
    };
    return PopupWindowManager;
}());
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

/**
 * @fileoverview added by tsickle
 * Generated from: lib/tokens/golden-layout-item-container.token.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var GoldenLayoutItemContainerToken = new InjectionToken('wrapper');

/**
 * @fileoverview added by tsickle
 * Generated from: lib/tokens/golden-layout-configuration.token.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var GoldenLayoutComponentConfiguration = new InjectionToken('GoldenLayoutComponentConfiguration');

/**
 * @fileoverview added by tsickle
 * Generated from: lib/tokens/golden-layout-item-state.token.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var GoldenLayoutItemState = new InjectionToken('GoldenLayoutItemState');

/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout/golden-layout.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
function GoldenLayoutState() { }
/** @type {?} */
var COMPONENT_REF_KEY = '$componentRef';
/** @type {?} */
var DefaultLabels = {
    additionalTabs: of('Additional tabs'),
    addComponent: of('Add Component'),
    maximise: of('Maximise'),
    minimise: of('Minimise'),
    popout: of('Open in new window'),
    popin: of('Pop in'),
    close: of('Close'),
    loading: of('Loading'),
    failedToLoadComponent: of('Failed to load component')
};
/** @type {?} */
var Class = {
    tabsDropdown: 'lm_tabdropdown',
    addComponent: 'lm_add-component',
    close: 'lm_close',
    closeTab: 'lm_close_tab',
    maximise: 'lm_maximise',
    popout: 'lm_popout',
    popin: 'lm_popin',
    tabDrag: 'lm_tab_drag',
    ClosableTab: 'closable-tab'
};
var GoldenLayoutComponent = /** @class */ (function () {
    function GoldenLayoutComponent(viewContainer, _layoutManager, componentFactoryResolver, ngZone, _changeDetectorRef, _appRef, injector, _configuration) {
        this.viewContainer = viewContainer;
        this._layoutManager = _layoutManager;
        this.componentFactoryResolver = componentFactoryResolver;
        this.ngZone = ngZone;
        this._changeDetectorRef = _changeDetectorRef;
        this._appRef = _appRef;
        this.injector = injector;
        this._configuration = _configuration;
        this.popupsWindows = [];
        this.$onAddComponent = new Subject();
        this.$layoutEmpty = new BehaviorSubject(false);
        this.$stateChanged = new Subject();
        this._destroy$ = new Subject();
        this._labels = DefaultLabels;
        this._resize$ = new Subject();
        this._suppressChangeDetection = false;
        this._isDestroyed = false;
        this._layoutManager.setLayout(this);
        this._setLabels(this._configuration.labels ? Object.assign({}, DefaultLabels, this._configuration.labels) : DefaultLabels);
    }
    Object.defineProperty(GoldenLayoutComponent.prototype, "isLayoutEmpty", {
        get: /**
         * @return {?}
         */
        function () {
            return this.$layoutEmpty.getValue();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} componentConfig
     * @return {?}
     */
    GoldenLayoutComponent.getSingleComponentLayoutConfig = /**
     * @param {?} componentConfig
     * @return {?}
     */
    function (componentConfig) {
        return {
            version: GoldenLayoutComponent.stateVersion,
            content: [
                componentConfig
            ]
        };
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this._resize$
            .pipe(auditTime(10), takeUntil(this._destroy$))
            .subscribe((/**
         * @return {?}
         */
        function () {
            if (_this.goldenLayout) {
                _this.goldenLayout.updateSize();
            }
        }));
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (!this._suppressChangeDetection) {
            this.popupsWindows.forEach((/**
             * @param {?} w
             * @return {?}
             */
            function (w) { return w.runChangeDetection(); }));
        }
    };
    /**
     * @private
     * @return {?}
     */
    GoldenLayoutComponent.prototype._registerComponents = /**
     * @private
     * @return {?}
     */
    function () {
        var e_1, _a;
        try {
            for (var _b = __values(this._configuration.components), _c = _b.next(); !_c.done; _c = _b.next()) {
                var component = _c.value;
                this.goldenLayout.registerComponent(component.componentName, this.createComponentInitCallback(component));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * @private
     * @param {?} state
     * @return {?}
     */
    GoldenLayoutComponent.prototype._createLayout = /**
     * @private
     * @param {?} state
     * @return {?}
     */
    function (state) {
        var _this = this;
        /** @type {?} */
        var createLayout = (/**
         * @return {?}
         */
        function () {
            return new Promise((/**
             * @param {?} resolve
             * @return {?}
             */
            function (resolve) {
                var e_2, _a;
                /** @type {?} */
                var notOpenedPopupsComponents = [];
                if (state.openPopups) {
                    try {
                        for (var _b = __values(state.openPopups), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var itemConfig = _c.value;
                            /** @type {?} */
                            var opened = _this._openPopup(itemConfig);
                            if (!opened) {
                                notOpenedPopupsComponents.push(itemConfig);
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                if (notOpenedPopupsComponents.length) {
                    /** @type {?} */
                    var isLayoutEmpty = state.content.length === 0;
                    if (isLayoutEmpty) {
                        state.content = [
                            {
                                type: 'row',
                                width: 100,
                                height: 100,
                                content: __spread(notOpenedPopupsComponents)
                            }
                        ];
                    }
                    else {
                        state.content = [
                            {
                                type: "row",
                                width: 100,
                                height: 100,
                                content: __spread([
                                    Object.assign({}, state.content[0], { width: 50, height: 100 })
                                ], notOpenedPopupsComponents)
                            }
                        ];
                    }
                }
                _this.goldenLayout = new GoldenLayout((/** @type {?} */ (state)), $(_this.el.nativeElement));
                _this.goldenLayout.on('stateChanged', (/**
                 * @param {?} v
                 * @return {?}
                 */
                function (v) {
                    if (_this.goldenLayout.isInitialised) {
                        _this.$stateChanged.next();
                    }
                }));
                _this._registerComponents();
                ((/** @type {?} */ (window))).gl = _this.goldenLayout;
                ((/** @type {?} */ (window))).glc = _this;
                _this.goldenLayout.on('itemCreated', (/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                    _this._handleItemCreated(item);
                }));
                // Destory child angular components on golden-helpers container destruction.
                _this.goldenLayout.on('itemDestroyed', (/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                    /** @type {?} */
                    var container = item.container;
                    /** @type {?} */
                    var component = container && container[COMPONENT_REF_KEY];
                    if (component) {
                        component.destroy();
                        ((/** @type {?} */ (container)))[COMPONENT_REF_KEY] = null;
                    }
                }));
                _this.goldenLayout.on('stackCreated', (/**
                 * @param {?} stack
                 * @return {?}
                 */
                function (stack) {
                    _this._handleStackCreated(stack);
                }));
                _this.goldenLayout.eventHub.on('selectionChanged', (/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                }));
                _this.goldenLayout.eventHub.on('columnCreated', (/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                }));
                _this.goldenLayout.on('itemCreated', (/**
                 * @return {?}
                 */
                function () {
                    _this.$layoutEmpty.next(false);
                }));
                _this.goldenLayout.on('itemDestroyed', ((/**
                 * @return {?}
                 */
                function () {
                    /** @type {?} */
                    var _ignoredItem = null;
                    return (/**
                     * @param {?} item
                     * @return {?}
                     */
                    function (item) {
                        if (item.parent && (item.parent.isColumn || item.parent.isRow) && item.parent.contentItems.length === 2) {
                            _ignoredItem = item.parent;
                        }
                        if (item !== _ignoredItem) {
                            /** @type {?} */
                            var isLayoutEmpty = _this.goldenLayout.root.contentItems.filter((/**
                             * @param {?} i
                             * @return {?}
                             */
                            function (i) { return i !== item; })).length === 0;
                            _this.$layoutEmpty.next(isLayoutEmpty);
                            _this._changeDetectorRef.detectChanges();
                        }
                    });
                }))());
                _this.goldenLayout.on('beforeItemDestroyed', (/**
                 * @param {?} item
                 * @return {?}
                 */
                function (item) {
                    if (item.isMaximised) {
                        item.toggleMaximise(); // fix issue with deleting maximised component
                    }
                }));
                _this.goldenLayout.on('initialised', (/**
                 * @return {?}
                 */
                function () {
                    _this.$layoutEmpty.next(_this.goldenLayout.root.contentItems.length === 0);
                    if (!_this._isDestroyed) {
                        _this._changeDetectorRef.detectChanges();
                    }
                    // this.goldenLayout.updateSize();
                    resolve();
                }));
                // Initialize the helpers.
                _this.goldenLayout.init();
            }));
        });
        return new Promise((/**
         * @param {?} resolve
         * @param {?} rej
         * @return {?}
         */
        function (resolve, rej) {
            setTimeout((/**
             * @return {?}
             */
            function () {
                resolve(createLayout());
            }), 0);
        }));
    };
    /**
     * @param {?} event
     * @return {?}
     */
    GoldenLayoutComponent.prototype.onResize = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this._resize$.next();
    };
    /**
     * @private
     * @param {?} item
     * @return {?}
     */
    GoldenLayoutComponent.prototype._handleItemCreated = /**
     * @private
     * @param {?} item
     * @return {?}
     */
    function (item) {
        var _this = this;
        try {
            if (item.isStack && this._configuration.settings.showAddBtn !== false) {
                /** @type {?} */
                var addComponentBtn_1 = $("<span class='" + Class.addComponent + "'></span>");
                this._getLabel('addComponent')
                    .subscribe((/**
                 * @param {?} label
                 * @return {?}
                 */
                function (label) {
                    addComponentBtn_1.attr('title', label);
                }));
                if (this._configuration.settings.getAddComponentBtnIcon) {
                    addComponentBtn_1.append(this._configuration.settings.getAddComponentBtnIcon());
                }
                $(((/** @type {?} */ (item))).header.tabsContainer).append(addComponentBtn_1);
                this.ngZone.run((/**
                 * @return {?}
                 */
                function () {
                    addComponentBtn_1.click((/**
                     * @return {?}
                     */
                    function () {
                        _this.$onAddComponent.next(item);
                    }));
                }));
            }
            item.on('resize', (/**
             * @return {?}
             */
            function () {
                $(window).trigger('resize');
            }));
        }
        catch (e) {
            console.error(e);
        }
    };
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    GoldenLayoutComponent.prototype._handleStackCreated = /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    function (stack) {
        if (this._configuration.settings.showCloseIcon !== false) {
            this._addCloseBtn(stack);
        }
        else {
            stack.header.controlsContainer
                .find("." + Class.close).hide();
        }
        if (this._configuration.settings.showMaximiseIcon !== false) {
            this._addMaximizeBtn(stack);
        }
        else {
            stack.header.controlsContainer
                .find("." + Class.maximise).hide();
        }
        if (this._configuration.settings.showPopoutIcon !== false) {
            this._addPopoutBtn(stack);
        }
        else {
            stack.header.controlsContainer
                .find("." + Class.popout).hide();
        }
        this._getLabel('additionalTabs')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            stack.header.controlsContainer
                .find("." + Class.tabsDropdown).attr('title', label);
        }));
        if (this._configuration.settings.showPopinIcon !== false) {
            this._addPopinBtn(stack);
        }
    };
    /**
     * @param {?} componentResolver
     * @return {?}
     */
    GoldenLayoutComponent.prototype.createComponentInitCallback = /**
     * @param {?} componentResolver
     * @return {?}
     */
    function (componentResolver) {
        /** @type {?} */
        var that = this;
        return (/**
         * @param {?} container
         * @param {?} state
         * @return {?}
         */
        function (container, state) {
            that.ngZone.run((/**
             * @return {?}
             */
            function () {
                // Create an instance of the angular component.
                // Create an instance of the angular component.
                /** @type {?} */
                var factory = that.componentFactoryResolver.resolveComponentFactory((/** @type {?} */ (that.injector.get(GoldenLayoutItemContainerToken))));
                /** @type {?} */
                var injector = that._createComponentInjector(container, state.componentState, componentResolver);
                /** @type {?} */
                var componentRef = that.viewContainer.createComponent(factory, undefined, injector);
                // Bind the new component to container's client DOM element.
                container.getElement().append($(componentRef.location.nativeElement));
                that._bindEventHooks(container, componentRef);
                // this._initComponent(container, componentRef.instance);
                ((/** @type {?} */ (window))).container = container;
                // Store a ref to the compoenentRef in the container to support destruction later on.
                ((/** @type {?} */ (container)))[COMPONENT_REF_KEY] = componentRef;
                // const factory = this.componentFactoryResolver.resolveComponentFactory(layoutItemClass);
                // const injector = this._createComponentInjector(container, state.componentState);
                // const componentRef = this.viewContainer.createComponent(factory, undefined, injector);
                //
                // // Bind the new component to container's client DOM element.
                // container.getElement().append($(componentRef.location.nativeElement));
                //
                // this._bindEventHooks(container, componentRef);
                // this._initComponent(container, componentRef.instance);
                //
                // (window as any).container = container;
                //
                // // Store a ref to the compoenentRef in the container to support destruction later on.
                // (container as any)[COMPONENT_REF_KEY] = componentRef;
            }));
        });
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.fireStateChanged = /**
     * @return {?}
     */
    function () {
        this.$stateChanged.next();
    };
    /**
     * Creates an injector capable of injecting the Layout object,
     * component container, and initial component state.
     */
    /**
     * Creates an injector capable of injecting the Layout object,
     * component container, and initial component state.
     * @private
     * @param {?} container
     * @param {?} state
     * @param {?} componentResolver
     * @return {?}
     */
    GoldenLayoutComponent.prototype._createComponentInjector = /**
     * Creates an injector capable of injecting the Layout object,
     * component container, and initial component state.
     * @private
     * @param {?} container
     * @param {?} state
     * @param {?} componentResolver
     * @return {?}
     */
    function (container, state, componentResolver) {
        return ReflectiveInjector.resolveAndCreate([
            {
                provide: GoldenLayoutContainer,
                useValue: container
            },
            {
                provide: GoldenLayoutItemState,
                useValue: state
            },
            {
                provide: GoldenLayout,
                useValue: this.goldenLayout
            },
            {
                provide: GoldenLayoutComponent,
                useValue: this
            },
            {
                provide: GoldenLayoutItemComponentResolver,
                useValue: componentResolver
            }
        ], this.injector);
    };
    /**
     * Registers an event handler for each implemented hook.
     * @param container Golden Layout component container.
     * @param component Angular component instance.
     */
    /**
     * Registers an event handler for each implemented hook.
     * @private
     * @param {?} container Golden Layout component container.
     * @param {?} componentRef
     * @return {?}
     */
    GoldenLayoutComponent.prototype._bindEventHooks = /**
     * Registers an event handler for each implemented hook.
     * @private
     * @param {?} container Golden Layout component container.
     * @param {?} componentRef
     * @return {?}
     */
    function (container, componentRef) {
        var _this = this;
        /** @type {?} */
        var component = (/** @type {?} */ (componentRef.instance));
        container.on('resize', (/**
         * @return {?}
         */
        function () {
            component.onResize();
        }));
        container.on('show', (/**
         * @return {?}
         */
        function () {
            component.onShow();
        }));
        container.on('hide', (/**
         * @return {?}
         */
        function () {
            component.onHide();
        }));
        container.on('tab', (/**
         * @param {?} tab
         * @return {?}
         */
        function (tab) {
            _this._handleTabCreated(tab);
            if (((/** @type {?} */ (container)))._config.isClosable) {
                tab.element.addClass(Class.ClosableTab);
            }
            component.onTabCreated((/** @type {?} */ (tab.element)));
        }));
    };
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    GoldenLayoutComponent.prototype._addPopoutBtn = /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    function (stack) {
        var _this = this;
        /** @type {?} */
        var popoutBtn = stack.header.controlsContainer
            .find("." + Class.popout);
        popoutBtn.off();
        this._getLabel('popout').pipe()
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            popoutBtn.attr('title', label);
        }));
        if (this._configuration.settings.getPopoutIcon) {
            popoutBtn.append(this._configuration.settings.getPopoutIcon());
        }
        popoutBtn.click((/**
         * @return {?}
         */
        function () {
            _this._handlePopupClick(stack);
        }));
    };
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    GoldenLayoutComponent.prototype._addPopinBtn = /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    function (stack) {
        var _this = this;
        /** @type {?} */
        var popinBtn = $("\n            <li class=\"" + Class.popin + "\"></li>\n        ");
        this._getLabel('popin')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            popinBtn.attr('title', label);
        }));
        popinBtn.append(this._configuration.settings.getPopinIcon());
        fromEvent(popinBtn, 'click').pipe(first()).subscribe((/**
         * @return {?}
         */
        function () {
            var e_3, _a;
            try {
                for (var _b = __values(stack.contentItems), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var component = _c.value;
                    _this._saveItemState(component.container);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            _this._configuration.settings.popinHandler(stack.config);
        }));
        stack.header.controlsContainer.find('.lm_tabdropdown').after(popinBtn);
    };
    /**
     * @private
     * @return {?}
     */
    GoldenLayoutComponent.prototype._getMaximiseIcon = /**
     * @private
     * @return {?}
     */
    function () {
        return this._configuration.settings.getMaximiseIcon
            ? this._configuration.settings.getMaximiseIcon()
            : null;
    };
    /**
     * @private
     * @return {?}
     */
    GoldenLayoutComponent.prototype._getMinimiseIcon = /**
     * @private
     * @return {?}
     */
    function () {
        return this._configuration.settings.getMinimiseIcon
            ? this._configuration.settings.getMinimiseIcon()
            : null;
    };
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    GoldenLayoutComponent.prototype._addMaximizeBtn = /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    function (stack) {
        var _this = this;
        /** @type {?} */
        var updateBtn = (/**
         * @param {?} isMaximised
         * @return {?}
         */
        function (isMaximised) {
            /** @type {?} */
            var icon = isMaximised ? _this._getMinimiseIcon() : _this._getMaximiseIcon();
            /** @type {?} */
            var maximiseBtn = stack.header.controlsContainer.find("." + Class.maximise);
            maximiseBtn.empty();
            _this._getLabel(isMaximised ? 'minimise' : 'maximise')
                .subscribe((/**
             * @param {?} label
             * @return {?}
             */
            function (label) {
                maximiseBtn.attr('title', label);
            }));
            if (icon) {
                maximiseBtn.append(icon);
            }
        });
        stack.on('maximised', (/**
         * @return {?}
         */
        function () { return updateBtn(true); }));
        stack.on('minimised', (/**
         * @return {?}
         */
        function () { return updateBtn(false); }));
        updateBtn(false);
    };
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    GoldenLayoutComponent.prototype._addCloseBtn = /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    function (stack) {
        /** @type {?} */
        var btn = stack.header.controlsContainer.find("." + Class.close);
        if (this._configuration.settings.getCloseIcon) {
            btn.append(this._configuration.settings.getCloseIcon());
        }
        this._getLabel('close')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            btn.attr('title', label);
        }));
    };
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    GoldenLayoutComponent.prototype._addCloseTabBtn = /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    function (tab) {
        if (this._configuration.settings.getCloseTabIcon) {
            tab.closeElement.append(this._configuration.settings.getCloseTabIcon());
        }
    };
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    GoldenLayoutComponent.prototype._handleTabCreated = /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    function (tab) {
        if (this._configuration.settings.showCloseTabIcon !== false) {
            this._addCloseTabBtn(tab);
        }
        else {
            tab.closeElement.hide();
        }
        this._addMobileTabDraggingSupport(tab);
    };
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    GoldenLayoutComponent.prototype._handlePopupClick = /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    function (stack) {
        var e_4, _a;
        if (this._configuration.settings.canOpenPopupWindow != null && !this._configuration.settings.canOpenPopupWindow()) {
            return;
        }
        /** @type {?} */
        var activeContentItem = stack.getActiveContentItem();
        /** @type {?} */
        var parentId = activeContentItem.parent && activeContentItem.parent.config.id;
        try {
            for (var _b = __values(stack.contentItems), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                this._saveItemState(item.container);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // activeContentItem.container.extendState({
        //     componentState: activeContentItem.container[COMPONENT_REF_KEY].instance.saveState(),
        //     parentId: parentId
        // });
        /** @type {?} */
        var componentConfig = stack.config;
        this._openPopup(componentConfig);
        stack.parent.removeChild(stack);
    };
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    GoldenLayoutComponent.prototype._addMobileTabDraggingSupport = /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    function (tab) {
        /*
        * https://developer.mozilla.org/en-US/docs/Web/API/Touch/target
        *
        * If touchstart event target removed from DOM, then touchmove event won't be fired
        *
        * Solution: add overlay element to each tab, that will be replaced from tab container to body when touchstart
        * event will be fired
        *
        *
        * */
        /*
                * https://developer.mozilla.org/en-US/docs/Web/API/Touch/target
                *
                * If touchstart event target removed from DOM, then touchmove event won't be fired
                *
                * Solution: add overlay element to each tab, that will be replaced from tab container to body when touchstart
                * event will be fired
                *
                *
                * */
        /** @type {?} */
        var tabDrag = $("<span class=\"" + Class.tabDrag + "\"></span>");
        tabDrag.css({
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            'z-index': 1
        });
        $(tab.element).append(tabDrag);
        if (this._configuration.settings.reorderEnabled !== false) {
            this._overrideTabOnDragStart(tab);
        }
    };
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    GoldenLayoutComponent.prototype._overrideTabOnDragStart = /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    function (tab) {
        /** @type {?} */
        var origin = tab._onDragStart;
        /** @type {?} */
        var dragListener = tab._dragListener;
        /** @type {?} */
        var dragElement = $(tab.element).find("." + Class.tabDrag);
        dragListener.off('dragStart', origin, tab);
        /** @type {?} */
        var onDragStart = (/**
         * @param {?} x
         * @param {?} y
         * @return {?}
         */
        function (x, y) {
            dragElement.appendTo('body');
            origin.call(tab, x, y);
        });
        tab._onDragStart = onDragStart;
        dragListener.on('dragStart', ((/** @type {?} */ (tab)))._onDragStart, tab);
        dragListener.on('dragStop', (/**
         * @return {?}
         */
        function () {
            dragElement.remove();
        }), null);
    };
    /**
     * @private
     * @param {?} componentConfig
     * @return {?}
     */
    GoldenLayoutComponent.prototype._openPopup = /**
     * @private
     * @param {?} componentConfig
     * @return {?}
     */
    function (componentConfig) {
        var _this = this;
        /** @type {?} */
        var popupWindow;
        /** @type {?} */
        var popupWindowManager;
        /** @type {?} */
        var popupWindowConfig = {
            componentConfig: componentConfig,
            layoutSettings: this._configuration.settings,
            popinHandler: (/**
             * @param {?} _componentConfig
             * @return {?}
             */
            function (_componentConfig) {
                popupWindow.close();
                _this.addItemAsColumn(_componentConfig);
            }),
            popupStateChangedHandler: (/**
             * @return {?}
             */
            function () {
                _this.$stateChanged.next();
            }),
            popupClosedHandler: (/**
             * @param {?} closedByUser
             * @return {?}
             */
            function (closedByUser) {
                if (closedByUser) {
                    _this.popupsWindows = _this.popupsWindows.filter((/**
                     * @param {?} p
                     * @return {?}
                     */
                    function (p) { return p !== popupWindowManager; }));
                    _this.$stateChanged.next();
                }
            }),
            runChangeDetectionHandler: (/**
             * @return {?}
             */
            function () {
                _this._suppressChangeDetection = true;
                _this._appRef.tick();
                _this._suppressChangeDetection = false;
                _this.popupsWindows.filter((/**
                 * @param {?} w
                 * @return {?}
                 */
                function (w) { return w !== popupWindowManager; })).forEach((/**
                 * @param {?} w
                 * @return {?}
                 */
                function (w) { return w.runChangeDetection(); }));
            })
        };
        popupWindow = PopupWindowManager.openWindow(this._configuration.settings.popupWindowUrl);
        if (!popupWindow) {
            if (this._configuration.settings.openPopupFailureHandler) {
                this._configuration.settings.openPopupFailureHandler();
            }
            return false;
        }
        if (this._configuration.settings.openPopupHook) {
            this._configuration.settings.openPopupHook(popupWindow);
        }
        popupWindowManager = new PopupWindowManager(popupWindow, popupWindowConfig);
        this.popupsWindows.push(popupWindowManager);
        return true;
    };
    /**
     * @private
     * @param {?} container
     * @return {?}
     */
    GoldenLayoutComponent.prototype._saveItemState = /**
     * @private
     * @param {?} container
     * @return {?}
     */
    function (container) {
        container.setState(Object.assign({}, container.getState(), {
            componentState: ((/** @type {?} */ (container[COMPONENT_REF_KEY].instance))).saveState()
        }));
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.saveState = /**
     * @return {?}
     */
    function () {
        var e_5, _a;
        try {
            for (var _b = __values(this.getAllComponents()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var component = _c.value;
                this._saveItemState(((/** @type {?} */ (component))).container);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        /** @type {?} */
        var state = __assign({}, this.goldenLayout.toConfig(), { openPopups: this.popupsWindows.map((/**
             * @param {?} p
             * @return {?}
             */
            function (p) { return p.saveState(); })), version: GoldenLayoutComponent.stateVersion });
        return state;
    };
    /**
     * @param {?} state
     * @param {?=} fireStateChanged
     * @return {?}
     */
    GoldenLayoutComponent.prototype.loadState = /**
     * @param {?} state
     * @param {?=} fireStateChanged
     * @return {?}
     */
    function (state, fireStateChanged) {
        var _this = this;
        if (fireStateChanged === void 0) { fireStateChanged = false; }
        if (this.goldenLayout && this.goldenLayout.isInitialised) {
            this.goldenLayout.destroy();
            if (this.popupsWindows.length) {
                this.closePopups();
                this.popupsWindows = [];
            }
        }
        return this._createLayout(this._normalizeLayoutState(state))
            .then((/**
         * @return {?}
         */
        function () {
            if (fireStateChanged) {
                _this.$stateChanged.next();
            }
            return Promise.resolve();
        }));
    };
    /**
     * @param {?} itemId
     * @return {?}
     */
    GoldenLayoutComponent.prototype.saveItemState = /**
     * @param {?} itemId
     * @return {?}
     */
    function (itemId) {
        /** @type {?} */
        var items = this.goldenLayout.root.getItemsById(itemId);
        /** @type {?} */
        var item = items && items.length ? items[0] : null;
        if (!item) {
            return null;
        }
        return item.config;
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.closePopups = /**
     * @return {?}
     */
    function () {
        this.popupsWindows.forEach((/**
         * @param {?} p
         * @return {?}
         */
        function (p) {
            p.close();
        }));
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.getAllComponents = /**
     * @return {?}
     */
    function () {
        if (this.goldenLayout && this.goldenLayout.isInitialised) {
            return (/** @type {?} */ (this.goldenLayout.root.getItemsByType('component')));
        }
        return [];
    };
    /**
     * @private
     * @param {?} state
     * @return {?}
     */
    GoldenLayoutComponent.prototype._normalizeLayoutState = /**
     * @private
     * @param {?} state
     * @return {?}
     */
    function (state) {
        /** @type {?} */
        var normalizedState = (/** @type {?} */ (Object.assign({}, state, {
            settings: (/** @type {?} */ (Object.assign({}, state.settings, (/** @type {?} */ ({
                tabControlOffset: this._configuration.settings.tabControlOffset != null ? this._configuration.settings.tabControlOffset : 100,
                selectionEnabled: this._configuration.settings.selectionEnabled != null ? this._configuration.settings.selectionEnabled : false,
                reorderEnabled: this._configuration.settings.reorderEnabled != null ? this._configuration.settings.reorderEnabled : true,
                responsiveMode: this._configuration.settings.responsiveMode != null ? this._configuration.settings.responsiveMode : 'none',
                showCloseIcon: this._configuration.settings.showCloseIcon != null ? this._configuration.settings.showCloseIcon : true
            })))))
        })));
        if (this._configuration.settings.dimensions) {
            normalizedState.dimensions = this._configuration.settings.dimensions;
        }
        normalizedState = this._migrateState(normalizedState);
        return normalizedState;
    };
    /**
     * @private
     * @param {?} state
     * @return {?}
     */
    GoldenLayoutComponent.prototype._migrateState = /**
     * @private
     * @param {?} state
     * @return {?}
     */
    function (state) {
        /** @type {?} */
        var stateVersion = state.version;
        if (stateVersion === GoldenLayoutComponent.stateVersion) {
            return state;
        }
        if (state.version == null || state.version !== GoldenLayoutComponent.stateVersion) {
            console.warn("Incompatible layout state verGoldenLayoutStatesions. Current layout state version: " + GoldenLayoutComponent.stateVersion + ", your state version: " + (state.version || 'none'));
            state.content = []; // clear all components
        }
        return state;
    };
    /**
     * @param {?} componentConfig
     * @return {?}
     */
    GoldenLayoutComponent.prototype.addItemAsColumn = /**
     * @param {?} componentConfig
     * @return {?}
     */
    function (componentConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var e_6, layoutRoot, row, temp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.goldenLayout == null)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (this.goldenLayout.isInitialised) {
                            this.goldenLayout.destroy();
                        }
                        return [4 /*yield*/, this._createLayout(null)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _a.sent();
                        console.error(e_6);
                        return [3 /*break*/, 4];
                    case 4:
                        layoutRoot = ((/** @type {?} */ (this.goldenLayout.root)));
                        if (this.isLayoutEmpty) {
                            layoutRoot.addChild(componentConfig);
                            return [2 /*return*/];
                        }
                        if (layoutRoot.contentItems.length === 1 && layoutRoot.contentItems[0].isRow) {
                            layoutRoot.contentItems[0].addChild(componentConfig);
                            return [2 /*return*/];
                        }
                        row = (/** @type {?} */ (this.goldenLayout.createContentItem({
                            type: 'row',
                            id: (new Date()).getTime(),
                            // (new Date()).getTime()
                            width: 100,
                            height: 100
                        })));
                        temp = this.goldenLayout.root.contentItems[0];
                        this.goldenLayout.root.replaceChild(temp, row);
                        row.addChild(temp);
                        row.addChild(componentConfig);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param {?} componentName
     * @param {?} componentState
     * @return {?}
     */
    GoldenLayoutComponent.prototype.addComponentAsColumn = /**
     * @param {?} componentName
     * @param {?} componentState
     * @return {?}
     */
    function (componentName, componentState) {
        return __awaiter(this, void 0, void 0, function () {
            var componentConfig;
            return __generator(this, function (_a) {
                componentConfig = this._createComponentContentItemConfig(componentName, componentState);
                this.addItemAsColumn(componentConfig);
                return [2 /*return*/];
            });
        });
    };
    /**
     * @param {?} componentName
     * @param {?} componentState
     * @param {?} parent
     * @return {?}
     */
    GoldenLayoutComponent.prototype.addComponent = /**
     * @param {?} componentName
     * @param {?} componentState
     * @param {?} parent
     * @return {?}
     */
    function (componentName, componentState, parent) {
        return __awaiter(this, void 0, void 0, function () {
            var componentConfig;
            return __generator(this, function (_a) {
                componentConfig = this._createComponentContentItemConfig(componentName, componentState);
                if (this.isLayoutEmpty) {
                    this.goldenLayout.root.addChild(componentConfig);
                    return [2 /*return*/];
                }
                if (!parent) {
                    this.addComponentAsColumn(componentName, componentState);
                }
                parent.addChild(componentConfig);
                return [2 /*return*/];
            });
        });
    };
    /**
     * @param {?} componentConfig
     * @return {?}
     */
    GoldenLayoutComponent.prototype.addItem = /**
     * @param {?} componentConfig
     * @return {?}
     */
    function (componentConfig) {
        /** @type {?} */
        var isLayoutEmpty = this.goldenLayout.root.contentItems.length === 0;
        /** @type {?} */
        var stack = {
            type: 'stack',
            id: (new Date()).getTime(),
            content: [
                componentConfig
            ]
        };
        if (isLayoutEmpty) {
            this.goldenLayout.root.addChild(stack);
        }
        else {
            /** @type {?} */
            var stackContentItem = this.goldenLayout.createContentItem({
                type: 'stack',
                id: (new Date()).getTime(),
                content: []
            });
            stackContentItem.addChild(this.goldenLayout.createContentItem(componentConfig));
            /** @type {?} */
            var column = (/** @type {?} */ (this.goldenLayout.createContentItem({
                type: 'column',
                id: (new Date()).getTime(),
                width: 100,
                height: 100
            })));
            /** @type {?} */
            var temp = this.goldenLayout.root.contentItems[0];
            this.goldenLayout.root.replaceChild(temp, column);
            column.addChild(temp);
            column.addChild(stackContentItem);
        }
    };
    /**
     * @param {?} id
     * @return {?}
     */
    GoldenLayoutComponent.prototype.getItemsById = /**
     * @param {?} id
     * @return {?}
     */
    function (id) {
        return (/** @type {?} */ (((/** @type {?} */ (this.goldenLayout.root))).getItemsById(id)));
    };
    /**
     * @private
     * @param {?} labels
     * @return {?}
     */
    GoldenLayoutComponent.prototype._setLabels = /**
     * @private
     * @param {?} labels
     * @return {?}
     */
    function (labels) {
        var _this = this;
        this._labels = Object.assign({}, DefaultLabels, labels);
        /** @type {?} */
        var isLayoutInitialized = (/**
         * @return {?}
         */
        function () {
            return _this.goldenLayout && _this.goldenLayout.isInitialised;
        });
        /** @type {?} */
        var getLabel = (/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            return _this._getLabel(label, false)
                .pipe(filter((/**
             * @return {?}
             */
            function () { return isLayoutInitialized(); })), takeUntil(_this._destroy$));
        });
        getLabel('addComponent')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find("." + Class.addComponent).attr('title', label);
        }));
        getLabel('close')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find("." + Class.close).attr('title', label);
        }));
        getLabel('maximise')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find("." + Class.maximise).attr('title', label);
        }));
        getLabel('minimise')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find(".lm_maximised ." + Class.maximise).attr('title', label);
        }));
        getLabel('popout')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find("." + Class.popout).attr('title', label);
        }));
        getLabel('additionalTabs')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find("." + Class.tabsDropdown).attr('title', label);
        }));
        getLabel('popin')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        function (label) {
            $(_this.el.nativeElement).find("." + Class.popin).attr('title', label);
        }));
    };
    /**
     * @private
     * @param {?} label
     * @param {?=} firstValue
     * @return {?}
     */
    GoldenLayoutComponent.prototype._getLabel = /**
     * @private
     * @param {?} label
     * @param {?=} firstValue
     * @return {?}
     */
    function (label, firstValue) {
        if (firstValue === void 0) { firstValue = true; }
        /** @type {?} */
        var label$ = this._labels[label];
        if (firstValue) {
            return label$
                .pipe(first());
        }
        return label$;
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.updateSize = /**
     * @return {?}
     */
    function () {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._destroy$.next();
        this._destroy$.complete();
        this._isDestroyed = true;
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.clear = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    GoldenLayoutComponent.prototype.unloadNotification = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        this.closePopups();
    };
    /**
     * @return {?}
     */
    GoldenLayoutComponent.prototype.destroy = /**
     * @return {?}
     */
    function () {
        this.closePopups();
        this._destroy$.next();
        this._destroy$.complete();
    };
    /**
     * @private
     * @param {?} componentName
     * @param {?} componentState
     * @return {?}
     */
    GoldenLayoutComponent.prototype._createComponentContentItemConfig = /**
     * @private
     * @param {?} componentName
     * @param {?} componentState
     * @return {?}
     */
    function (componentName, componentState) {
        return {
            type: 'component',
            id: (new Date()).getTime().toString(),
            componentName: componentName,
            componentState: {
                componentState: componentState
            }
        };
    };
    GoldenLayoutComponent.stateVersion = '1'; // also need change in saved workspaces
    GoldenLayoutComponent.decorators = [
        { type: Component, args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'golden-layout',
                    template: "<div class=\"golden-layout\">\n    <div class=\"ng-golden-layout-root\" #glroot [ngClass]=\"{invisible: isLayoutEmpty}\"></div>\n    <div class=\"placeholder\" [ngClass]=\"{invisible: !isLayoutEmpty}\">\n        <ng-content></ng-content>\n    </div>\n</div>\n",
                    providers: [],
                    styles: ["a{background-color:red}::ng-deep .lm_root{position:relative}::ng-deep .lm_row>.lm_item{float:left}::ng-deep .lm_content{overflow:hidden;position:relative}::ng-deep .lm_dragging,::ng-deep .lm_dragging *{cursor:move!important;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}::ng-deep .lm_maximised{position:absolute;top:0;left:0;z-index:40}::ng-deep .lm_maximise_placeholder{display:none}::ng-deep .lm_splitter{position:relative;z-index:20}::ng-deep .lm_splitter.lm_vertical .lm_drag_handle{width:100%;position:absolute;cursor:ns-resize}::ng-deep .lm_splitter.lm_horizontal{float:left;height:100%}::ng-deep .lm_splitter.lm_horizontal .lm_drag_handle{height:100%;position:absolute;cursor:ew-resize}::ng-deep .lm_header{overflow:visible;position:relative}::ng-deep .lm_header [class^=lm_]{box-sizing:content-box!important}::ng-deep .lm_header .lm_controls{position:absolute;right:3px}::ng-deep .lm_header .lm_controls>li{cursor:pointer;float:left;width:18px;height:18px;text-align:center}::ng-deep .lm_header ul{margin:0;padding:0;list-style-type:none}::ng-deep .lm_header .lm_tabs{position:absolute}::ng-deep .lm_header .lm_tab{cursor:pointer;float:left;margin-top:1px;padding:2px 25px 7px 10px;position:relative}::ng-deep .lm_header .lm_tab i{width:2px;height:19px;position:absolute}::ng-deep .lm_header .lm_tab i.lm_left{top:0;left:-2px}::ng-deep .lm_header .lm_tab i.lm_right{top:0;right:-2px}::ng-deep .lm_header .lm_tab .lm_title{display:inline-block;overflow:hidden;text-overflow:ellipsis}::ng-deep .lm_header .lm_tab .lm_close_tab{width:14px;height:14px;position:absolute;top:0;right:11px;text-align:center}::ng-deep .lm_stack.lm_left .lm_header,::ng-deep .lm_stack.lm_right .lm_header{height:100%}::ng-deep .lm_dragProxy.lm_left .lm_header,::ng-deep .lm_dragProxy.lm_right .lm_header,::ng-deep .lm_stack.lm_left .lm_header,::ng-deep .lm_stack.lm_right .lm_header{width:20px;float:left;vertical-align:top}::ng-deep .lm_dragProxy.lm_left .lm_header .lm_tabs,::ng-deep .lm_dragProxy.lm_right .lm_header .lm_tabs,::ng-deep .lm_stack.lm_left .lm_header .lm_tabs,::ng-deep .lm_stack.lm_right .lm_header .lm_tabs{-webkit-transform-origin:left top;transform-origin:left top;top:0;width:1000px}::ng-deep .lm_dragProxy.lm_left .lm_header .lm_controls,::ng-deep .lm_dragProxy.lm_right .lm_header .lm_controls,::ng-deep .lm_stack.lm_left .lm_header .lm_controls,::ng-deep .lm_stack.lm_right .lm_header .lm_controls{bottom:0}::ng-deep .lm_dragProxy.lm_left .lm_items,::ng-deep .lm_dragProxy.lm_right .lm_items,::ng-deep .lm_stack.lm_left .lm_items,::ng-deep .lm_stack.lm_right .lm_items{float:left}::ng-deep .lm_dragProxy.lm_left .lm_header .lm_tabs,::ng-deep .lm_stack.lm_left .lm_header .lm_tabs{-webkit-transform:rotate(-90deg) scaleX(-1);transform:rotate(-90deg) scaleX(-1);left:0}::ng-deep .lm_dragProxy.lm_left .lm_header .lm_tabs .lm_tab,::ng-deep .lm_stack.lm_left .lm_header .lm_tabs .lm_tab{-webkit-transform:scaleX(-1);transform:scaleX(-1);margin-top:1px}::ng-deep .lm_dragProxy.lm_left .lm_header .lm_tabdropdown_list,::ng-deep .lm_stack.lm_left .lm_header .lm_tabdropdown_list{top:initial;right:initial;left:20px}::ng-deep .lm_dragProxy.lm_right .lm_content{float:left}::ng-deep .lm_dragProxy.lm_right .lm_header .lm_tabs,::ng-deep .lm_stack.lm_right .lm_header .lm_tabs{-webkit-transform:rotate(90deg) scaleX(1);transform:rotate(90deg) scaleX(1);left:100%;margin-left:0}::ng-deep .lm_dragProxy.lm_right .lm_header .lm_controls,::ng-deep .lm_stack.lm_right .lm_header .lm_controls{left:3px}::ng-deep .lm_dragProxy.lm_right .lm_header .lm_tabdropdown_list,::ng-deep .lm_stack.lm_right .lm_header .lm_tabdropdown_list{top:initial;right:20px}::ng-deep .lm_dragProxy.lm_bottom .lm_header .lm_tab,::ng-deep .lm_stack.lm_bottom .lm_header .lm_tab{margin-top:0;border-top:none}::ng-deep .lm_dragProxy.lm_bottom .lm_header .lm_controls,::ng-deep .lm_stack.lm_bottom .lm_header .lm_controls{top:3px}::ng-deep .lm_dragProxy.lm_bottom .lm_header .lm_tabdropdown_list,::ng-deep .lm_stack.lm_bottom .lm_header .lm_tabdropdown_list{top:initial;bottom:20px}::ng-deep .lm_drop_tab_placeholder{float:left;width:100px;height:10px;visibility:hidden}::ng-deep .lm_header .lm_controls .lm_tabdropdown:before{content:\"\";width:0;height:0;vertical-align:middle;display:inline-block;border-top:5px dashed;border-right:5px solid transparent;border-left:5px solid transparent;color:#fff}::ng-deep .lm_header .lm_tabdropdown_list{position:absolute;top:20px;right:0;z-index:5;overflow:hidden}::ng-deep .lm_header .lm_tabdropdown_list .lm_tab{width:100%;clear:both;padding-right:10px;margin:0}::ng-deep .lm_header .lm_tabdropdown_list .lm_tab .lm_title{width:100%;min-width:60px}::ng-deep .lm_header .lm_tabdropdown_list .lm_close_tab{display:none!important}::ng-deep .lm_header .lm_add-component{width:24px;display:-webkit-inline-box;display:inline-flex;-webkit-box-pack:center;justify-content:center;-webkit-box-align:center;align-items:center;margin-top:1px;cursor:pointer;background-position:center center;background-repeat:no-repeat;background-size:10px 10px}::ng-deep .lm_dragProxy{position:absolute;top:0;left:0}::ng-deep .lm_dragProxy .lm_header{background:0 0}::ng-deep .lm_dragProxy .lm_content{border-top:none;overflow:hidden}::ng-deep .lm_dropTargetIndicator{display:none;position:absolute}::ng-deep .lm_dropTargetIndicator .lm_inner{width:100%;height:100%;position:relative;top:0;left:0}::ng-deep .lm_transition_indicator{display:none;width:20px;height:20px;position:absolute;top:0;left:0;z-index:20}:host{display:-webkit-box;display:flex;width:100%}:host .ng-golden-layout-root{width:100%;height:100%}.golden-layout{display:-webkit-box;display:flex;width:100%;-webkit-box-orient:vertical;-webkit-box-direction:normal;flex-direction:column;position:relative}::ng-deep .lm_items{z-index:0;position:relative}::ng-deep .lm_header{z-index:1;min-width:270px;height:28px}::ng-deep .lm_header .lm_tabdropdown_list{max-height:200px;overflow-y:auto;border:1px solid rgba(83,82,82,.37)}::ng-deep .lm_header .lm_tab{height:18px;padding-bottom:4px;padding-top:5px;padding-right:35px;margin-right:1px;box-shadow:none;border-top-right-radius:3px}::ng-deep .lm_header .lm_tab:not(.closable-tab){padding-right:10px}::ng-deep .lm_header .lm_title{font-size:12px;white-space:nowrap;max-width:100px}::ng-deep .lm_header .lm_add-component{height:25px}::ng-deep .lm_header .lm_close_tab{z-index:2}::ng-deep .lm_header .lm_tab_drag{z-index:1}::ng-deep .lm_header .gl-icon{width:9px;height:9px}::ng-deep .lm_controls{top:50%;-webkit-transform:translateY(-50%)!important;transform:translateY(-50%)!important;right:9px!important}::ng-deep .lm_controls>li{opacity:1!important}::ng-deep .lm_controls>li:not(:last-of-type){margin-right:3px}::ng-deep .lm_add-component i{margin-top:2px}::ng-deep .lm_add-component i:before{font-weight:900}::ng-deep .lm_close_tab{top:3px!important}::ng-deep .lm_close_tab i{position:absolute;right:7px;top:4px;font-size:9px;cursor:pointer;opacity:.8}::ng-deep .lm_close_tab i:hover{opacity:1}::ng-deep .lm_dropTargetIndicator{z-index:1000}::ng-deep .lm_dragProxy{z-index:1001}.invisible{position:absolute;height:0;z-index:-999}"]
                }] }
    ];
    /** @nocollapse */
    GoldenLayoutComponent.ctorParameters = function () { return [
        { type: ViewContainerRef },
        { type: LayoutManagerService },
        { type: ComponentFactoryResolver },
        { type: NgZone },
        { type: ChangeDetectorRef },
        { type: ApplicationRef },
        { type: Injector },
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentConfiguration,] }] }
    ]; };
    GoldenLayoutComponent.propDecorators = {
        el: [{ type: ViewChild, args: ['glroot', { static: false },] }],
        onResize: [{ type: HostListener, args: ['window:resize', ['$event'],] }],
        unloadNotification: [{ type: HostListener, args: ['window:unload', ['$event'],] }]
    };
    return GoldenLayoutComponent;
}());
if (false) {
    /** @type {?} */
    GoldenLayoutComponent.stateVersion;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype.el;
    /** @type {?} */
    GoldenLayoutComponent.prototype.popupsWindows;
    /** @type {?} */
    GoldenLayoutComponent.prototype.$onAddComponent;
    /** @type {?} */
    GoldenLayoutComponent.prototype.$layoutEmpty;
    /** @type {?} */
    GoldenLayoutComponent.prototype.$stateChanged;
    /** @type {?} */
    GoldenLayoutComponent.prototype.goldenLayout;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._destroy$;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._labels;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._resize$;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._suppressChangeDetection;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._isDestroyed;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype.viewContainer;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._layoutManager;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype.componentFactoryResolver;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype.ngZone;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._changeDetectorRef;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._appRef;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype.injector;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutComponent.prototype._configuration;
}

/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout-popup/golden-layout-popup.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var __Holder = /** @class */ (function () {
    function __Holder(configuration) {
        this.configuration = configuration;
    }
    __Holder.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    __Holder.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: SkipSelf }, { type: Inject, args: [GoldenLayoutComponentConfiguration,] }] }
    ]; };
    return __Holder;
}());
if (false) {
    /** @type {?} */
    __Holder.prototype.configuration;
}
/**
 * @param {?} injector
 * @param {?} holder
 * @return {?}
 */
function configurationFactory(injector, holder) {
    /** @type {?} */
    var configuration = holder.configuration;
    /** @type {?} */
    var popupConfiguration = (/** @type {?} */ (((/** @type {?} */ (window)))[PopupWindowConfigKey]));
    return (/** @type {?} */ ({
        settings: __assign({}, configuration.settings, { popinHandler: (/**
             * @param {?} componentConfig
             * @return {?}
             */
            function (componentConfig) {
                delete componentConfig['width'];
                popupConfiguration.popin(componentConfig);
            }) }),
        labels: configuration.labels,
        components: configuration.components
    }));
}
var GoldenLayoutPopupComponent = /** @class */ (function () {
    function GoldenLayoutPopupComponent(_appRef) {
        var _this = this;
        this._appRef = _appRef;
        this._suppressChangeDetection = false;
        this._destroy = new Subject();
        /** @type {?} */
        var popupConfiguration = (/** @type {?} */ (((/** @type {?} */ (window)))[PopupWindowConfigKey]));
        popupConfiguration.needRunChangeDetection
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        function () {
            _this._suppressChangeDetection = true;
            _this._appRef.tick();
            _this._suppressChangeDetection = false;
        }));
        this._popupConfiguration = popupConfiguration;
        this._componentConfig = popupConfiguration.componentConfig;
    }
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
    };
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        if (!this._suppressChangeDetection) {
            this._popupConfiguration.runChangeDetectionInRootWindow();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngAfterViewInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.layout.loadState(GoldenLayoutComponent.getSingleComponentLayoutConfig(this._componentConfig));
        this.layout.$stateChanged
            .pipe(takeUntil(this._destroy))
            .subscribe((/**
         * @return {?}
         */
        function () {
            if (_this.layout.getAllComponents().length === 0) {
                window.close();
                return;
            }
            _this._popupConfiguration.fireStateChanged();
        }));
        this._popupConfiguration.onLayoutCreated(this.layout);
    };
    /**
     * @return {?}
     */
    GoldenLayoutPopupComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._destroy.next();
        this._destroy.complete();
    };
    GoldenLayoutPopupComponent.decorators = [
        { type: Component, args: [{
                    selector: 'golden-layout-popup',
                    template: "<golden-layout></golden-layout>\n",
                    providers: [
                        __Holder,
                        {
                            provide: GoldenLayoutComponentConfiguration,
                            useFactory: configurationFactory,
                            deps: [
                                Injector,
                                __Holder
                            ]
                        }
                    ],
                    styles: [":host{display:block;height:100%}:host golden-layout{height:100%}"]
                }] }
    ];
    /** @nocollapse */
    GoldenLayoutPopupComponent.ctorParameters = function () { return [
        { type: ApplicationRef }
    ]; };
    GoldenLayoutPopupComponent.propDecorators = {
        layout: [{ type: ViewChild, args: [GoldenLayoutComponent, { static: false },] }]
    };
    return GoldenLayoutPopupComponent;
}());
if (false) {
    /** @type {?} */
    GoldenLayoutPopupComponent.prototype.layout;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._popupConfiguration;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._componentConfig;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._suppressChangeDetection;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._destroy;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutPopupComponent.prototype._appRef;
}

/**
 * @fileoverview added by tsickle
 * Generated from: lib/golden-layout-item.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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

/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout-item-container/golden-layout-item-container.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @enum {number} */
var LoadComponentState = {
    Loading: 0,
    Success: 1,
    Failed: 2,
};
LoadComponentState[LoadComponentState.Loading] = 'Loading';
LoadComponentState[LoadComponentState.Success] = 'Success';
LoadComponentState[LoadComponentState.Failed] = 'Failed';
var GoldenLayoutItemContainerComponent = /** @class */ (function (_super) {
    __extends(GoldenLayoutItemContainerComponent, _super);
    function GoldenLayoutItemContainerComponent(_container, _componentResolver, _configuration, _componentFactoryResolver, _injector) {
        var _this = _super.call(this, _injector) || this;
        _this._container = _container;
        _this._componentResolver = _componentResolver;
        _this._configuration = _configuration;
        _this._componentFactoryResolver = _componentFactoryResolver;
        _this._injector = _injector;
        _this.LoadComponentState = LoadComponentState;
        return _this;
    }
    Object.defineProperty(GoldenLayoutItemContainerComponent.prototype, "loadingLabel", {
        get: /**
         * @return {?}
         */
        function () {
            return (this._configuration.labels && this._configuration.labels.loading)
                ? this._configuration.labels.loading
                : DefaultLabels.loading;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GoldenLayoutItemContainerComponent.prototype, "failedToLoadLabel", {
        get: /**
         * @return {?}
         */
        function () {
            return (this._configuration.labels && this._configuration.labels.failedToLoadComponent)
                ? this._configuration.labels.failedToLoadComponent
                : DefaultLabels.failedToLoadComponent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        this.setTitle(of('')); // fix
        this.setTitle(this.loadingLabel);
        if (((/** @type {?} */ (this._componentResolver))).factory != null) {
            this.loadComponentState = LoadComponentState.Loading;
            ((/** @type {?} */ (this._componentResolver))).factory()
                .subscribe({
                next: (/**
                 * @param {?} factory
                 * @return {?}
                 */
                function (factory) {
                    _this.setTitle(of(_this._componentResolver.componentName));
                    /** @type {?} */
                    var ref = _this.componentContainer.createComponent(factory, undefined, _this._injector);
                    ref.changeDetectorRef.detectChanges();
                    _this._layoutItem = (/** @type {?} */ (ref.instance));
                    if (_this._tabElement) {
                        _this._layoutItem.onTabCreated(_this._tabElement);
                    }
                    _this.loadComponentState = LoadComponentState.Success;
                }),
                error: (/**
                 * @param {?} e
                 * @return {?}
                 */
                function (e) {
                    console.error(e);
                    _this.loadComponentState = LoadComponentState.Failed;
                    _this.setTitle(_this.failedToLoadLabel);
                })
            });
        }
        else {
            this.setTitle(of(this._componentResolver.componentName));
            /** @type {?} */
            var componentFactory = this._componentFactoryResolver.resolveComponentFactory(((/** @type {?} */ (this._componentResolver))).component);
            /** @type {?} */
            var ref = this.componentContainer.createComponent(componentFactory, undefined, this._injector);
            ref.changeDetectorRef.detectChanges();
            this._layoutItem = (/** @type {?} */ (ref.instance));
            if (this._tabElement) {
                this._layoutItem.onTabCreated(this._tabElement);
            }
            this.loadComponentState = LoadComponentState.Success;
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.saveState = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            return this._layoutItem.saveState();
        }
        return {};
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onResize = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            this._layoutItem.onResize();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onShow = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            this._layoutItem.onShow();
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onHide = /**
     * @return {?}
     */
    function () {
        if (this._layoutItem) {
            this._layoutItem.onHide();
        }
    };
    /**
     * @param {?} tabElement
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onTabCreated = /**
     * @param {?} tabElement
     * @return {?}
     */
    function (tabElement) {
        if (this._layoutItem) {
            this._layoutItem.onTabCreated(tabElement);
        }
        this._tabElement = tabElement;
    };
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onContainerMaximized = /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    function (isOwnContainer) {
        if (this._layoutItem) {
            this._layoutItem.onContainerMaximized(isOwnContainer);
        }
    };
    /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.onContainerMinimized = /**
     * @param {?} isOwnContainer
     * @return {?}
     */
    function (isOwnContainer) {
        if (this._layoutItem) {
            this._layoutItem.onContainerMinimized(isOwnContainer);
        }
    };
    /**
     * @return {?}
     */
    GoldenLayoutItemContainerComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
    };
    GoldenLayoutItemContainerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'golden-layout-item-container',
                    template: "<div class=\"root\">\n    <div class=\"component-wrapper\">\n        <div class=\"loader-wrapper flex align-items-center justify-content-center\" *ngIf=\"loadComponentState === LoadComponentState.Failed || loadComponentState === LoadComponentState.Loading\">\n            <span *ngIf=\"loadComponentState === LoadComponentState.Loading\">{{loadingLabel | async}}</span>\n            <span *ngIf=\"loadComponentState === LoadComponentState.Failed\">{{failedToLoadLabel | async}}</span>\n        </div>\n        <template #componentContainer></template>\n    </div>\n</div>\n",
                    styles: [".component-wrapper,.loader-wrapper,.root{width:100%;height:100%}.loader-wrapper span{font-size:14px}template+*{width:100%;height:100%}"]
                }] }
    ];
    /** @nocollapse */
    GoldenLayoutItemContainerComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutContainer,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutItemComponentResolver,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentConfiguration,] }] },
        { type: ComponentFactoryResolver },
        { type: Injector }
    ]; };
    GoldenLayoutItemContainerComponent.propDecorators = {
        componentContainer: [{ type: ViewChild, args: ["componentContainer", { read: ViewContainerRef, static: true },] }]
    };
    return GoldenLayoutItemContainerComponent;
}(GoldenLayoutItem));
if (false) {
    /** @type {?} */
    GoldenLayoutItemContainerComponent.prototype.componentContainer;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._layoutItem;
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItemContainerComponent.prototype._tabElement;
    /** @type {?} */
    GoldenLayoutItemContainerComponent.prototype.loadComponentState;
    /** @type {?} */
    GoldenLayoutItemContainerComponent.prototype.LoadComponentState;
    /**
     * @type {?}
     * @protected
     */
    GoldenLayoutItemContainerComponent.prototype._container;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._componentResolver;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._configuration;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._componentFactoryResolver;
    /**
     * @type {?}
     * @private
     */
    GoldenLayoutItemContainerComponent.prototype._injector;
}

/**
 * @fileoverview added by tsickle
 * Generated from: lib/layout.module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var ɵ0 = GoldenLayoutItemContainerComponent;
var GoldenLayoutModule = /** @class */ (function () {
    function GoldenLayoutModule() {
    }
    /**
     * @return {?}
     */
    GoldenLayoutModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: GoldenLayoutModule,
            providers: [
                LayoutManagerService
            ]
        };
    };
    GoldenLayoutModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [GoldenLayoutComponent, GoldenLayoutItemContainerComponent, GoldenLayoutPopupComponent],
                    exports: [GoldenLayoutComponent, GoldenLayoutItemContainerComponent, GoldenLayoutPopupComponent],
                    imports: [CommonModule],
                    entryComponents: [
                        GoldenLayoutItemContainerComponent
                    ],
                    providers: [
                        {
                            provide: GoldenLayoutItemContainerToken,
                            useValue: ɵ0
                        }
                    ]
                },] }
    ];
    return GoldenLayoutModule;
}());

/**
 * @fileoverview added by tsickle
 * Generated from: lib/models/configuration.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
function IGoldenLayoutComponentSettings() { }
if (false) {
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.hasHeaders;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.constrainDragToContainer;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.reorderEnabled;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.selectionEnabled;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.showPopoutIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getPopoutIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.showPopinIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getPopinIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.showMaximiseIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getMaximiseIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getMinimiseIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.showAddBtn;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getAddComponentBtnIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.showCloseIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getCloseIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.showCloseTabIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.getCloseTabIcon;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.dimensions;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.tabControlOffset;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.popupWindowUrl;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.popinHandler;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.openPopupHook;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.openPopupFailureHandler;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.responsiveMode;
    /** @type {?|undefined} */
    IGoldenLayoutComponentSettings.prototype.canOpenPopupWindow;
}
/**
 * @record
 */
function GoldenLayoutLabels() { }
if (false) {
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.addComponent;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.additionalTabs;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.maximise;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.minimise;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.popout;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.popin;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.close;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.loading;
    /** @type {?|undefined} */
    GoldenLayoutLabels.prototype.failedToLoadComponent;
}
/**
 * @record
 */
function IComponentTypeResolver() { }
if (false) {
    /** @type {?} */
    IComponentTypeResolver.prototype.componentName;
    /** @type {?} */
    IComponentTypeResolver.prototype.component;
}
/**
 * @record
 */
function IComponentFactoryResolver() { }
if (false) {
    /** @type {?} */
    IComponentFactoryResolver.prototype.componentName;
    /** @type {?} */
    IComponentFactoryResolver.prototype.factory;
}
/**
 * @record
 */
function IGoldenLayoutComponentConfiguration() { }
if (false) {
    /** @type {?} */
    IGoldenLayoutComponentConfiguration.prototype.settings;
    /** @type {?|undefined} */
    IGoldenLayoutComponentConfiguration.prototype.labels;
    /** @type {?} */
    IGoldenLayoutComponentConfiguration.prototype.components;
}

/**
 * @fileoverview added by tsickle
 * Generated from: lib/models/golden-layout-component-state.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @record
 */
function IGoldenLayoutComponentState() { }
if (false) {
    /** @type {?} */
    IGoldenLayoutComponentState.prototype.version;
    /** @type {?|undefined} */
    IGoldenLayoutComponentState.prototype.openPopups;
}

/**
 * @fileoverview added by tsickle
 * Generated from: public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * Generated from: angular-golden-layout.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { DefaultLabels, GoldenLayoutComponent, GoldenLayoutComponentConfiguration, GoldenLayoutItem, GoldenLayoutItemState, GoldenLayoutModule, GoldenLayoutPopupComponent, LayoutManagerService, __Holder, configurationFactory, GoldenLayoutItemContainerComponent as ɵa, GoldenLayoutContainer as ɵb, GoldenLayoutItemComponentResolver as ɵc, GoldenLayoutItemContainerToken as ɵd };
//# sourceMappingURL=angular-golden-layout.js.map
