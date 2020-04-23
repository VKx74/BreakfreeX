/**
 * @fileoverview added by tsickle
 * Generated from: lib/components/golden-layout/golden-layout.component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/// <reference path="../../../../libs/golden-layout.d.ts" />
/// <reference path="../../../../libs/golden-layout.d.ts" />
import { ApplicationRef, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, HostListener, Inject, Injector, NgZone, ReflectiveInjector, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, fromEvent, of, Subject } from "rxjs";
import { auditTime, filter, first, takeUntil } from "rxjs/operators";
import { GoldenLayoutContainer } from "../../tokens/golden-layout-container.token";
import { GoldenLayoutItemComponentResolver } from "../../tokens/golden-layout-item-component-factory.token";
import { LayoutManagerService } from "../../services/layout-manager.service";
import { PopupWindowManager } from "../../popup-window-manager";
import { GoldenLayoutItemContainerToken } from "../../tokens/golden-layout-item-container.token";
import { GoldenLayoutComponentConfiguration } from "../../tokens/golden-layout-configuration.token";
import { GoldenLayoutItemState } from '../../tokens/golden-layout-item-state.token';
/**
 * @record
 */
export function GoldenLayoutState() { }
/** @type {?} */
var COMPONENT_REF_KEY = '$componentRef';
/** @type {?} */
export var DefaultLabels = {
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
            for (var _b = tslib_1.__values(this._configuration.components), _c = _b.next(); !_c.done; _c = _b.next()) {
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
                        for (var _b = tslib_1.__values(state.openPopups), _c = _b.next(); !_c.done; _c = _b.next()) {
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
                                content: tslib_1.__spread(notOpenedPopupsComponents)
                            }
                        ];
                    }
                    else {
                        state.content = [
                            {
                                type: "row",
                                width: 100,
                                height: 100,
                                content: tslib_1.__spread([
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
                for (var _b = tslib_1.__values(stack.contentItems), _c = _b.next(); !_c.done; _c = _b.next()) {
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
            for (var _b = tslib_1.__values(stack.contentItems), _c = _b.next(); !_c.done; _c = _b.next()) {
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
            for (var _b = tslib_1.__values(this.getAllComponents()), _c = _b.next(); !_c.done; _c = _b.next()) {
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
        var state = tslib_1.__assign({}, this.goldenLayout.toConfig(), { openPopups: this.popupsWindows.map((/**
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_6, layoutRoot, row, temp;
            return tslib_1.__generator(this, function (_a) {
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var componentConfig;
            return tslib_1.__generator(this, function (_a) {
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var componentConfig;
            return tslib_1.__generator(this, function (_a) {
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
export { GoldenLayoutComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDREQUE0RDs7QUFFNUQsT0FBTyxFQUNILGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULHdCQUF3QixFQUV4QixVQUFVLEVBQ1YsWUFBWSxFQUFFLE1BQU0sRUFDcEIsUUFBUSxFQUNSLE1BQU0sRUFDTixrQkFBa0IsRUFFbEIsU0FBUyxFQUNULGdCQUFnQixFQUNuQixNQUFNLGVBQWUsQ0FBQztBQUl2QixPQUFPLEVBQUMsZUFBZSxFQUFFLFNBQVMsRUFBYyxFQUFFLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw0Q0FBNEMsQ0FBQztBQUNqRixPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx5REFBeUQsQ0FBQztBQUUxRyxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUMzRSxPQUFPLEVBQTRCLGtCQUFrQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFekYsT0FBTyxFQUFDLDhCQUE4QixFQUFDLE1BQU0saURBQWlELENBQUM7QUFDL0YsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDbEcsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sNkNBQTZDLENBQUM7Ozs7QUFLbEYsdUNBQ0M7O0lBRUssaUJBQWlCLEdBQUcsZUFBZTs7QUFDekMsTUFBTSxLQUFPLGFBQWEsR0FBdUI7SUFDN0Ms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K0NBQXVHIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uLy4uL2xpYnMvZ29sZGVuLWxheW91dC5kLnRzXCIgLz5cblxuaW1wb3J0IHtcbiAgICBBcHBsaWNhdGlvblJlZixcbiAgICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBDb21wb25lbnQsXG4gICAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIENvbXBvbmVudFJlZixcbiAgICBFbGVtZW50UmVmLFxuICAgIEhvc3RMaXN0ZW5lciwgSW5qZWN0LFxuICAgIEluamVjdG9yLFxuICAgIE5nWm9uZSxcbiAgICBSZWZsZWN0aXZlSW5qZWN0b3IsXG4gICAgVHlwZSxcbiAgICBWaWV3Q2hpbGQsXG4gICAgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tcG9uZW50UmVzb2x2ZXIsIEdvbGRlbkxheW91dExhYmVscywgSUdvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb259IGZyb20gJy4uLy4uL21vZGVscy9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7SUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlfSBmcm9tIFwiLi4vLi4vbW9kZWxzL2dvbGRlbi1sYXlvdXQtY29tcG9uZW50LXN0YXRlXCI7XG5pbXBvcnQgQ29udGFpbmVyID0gR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRhaW5lcjtcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBmcm9tRXZlbnQsIE9ic2VydmFibGUsIG9mLCBTdWJqZWN0fSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHthdWRpdFRpbWUsIGZpbHRlciwgZmlyc3QsIHRha2VVbnRpbH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dENvbnRhaW5lcn0gZnJvbSBcIi4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWNvbnRhaW5lci50b2tlblwiO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRJdGVtQ29tcG9uZW50UmVzb2x2ZXJ9IGZyb20gXCIuLi8uLi90b2tlbnMvZ29sZGVuLWxheW91dC1pdGVtLWNvbXBvbmVudC1mYWN0b3J5LnRva2VuXCI7XG5cbmltcG9ydCB7TGF5b3V0TWFuYWdlclNlcnZpY2V9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9sYXlvdXQtbWFuYWdlci5zZXJ2aWNlXCI7XG5pbXBvcnQge0lQb3B1cFdpbmRvd01hbmFnZXJDb25maWcsIFBvcHVwV2luZG93TWFuYWdlcn0gZnJvbSBcIi4uLy4uL3BvcHVwLXdpbmRvdy1tYW5hZ2VyXCI7XG5pbXBvcnQgQ29tcG9uZW50Q29uZmlnID0gR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbXBvbmVudENvbmZpZztcbmltcG9ydCB7R29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lclRva2VufSBmcm9tIFwiLi4vLi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtaXRlbS1jb250YWluZXIudG9rZW5cIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbn0gZnJvbSBcIi4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWNvbmZpZ3VyYXRpb24udG9rZW5cIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0SXRlbVN0YXRlfSBmcm9tICcuLi8uLi90b2tlbnMvZ29sZGVuLWxheW91dC1pdGVtLXN0YXRlLnRva2VuJztcbmltcG9ydCB7SUdvbGRlbkxheW91dEl0ZW19IGZyb20gJy4uLy4uL21vZGVscy9nb2xkZW4tbGF5b3V0LWl0ZW0nO1xuXG5leHBvcnQgdHlwZSBDb21wb25lbnRJbml0Q2FsbGJhY2sgPSAoY29udGFpbmVyOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGFpbmVyLCBjb21wb25lbnRTdGF0ZTogYW55KSA9PiB2b2lkO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdvbGRlbkxheW91dFN0YXRlIGV4dGVuZHMgSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlLCBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29uZmlnIHtcbn1cblxuY29uc3QgQ09NUE9ORU5UX1JFRl9LRVkgPSAnJGNvbXBvbmVudFJlZic7XG5leHBvcnQgY29uc3QgRGVmYXVsdExhYmVsczogR29sZGVuTGF5b3V0TGFiZWxzID0ge1xuICAgIGFkZGl0aW9uYWxUYWJzOiBvZignQWRkaXRpb25hbCB0YWJzJyksXG4gICAgYWRkQ29tcG9uZW50OiBvZignQWRkIENvbXBvbmVudCcpLFxuICAgIG1heGltaXNlOiBvZignTWF4aW1pc2UnKSxcbiAgICBtaW5pbWlzZTogb2YoJ01pbmltaXNlJyksXG4gICAgcG9wb3V0OiBvZignT3BlbiBpbiBuZXcgd2luZG93JyksXG4gICAgcG9waW46IG9mKCdQb3AgaW4nKSxcbiAgICBjbG9zZTogb2YoJ0Nsb3NlJyksXG4gICAgbG9hZGluZzogb2YoJ0xvYWRpbmcnKSxcbiAgICBmYWlsZWRUb0xvYWRDb21wb25lbnQ6IG9mKCdGYWlsZWQgdG8gbG9hZCBjb21wb25lbnQnKVxufTtcbmNvbnN0IENsYXNzID0ge1xuICAgIHRhYnNEcm9wZG93bjogJ2xtX3RhYmRyb3Bkb3duJyxcbiAgICBhZGRDb21wb25lbnQ6ICdsbV9hZGQtY29tcG9uZW50JyxcbiAgICBjbG9zZTogJ2xtX2Nsb3NlJyxcbiAgICBjbG9zZVRhYjogJ2xtX2Nsb3NlX3RhYicsXG4gICAgbWF4aW1pc2U6ICdsbV9tYXhpbWlzZScsXG4gICAgcG9wb3V0OiAnbG1fcG9wb3V0JyxcbiAgICBwb3BpbjogJ2xtX3BvcGluJyxcbiAgICB0YWJEcmFnOiAnbG1fdGFiX2RyYWcnLFxuICAgIENsb3NhYmxlVGFiOiAnY2xvc2FibGUtdGFiJ1xufTtcblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgICBzZWxlY3RvcjogJ2dvbGRlbi1sYXlvdXQnLFxuICAgIHRlbXBsYXRlVXJsOiAnZ29sZGVuLWxheW91dC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbXG4gICAgICAgICdnb2xkZW4tbGF5b3V0LmNvbXBvbmVudC5zY3NzJ1xuICAgIF0sXG4gICAgcHJvdmlkZXJzOiBbXVxufSlcbmV4cG9ydCBjbGFzcyBHb2xkZW5MYXlvdXRDb21wb25lbnQge1xuICAgIHN0YXRpYyBzdGF0ZVZlcnNpb24gPSAnMSc7IC8vIGFsc28gbmVlZCBjaGFuZ2UgaW4gc2F2ZWQgd29ya3NwYWNlc1xuICAgIEBWaWV3Q2hpbGQoJ2dscm9vdCcsIHtzdGF0aWM6IGZhbHNlfSkgcHJpdmF0ZSBlbDogRWxlbWVudFJlZjtcblxuICAgIHBvcHVwc1dpbmRvd3M6IFBvcHVwV2luZG93TWFuYWdlcltdID0gW107XG4gICAgJG9uQWRkQ29tcG9uZW50ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuICAgICRsYXlvdXRFbXB0eSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuICAgICRzdGF0ZUNoYW5nZWQgPSBuZXcgU3ViamVjdCgpO1xuICAgIGdvbGRlbkxheW91dDogR29sZGVuTGF5b3V0O1xuXG4gICAgcHJpdmF0ZSBfZGVzdHJveSQgPSBuZXcgU3ViamVjdCgpO1xuICAgIHByaXZhdGUgX2xhYmVsczogR29sZGVuTGF5b3V0TGFiZWxzID0gRGVmYXVsdExhYmVscztcbiAgICBwcml2YXRlIF9yZXNpemUkID0gbmV3IFN1YmplY3QoKTtcbiAgICBwcml2YXRlIF9zdXBwcmVzc0NoYW5nZURldGVjdGlvbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2lzRGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBnZXQgaXNMYXlvdXRFbXB0eSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGxheW91dEVtcHR5LmdldFZhbHVlKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFNpbmdsZUNvbXBvbmVudExheW91dENvbmZpZyhjb21wb25lbnRDb25maWc6IENvbXBvbmVudENvbmZpZyk6IElHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2ZXJzaW9uOiBHb2xkZW5MYXlvdXRDb21wb25lbnQuc3RhdGVWZXJzaW9uLFxuICAgICAgICAgICAgY29udGVudDogW1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudENvbmZpZ1xuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIF9sYXlvdXRNYW5hZ2VyOiBMYXlvdXRNYW5hZ2VyU2VydmljZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgbmdab25lOiBOZ1pvbmUsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgX2FwcFJlZjogQXBwbGljYXRpb25SZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgQEluamVjdChHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uKSBwcml2YXRlIF9jb25maWd1cmF0aW9uOiBJR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbikge1xuICAgICAgICB0aGlzLl9sYXlvdXRNYW5hZ2VyLnNldExheW91dCh0aGlzKTtcbiAgICAgICAgdGhpcy5fc2V0TGFiZWxzKHRoaXMuX2NvbmZpZ3VyYXRpb24ubGFiZWxzID8gT2JqZWN0LmFzc2lnbih7fSwgRGVmYXVsdExhYmVscywgdGhpcy5fY29uZmlndXJhdGlvbi5sYWJlbHMpIDogRGVmYXVsdExhYmVscyk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZSRcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgIGF1ZGl0VGltZSgxMCksXG4gICAgICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kkKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ29sZGVuTGF5b3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBuZ0RvQ2hlY2soKSB7XG4gICAgICAgIGlmICghdGhpcy5fc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMucG9wdXBzV2luZG93cy5mb3JFYWNoKHcgPT4gdy5ydW5DaGFuZ2VEZXRlY3Rpb24oKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWdpc3RlckNvbXBvbmVudHMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIHRoaXMuX2NvbmZpZ3VyYXRpb24uY29tcG9uZW50cykge1xuICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQucmVnaXN0ZXJDb21wb25lbnQoXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbXBvbmVudE5hbWUsXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVDb21wb25lbnRJbml0Q2FsbGJhY2soY29tcG9uZW50KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUxheW91dChzdGF0ZTogR29sZGVuTGF5b3V0U3RhdGUpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBjcmVhdGVMYXlvdXQgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RPcGVuZWRQb3B1cHNDb21wb25lbnRzID0gW107XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUub3BlblBvcHVwcykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW1Db25maWcgb2Ygc3RhdGUub3BlblBvcHVwcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbmVkID0gdGhpcy5fb3BlblBvcHVwKGl0ZW1Db25maWcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9wZW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdE9wZW5lZFBvcHVwc0NvbXBvbmVudHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbUNvbmZpZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobm90T3BlbmVkUG9wdXBzQ29tcG9uZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNMYXlvdXRFbXB0eSA9IHN0YXRlLmNvbnRlbnQubGVuZ3RoID09PSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0xheW91dEVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jb250ZW50ID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3JvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5ub3RPcGVuZWRQb3B1cHNDb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuY29udGVudCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicm93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5jb250ZW50WzBdLCB7d2lkdGg6IDUwLCBoZWlnaHQ6IDEwMH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ubm90T3BlbmVkUG9wdXBzQ29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dCA9IG5ldyBHb2xkZW5MYXlvdXQoc3RhdGUgYXMgR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbmZpZywgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignc3RhdGVDaGFuZ2VkJywgKHYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ29sZGVuTGF5b3V0LmlzSW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHN0YXRlQ2hhbmdlZC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZ2lzdGVyQ29tcG9uZW50cygpO1xuXG4gICAgICAgICAgICAgICAgKHdpbmRvdyBhcyBhbnkpLmdsID0gdGhpcy5nb2xkZW5MYXlvdXQ7XG4gICAgICAgICAgICAgICAgKHdpbmRvdyBhcyBhbnkpLmdsYyA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignaXRlbUNyZWF0ZWQnLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVJdGVtQ3JlYXRlZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIERlc3RvcnkgY2hpbGQgYW5ndWxhciBjb21wb25lbnRzIG9uIGdvbGRlbi1oZWxwZXJzIGNvbnRhaW5lciBkZXN0cnVjdGlvbi5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignaXRlbURlc3Ryb3llZCcsIChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gaXRlbS5jb250YWluZXI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbnRhaW5lciAmJiBjb250YWluZXJbQ09NUE9ORU5UX1JFRl9LRVldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAoY29udGFpbmVyIGFzIGFueSlbQ09NUE9ORU5UX1JFRl9LRVldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQub24oJ3N0YWNrQ3JlYXRlZCcsIChzdGFjaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVTdGFja0NyZWF0ZWQoc3RhY2spO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQuZXZlbnRIdWIub24oJ3NlbGVjdGlvbkNoYW5nZWQnLCAoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5ldmVudEh1Yi5vbignY29sdW1uQ3JlYXRlZCcsIChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdpdGVtQ3JlYXRlZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbGF5b3V0RW1wdHkubmV4dChmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignaXRlbURlc3Ryb3llZCcsICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBfaWdub3JlZEl0ZW0gPSBudWxsOyAvLyBpdGVtIHRoYXQgd2lsbCBiZSByZXBsYWNlZFxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoaXRlbTogR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRlbnRJdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5wYXJlbnQgJiYgKGl0ZW0ucGFyZW50LmlzQ29sdW1uIHx8IGl0ZW0ucGFyZW50LmlzUm93KSAmJiBpdGVtLnBhcmVudC5jb250ZW50SXRlbXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lnbm9yZWRJdGVtID0gaXRlbS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtICE9PSBfaWdub3JlZEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0xheW91dEVtcHR5ID0gdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5jb250ZW50SXRlbXMuZmlsdGVyKChpKSA9PiBpICE9PSBpdGVtKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kbGF5b3V0RW1wdHkubmV4dChpc0xheW91dEVtcHR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkoKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignYmVmb3JlSXRlbURlc3Ryb3llZCcsIChpdGVtOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uaXNNYXhpbWlzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlTWF4aW1pc2UoKTsgLy8gZml4IGlzc3VlIHdpdGggZGVsZXRpbmcgbWF4aW1pc2VkIGNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignaW5pdGlhbGlzZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGxheW91dEVtcHR5Lm5leHQodGhpcy5nb2xkZW5MYXlvdXQucm9vdC5jb250ZW50SXRlbXMubGVuZ3RoID09PSAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuZ29sZGVuTGF5b3V0LnVwZGF0ZVNpemUoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBoZWxwZXJzLlxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LmluaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgLy8gdXNlIHRpbWVvdXQgZm9yIGNvcnJlY3Qgc2l6aW5nXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjcmVhdGVMYXlvdXQoKSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignd2luZG93OnJlc2l6ZScsIFsnJGV2ZW50J10pXG4gICAgcHVibGljIG9uUmVzaXplKGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVzaXplJC5uZXh0KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlSXRlbUNyZWF0ZWQoaXRlbTogR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRlbnRJdGVtKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5pc1N0YWNrICYmIHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2hvd0FkZEJ0biAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRDb21wb25lbnRCdG4gPSAkKGA8c3BhbiBjbGFzcz0nJHtDbGFzcy5hZGRDb21wb25lbnR9Jz48L3NwYW4+YCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9nZXRMYWJlbCgnYWRkQ29tcG9uZW50JylcbiAgICAgICAgICAgICAgICAgICAgLnN1YnNjcmliZSgobGFiZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZENvbXBvbmVudEJ0bi5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRBZGRDb21wb25lbnRCdG5JY29uKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZENvbXBvbmVudEJ0bi5hcHBlbmQodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRBZGRDb21wb25lbnRCdG5JY29uKCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICQoKGl0ZW0gYXMgYW55KS5oZWFkZXIudGFic0NvbnRhaW5lcikuYXBwZW5kKGFkZENvbXBvbmVudEJ0bik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBhZGRDb21wb25lbnRCdG4uY2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kb25BZGRDb21wb25lbnQubmV4dChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGl0ZW0ub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX2hhbmRsZVN0YWNrQ3JlYXRlZChzdGFjazogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnNob3dDbG9zZUljb24gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRDbG9zZUJ0bihzdGFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFjay5oZWFkZXIuY29udHJvbHNDb250YWluZXJcbiAgICAgICAgICAgICAgICAuZmluZChgLiR7Q2xhc3MuY2xvc2V9YCkuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2hvd01heGltaXNlSWNvbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZE1heGltaXplQnRuKHN0YWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5maW5kKGAuJHtDbGFzcy5tYXhpbWlzZX1gKS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zaG93UG9wb3V0SWNvbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFBvcG91dEJ0bihzdGFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGFjay5oZWFkZXIuY29udHJvbHNDb250YWluZXJcbiAgICAgICAgICAgICAgICAuZmluZChgLiR7Q2xhc3MucG9wb3V0fWApLmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2dldExhYmVsKCdhZGRpdGlvbmFsVGFicycpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICAuZmluZChgLiR7Q2xhc3MudGFic0Ryb3Bkb3dufWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2hvd1BvcGluSWNvbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZFBvcGluQnRuKHN0YWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVDb21wb25lbnRJbml0Q2FsbGJhY2soY29tcG9uZW50UmVzb2x2ZXI6IENvbXBvbmVudFJlc29sdmVyKTogQ29tcG9uZW50SW5pdENhbGxiYWNrIHtcbiAgICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb250YWluZXI6IENvbnRhaW5lciwgc3RhdGU6IGFueSkge1xuICAgICAgICAgICAgdGhhdC5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIGFuZ3VsYXIgY29tcG9uZW50LlxuXG4gICAgICAgICAgICAgICAgY29uc3QgZmFjdG9yeSA9IHRoYXQuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KHRoYXQuaW5qZWN0b3IuZ2V0KEdvbGRlbkxheW91dEl0ZW1Db250YWluZXJUb2tlbikgYXMgVHlwZTxJR29sZGVuTGF5b3V0SXRlbT4pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gdGhhdC5fY3JlYXRlQ29tcG9uZW50SW5qZWN0b3IoY29udGFpbmVyLCBzdGF0ZS5jb21wb25lbnRTdGF0ZSwgY29tcG9uZW50UmVzb2x2ZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHRoYXQudmlld0NvbnRhaW5lci5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSwgdW5kZWZpbmVkLCBpbmplY3Rvcik7XG5cbiAgICAgICAgICAgICAgICAvLyBCaW5kIHRoZSBuZXcgY29tcG9uZW50IHRvIGNvbnRhaW5lcidzIGNsaWVudCBET00gZWxlbWVudC5cbiAgICAgICAgICAgICAgICBjb250YWluZXIuZ2V0RWxlbWVudCgpLmFwcGVuZCgkKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KSk7XG5cbiAgICAgICAgICAgICAgICB0aGF0Ll9iaW5kRXZlbnRIb29rcyhjb250YWluZXIsIGNvbXBvbmVudFJlZik7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5faW5pdENvbXBvbmVudChjb250YWluZXIsIGNvbXBvbmVudFJlZi5pbnN0YW5jZSk7XG5cbiAgICAgICAgICAgICAgICAod2luZG93IGFzIGFueSkuY29udGFpbmVyID0gY29udGFpbmVyO1xuXG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgYSByZWYgdG8gdGhlIGNvbXBvZW5lbnRSZWYgaW4gdGhlIGNvbnRhaW5lciB0byBzdXBwb3J0IGRlc3RydWN0aW9uIGxhdGVyIG9uLlxuICAgICAgICAgICAgICAgIChjb250YWluZXIgYXMgYW55KVtDT01QT05FTlRfUkVGX0tFWV0gPSBjb21wb25lbnRSZWY7XG5cblxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGZhY3RvcnkgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShsYXlvdXRJdGVtQ2xhc3MpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGluamVjdG9yID0gdGhpcy5fY3JlYXRlQ29tcG9uZW50SW5qZWN0b3IoY29udGFpbmVyLCBzdGF0ZS5jb21wb25lbnRTdGF0ZSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3QgY29tcG9uZW50UmVmID0gdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCB1bmRlZmluZWQsIGluamVjdG9yKTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIC8vIEJpbmQgdGhlIG5ldyBjb21wb25lbnQgdG8gY29udGFpbmVyJ3MgY2xpZW50IERPTSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIC8vIGNvbnRhaW5lci5nZXRFbGVtZW50KCkuYXBwZW5kKCQoY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpKTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2JpbmRFdmVudEhvb2tzKGNvbnRhaW5lciwgY29tcG9uZW50UmVmKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9pbml0Q29tcG9uZW50KGNvbnRhaW5lciwgY29tcG9uZW50UmVmLmluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vICh3aW5kb3cgYXMgYW55KS5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyAvLyBTdG9yZSBhIHJlZiB0byB0aGUgY29tcG9lbmVudFJlZiBpbiB0aGUgY29udGFpbmVyIHRvIHN1cHBvcnQgZGVzdHJ1Y3Rpb24gbGF0ZXIgb24uXG4gICAgICAgICAgICAgICAgLy8gKGNvbnRhaW5lciBhcyBhbnkpW0NPTVBPTkVOVF9SRUZfS0VZXSA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBmaXJlU3RhdGVDaGFuZ2VkKCkge1xuICAgICAgICB0aGlzLiRzdGF0ZUNoYW5nZWQubmV4dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gaW5qZWN0b3IgY2FwYWJsZSBvZiBpbmplY3RpbmcgdGhlIExheW91dCBvYmplY3QsXG4gICAgICogY29tcG9uZW50IGNvbnRhaW5lciwgYW5kIGluaXRpYWwgY29tcG9uZW50IHN0YXRlLlxuICAgICAqL1xuICAgIHByaXZhdGUgX2NyZWF0ZUNvbXBvbmVudEluamVjdG9yKGNvbnRhaW5lcjogYW55LCBzdGF0ZTogYW55LCBjb21wb25lbnRSZXNvbHZlcjogQ29tcG9uZW50UmVzb2x2ZXIpOiBJbmplY3RvciB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0Q29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHVzZVZhbHVlOiBjb250YWluZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0SXRlbVN0YXRlLFxuICAgICAgICAgICAgICAgIHVzZVZhbHVlOiBzdGF0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlOiBHb2xkZW5MYXlvdXQsXG4gICAgICAgICAgICAgICAgdXNlVmFsdWU6IHRoaXMuZ29sZGVuTGF5b3V0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHByb3ZpZGU6IEdvbGRlbkxheW91dENvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB1c2VWYWx1ZTogdGhpc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlOiBHb2xkZW5MYXlvdXRJdGVtQ29tcG9uZW50UmVzb2x2ZXIsXG4gICAgICAgICAgICAgICAgdXNlVmFsdWU6IGNvbXBvbmVudFJlc29sdmVyXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sIHRoaXMuaW5qZWN0b3IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhbiBldmVudCBoYW5kbGVyIGZvciBlYWNoIGltcGxlbWVudGVkIGhvb2suXG4gICAgICogQHBhcmFtIGNvbnRhaW5lciBHb2xkZW4gTGF5b3V0IGNvbXBvbmVudCBjb250YWluZXIuXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCBBbmd1bGFyIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIF9iaW5kRXZlbnRIb29rcyhjb250YWluZXI6IGFueSwgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8SUdvbGRlbkxheW91dEl0ZW0+KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZSBhcyBJR29sZGVuTGF5b3V0SXRlbTtcblxuICAgICAgICBjb250YWluZXIub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5vblJlc2l6ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb250YWluZXIub24oJ3Nob3cnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb21wb25lbnQub25TaG93KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRhaW5lci5vbignaGlkZScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5vbkhpZGUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29udGFpbmVyLm9uKCd0YWInLCAodGFiOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuVGFiKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVUYWJDcmVhdGVkKHRhYik7XG5cbiAgICAgICAgICAgIGlmICgoY29udGFpbmVyIGFzIGFueSkuX2NvbmZpZy5pc0Nsb3NhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGFiLmVsZW1lbnQuYWRkQ2xhc3MoQ2xhc3MuQ2xvc2FibGVUYWIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb21wb25lbnQub25UYWJDcmVhdGVkKHRhYi5lbGVtZW50IGFzIEpRdWVyeSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2FkZFBvcG91dEJ0bihzdGFjazogYW55KSB7XG4gICAgICAgIGNvbnN0IHBvcG91dEJ0biA9IHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lclxuICAgICAgICAgICAgLmZpbmQoYC4ke0NsYXNzLnBvcG91dH1gKTtcblxuICAgICAgICBwb3BvdXRCdG4ub2ZmKCk7XG5cbiAgICAgICAgdGhpcy5fZ2V0TGFiZWwoJ3BvcG91dCcpLnBpcGUoKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgobGFiZWwpID0+IHtcbiAgICAgICAgICAgICAgICBwb3BvdXRCdG4uYXR0cigndGl0bGUnLCBsYWJlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRQb3BvdXRJY29uKSB7XG4gICAgICAgICAgICBwb3BvdXRCdG4uYXBwZW5kKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0UG9wb3V0SWNvbigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvcG91dEJ0bi5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVQb3B1cENsaWNrKHN0YWNrKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkUG9waW5CdG4oc3RhY2s6IGFueSkge1xuICAgICAgICBjb25zdCBwb3BpbkJ0biA9ICQoYFxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiJHtDbGFzcy5wb3Bpbn1cIj48L2xpPlxuICAgICAgICBgKTtcblxuICAgICAgICB0aGlzLl9nZXRMYWJlbCgncG9waW4nKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgobGFiZWwpID0+IHtcbiAgICAgICAgICAgICAgICBwb3BpbkJ0bi5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHBvcGluQnRuLmFwcGVuZCh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldFBvcGluSWNvbigpKTtcblxuICAgICAgICBmcm9tRXZlbnQocG9waW5CdG4sICdjbGljaycpLnBpcGUoXG4gICAgICAgICAgICBmaXJzdCgpXG4gICAgICAgICkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiBzdGFjay5jb250ZW50SXRlbXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zYXZlSXRlbVN0YXRlKGNvbXBvbmVudC5jb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnBvcGluSGFuZGxlcihzdGFjay5jb25maWcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzdGFjay5oZWFkZXIuY29udHJvbHNDb250YWluZXIuZmluZCgnLmxtX3RhYmRyb3Bkb3duJykuYWZ0ZXIocG9waW5CdG4pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldE1heGltaXNlSWNvbigpOiBKUXVlcnkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRNYXhpbWlzZUljb25cbiAgICAgICAgICAgID8gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRNYXhpbWlzZUljb24oKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldE1pbmltaXNlSWNvbigpOiBKUXVlcnkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRNaW5pbWlzZUljb25cbiAgICAgICAgICAgID8gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRNaW5pbWlzZUljb24oKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2FkZE1heGltaXplQnRuKHN0YWNrOiBhbnkpIHtcbiAgICAgICAgY29uc3QgdXBkYXRlQnRuID0gKGlzTWF4aW1pc2VkOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpY29uID0gaXNNYXhpbWlzZWQgPyB0aGlzLl9nZXRNaW5pbWlzZUljb24oKSA6IHRoaXMuX2dldE1heGltaXNlSWNvbigpO1xuICAgICAgICAgICAgY29uc3QgbWF4aW1pc2VCdG4gPSBzdGFjay5oZWFkZXIuY29udHJvbHNDb250YWluZXIuZmluZChgLiR7Q2xhc3MubWF4aW1pc2V9YCk7XG5cbiAgICAgICAgICAgIG1heGltaXNlQnRuLmVtcHR5KCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2dldExhYmVsKGlzTWF4aW1pc2VkID8gJ21pbmltaXNlJyA6ICdtYXhpbWlzZScpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgobGFiZWw6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtYXhpbWlzZUJ0bi5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGljb24pIHtcbiAgICAgICAgICAgICAgICBtYXhpbWlzZUJ0bi5hcHBlbmQoaWNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhY2sub24oJ21heGltaXNlZCcsICgpID0+IHVwZGF0ZUJ0bih0cnVlKSk7XG4gICAgICAgIHN0YWNrLm9uKCdtaW5pbWlzZWQnLCAoKSA9PiB1cGRhdGVCdG4oZmFsc2UpKTtcblxuICAgICAgICB1cGRhdGVCdG4oZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2FkZENsb3NlQnRuKHN0YWNrOiBhbnkpIHtcbiAgICAgICAgY29uc3QgYnRuID0gc3RhY2suaGVhZGVyLmNvbnRyb2xzQ29udGFpbmVyLmZpbmQoYC4ke0NsYXNzLmNsb3NlfWApO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldENsb3NlSWNvbikge1xuICAgICAgICAgICAgYnRuLmFwcGVuZCh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldENsb3NlSWNvbigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2dldExhYmVsKCdjbG9zZScpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbCkgPT4ge1xuICAgICAgICAgICAgICAgIGJ0bi5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2FkZENsb3NlVGFiQnRuKHRhYjogR29sZGVuTGF5b3V0TmFtZXNwYWNlLlRhYikge1xuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRDbG9zZVRhYkljb24pIHtcbiAgICAgICAgICAgIHRhYi5jbG9zZUVsZW1lbnQuYXBwZW5kKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0Q2xvc2VUYWJJY29uKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlVGFiQ3JlYXRlZCh0YWI6IEdvbGRlbkxheW91dE5hbWVzcGFjZS5UYWIpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2hvd0Nsb3NlVGFiSWNvbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZENsb3NlVGFiQnRuKHRhYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YWIuY2xvc2VFbGVtZW50LmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2FkZE1vYmlsZVRhYkRyYWdnaW5nU3VwcG9ydCh0YWIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2hhbmRsZVBvcHVwQ2xpY2soc3RhY2s6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5jYW5PcGVuUG9wdXBXaW5kb3cgIT0gbnVsbCAmJiAhdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5jYW5PcGVuUG9wdXBXaW5kb3coKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWN0aXZlQ29udGVudEl0ZW0gPSBzdGFjay5nZXRBY3RpdmVDb250ZW50SXRlbSgpO1xuICAgICAgICBjb25zdCBwYXJlbnRJZCA9IGFjdGl2ZUNvbnRlbnRJdGVtLnBhcmVudCAmJiBhY3RpdmVDb250ZW50SXRlbS5wYXJlbnQuY29uZmlnLmlkO1xuXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2Ygc3RhY2suY29udGVudEl0ZW1zKSB7XG4gICAgICAgICAgICB0aGlzLl9zYXZlSXRlbVN0YXRlKGl0ZW0uY29udGFpbmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFjdGl2ZUNvbnRlbnRJdGVtLmNvbnRhaW5lci5leHRlbmRTdGF0ZSh7XG4gICAgICAgIC8vICAgICBjb21wb25lbnRTdGF0ZTogYWN0aXZlQ29udGVudEl0ZW0uY29udGFpbmVyW0NPTVBPTkVOVF9SRUZfS0VZXS5pbnN0YW5jZS5zYXZlU3RhdGUoKSxcbiAgICAgICAgLy8gICAgIHBhcmVudElkOiBwYXJlbnRJZFxuICAgICAgICAvLyB9KTtcblxuICAgICAgICBjb25zdCBjb21wb25lbnRDb25maWcgPSBzdGFjay5jb25maWc7XG5cbiAgICAgICAgdGhpcy5fb3BlblBvcHVwKGNvbXBvbmVudENvbmZpZyk7XG4gICAgICAgIHN0YWNrLnBhcmVudC5yZW1vdmVDaGlsZChzdGFjayk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkTW9iaWxlVGFiRHJhZ2dpbmdTdXBwb3J0KHRhYjogR29sZGVuTGF5b3V0TmFtZXNwYWNlLlRhYikge1xuICAgICAgICAvKlxuICAgICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ub3VjaC90YXJnZXRcbiAgICAgICAgKlxuICAgICAgICAqIElmIHRvdWNoc3RhcnQgZXZlbnQgdGFyZ2V0IHJlbW92ZWQgZnJvbSBET00sIHRoZW4gdG91Y2htb3ZlIGV2ZW50IHdvbid0IGJlIGZpcmVkXG4gICAgICAgICpcbiAgICAgICAgKiBTb2x1dGlvbjogYWRkIG92ZXJsYXkgZWxlbWVudCB0byBlYWNoIHRhYiwgdGhhdCB3aWxsIGJlIHJlcGxhY2VkIGZyb20gdGFiIGNvbnRhaW5lciB0byBib2R5IHdoZW4gdG91Y2hzdGFydFxuICAgICAgICAqIGV2ZW50IHdpbGwgYmUgZmlyZWRcbiAgICAgICAgKlxuICAgICAgICAqXG4gICAgICAgICogKi9cblxuICAgICAgICBjb25zdCB0YWJEcmFnID0gJChgPHNwYW4gY2xhc3M9XCIke0NsYXNzLnRhYkRyYWd9XCI+PC9zcGFuPmApO1xuICAgICAgICB0YWJEcmFnLmNzcyh7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgICd6LWluZGV4JzogMVxuICAgICAgICB9KTtcblxuICAgICAgICAkKHRhYi5lbGVtZW50KS5hcHBlbmQodGFiRHJhZyk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MucmVvcmRlckVuYWJsZWQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9vdmVycmlkZVRhYk9uRHJhZ1N0YXJ0KHRhYik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHByaXZhdGUgX292ZXJyaWRlVGFiT25EcmFnU3RhcnQodGFiOiBhbnkpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdGFiLl9vbkRyYWdTdGFydDtcbiAgICAgICAgY29uc3QgZHJhZ0xpc3RlbmVyID0gdGFiLl9kcmFnTGlzdGVuZXI7XG4gICAgICAgIGNvbnN0IGRyYWdFbGVtZW50ID0gJCh0YWIuZWxlbWVudCkuZmluZChgLiR7Q2xhc3MudGFiRHJhZ31gKTtcblxuICAgICAgICBkcmFnTGlzdGVuZXIub2ZmKCdkcmFnU3RhcnQnLCBvcmlnaW4sIHRhYik7XG4gICAgICAgIGNvbnN0IG9uRHJhZ1N0YXJ0ID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgIGRyYWdFbGVtZW50LmFwcGVuZFRvKCdib2R5Jyk7XG4gICAgICAgICAgICBvcmlnaW4uY2FsbCh0YWIsIHgsIHkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRhYi5fb25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydDtcbiAgICAgICAgZHJhZ0xpc3RlbmVyLm9uKCdkcmFnU3RhcnQnLCAodGFiIGFzIGFueSkuX29uRHJhZ1N0YXJ0LCB0YWIpO1xuICAgICAgICBkcmFnTGlzdGVuZXIub24oJ2RyYWdTdG9wJywgKCkgPT4ge1xuICAgICAgICAgICAgZHJhZ0VsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgIH0sIG51bGwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX29wZW5Qb3B1cChjb21wb25lbnRDb25maWc6IEdvbGRlbkxheW91dE5hbWVzcGFjZS5JdGVtQ29uZmlnKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBwb3B1cFdpbmRvdzogV2luZG93O1xuICAgICAgICBsZXQgcG9wdXBXaW5kb3dNYW5hZ2VyOiBQb3B1cFdpbmRvd01hbmFnZXI7XG5cbiAgICAgICAgY29uc3QgcG9wdXBXaW5kb3dDb25maWc6IElQb3B1cFdpbmRvd01hbmFnZXJDb25maWcgPSB7XG4gICAgICAgICAgICBjb21wb25lbnRDb25maWc6IGNvbXBvbmVudENvbmZpZyxcbiAgICAgICAgICAgIGxheW91dFNldHRpbmdzOiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLFxuICAgICAgICAgICAgcG9waW5IYW5kbGVyOiAoX2NvbXBvbmVudENvbmZpZykgPT4ge1xuICAgICAgICAgICAgICAgIHBvcHVwV2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRJdGVtQXNDb2x1bW4oX2NvbXBvbmVudENvbmZpZyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9wdXBTdGF0ZUNoYW5nZWRIYW5kbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc3RhdGVDaGFuZ2VkLm5leHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3B1cENsb3NlZEhhbmRsZXI6IChjbG9zZWRCeVVzZXI6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VkQnlVc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdXBzV2luZG93cyA9IHRoaXMucG9wdXBzV2luZG93cy5maWx0ZXIocCA9PiBwICE9PSBwb3B1cFdpbmRvd01hbmFnZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzdGF0ZUNoYW5nZWQubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5DaGFuZ2VEZXRlY3Rpb25IYW5kbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcFJlZi50aWNrKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVwc1dpbmRvd3MuZmlsdGVyKHcgPT4gdyAhPT0gcG9wdXBXaW5kb3dNYW5hZ2VyKS5mb3JFYWNoKHcgPT4gdy5ydW5DaGFuZ2VEZXRlY3Rpb24oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcG9wdXBXaW5kb3cgPSBQb3B1cFdpbmRvd01hbmFnZXIub3BlbldpbmRvdyh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnBvcHVwV2luZG93VXJsKTtcblxuICAgICAgICBpZiAoIXBvcHVwV2luZG93KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5vcGVuUG9wdXBGYWlsdXJlSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Mub3BlblBvcHVwRmFpbHVyZUhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Mub3BlblBvcHVwSG9vaykge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5vcGVuUG9wdXBIb29rKHBvcHVwV2luZG93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvcHVwV2luZG93TWFuYWdlciA9IG5ldyBQb3B1cFdpbmRvd01hbmFnZXIocG9wdXBXaW5kb3csIHBvcHVwV2luZG93Q29uZmlnKTtcblxuICAgICAgICB0aGlzLnBvcHVwc1dpbmRvd3MucHVzaChwb3B1cFdpbmRvd01hbmFnZXIpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NhdmVJdGVtU3RhdGUoY29udGFpbmVyOiBDb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyLnNldFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIGNvbnRhaW5lci5nZXRTdGF0ZSgpLCB7XG4gICAgICAgICAgICBjb21wb25lbnRTdGF0ZTogKGNvbnRhaW5lcltDT01QT05FTlRfUkVGX0tFWV0uaW5zdGFuY2UgYXMgSUdvbGRlbkxheW91dEl0ZW0pLnNhdmVTdGF0ZSgpXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBzYXZlU3RhdGUoKTogR29sZGVuTGF5b3V0U3RhdGUge1xuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5nZXRBbGxDb21wb25lbnRzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3NhdmVJdGVtU3RhdGUoKGNvbXBvbmVudCBhcyBhbnkpLmNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGF0ZTogR29sZGVuTGF5b3V0U3RhdGUgPSB7XG4gICAgICAgICAgICAuLi50aGlzLmdvbGRlbkxheW91dC50b0NvbmZpZygpLFxuICAgICAgICAgICAgb3BlblBvcHVwczogdGhpcy5wb3B1cHNXaW5kb3dzLm1hcChwID0+IHAuc2F2ZVN0YXRlKCkpLFxuICAgICAgICAgICAgdmVyc2lvbjogR29sZGVuTGF5b3V0Q29tcG9uZW50LnN0YXRlVmVyc2lvblxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBsb2FkU3RhdGUoc3RhdGU6IElHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSwgZmlyZVN0YXRlQ2hhbmdlZDogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKHRoaXMuZ29sZGVuTGF5b3V0ICYmIHRoaXMuZ29sZGVuTGF5b3V0LmlzSW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LmRlc3Ryb3koKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucG9wdXBzV2luZG93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlUG9wdXBzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cHNXaW5kb3dzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlTGF5b3V0KHRoaXMuX25vcm1hbGl6ZUxheW91dFN0YXRlKHN0YXRlKSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyZVN0YXRlQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzdGF0ZUNoYW5nZWQubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNhdmVJdGVtU3RhdGUoaXRlbUlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBpdGVtcyA9IHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QuZ2V0SXRlbXNCeUlkKGl0ZW1JZCk7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtcyAmJiBpdGVtcy5sZW5ndGggPyBpdGVtc1swXSA6IG51bGw7XG5cbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtLmNvbmZpZztcbiAgICB9XG5cbiAgICBjbG9zZVBvcHVwcygpIHtcbiAgICAgICAgdGhpcy5wb3B1cHNXaW5kb3dzLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgICAgIHAuY2xvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0QWxsQ29tcG9uZW50cygpOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW1bXSB7XG4gICAgICAgIGlmICh0aGlzLmdvbGRlbkxheW91dCAmJiB0aGlzLmdvbGRlbkxheW91dC5pc0luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5nZXRJdGVtc0J5VHlwZSgnY29tcG9uZW50JykgYXMgR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRlbnRJdGVtW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbm9ybWFsaXplTGF5b3V0U3RhdGUoc3RhdGU6IElHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSk6IElHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSB7XG4gICAgICAgIGxldCBub3JtYWxpemVkU3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLnNldHRpbmdzLCB7XG4gICAgICAgICAgICAgICAgdGFiQ29udHJvbE9mZnNldDogdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy50YWJDb250cm9sT2Zmc2V0ICE9IG51bGwgPyB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnRhYkNvbnRyb2xPZmZzZXQgOiAxMDAsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uRW5hYmxlZDogdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zZWxlY3Rpb25FbmFibGVkICE9IG51bGwgPyB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnNlbGVjdGlvbkVuYWJsZWQgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZW9yZGVyRW5hYmxlZDogdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5yZW9yZGVyRW5hYmxlZCAhPSBudWxsID8gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5yZW9yZGVyRW5hYmxlZCA6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZU1vZGU6IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MucmVzcG9uc2l2ZU1vZGUgIT0gbnVsbCA/IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MucmVzcG9uc2l2ZU1vZGUgOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgc2hvd0Nsb3NlSWNvbjogdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zaG93Q2xvc2VJY29uICE9IG51bGwgPyB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnNob3dDbG9zZUljb24gOiB0cnVlXG4gICAgICAgICAgICB9IGFzIFBhcnRpYWw8R29sZGVuTGF5b3V0TmFtZXNwYWNlLlNldHRpbmdzPikgYXMgR29sZGVuTGF5b3V0TmFtZXNwYWNlLlNldHRpbmdzXG4gICAgICAgIH0pIGFzIElHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZTtcblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5kaW1lbnNpb25zKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkU3RhdGUuZGltZW5zaW9ucyA9IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZGltZW5zaW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIG5vcm1hbGl6ZWRTdGF0ZSA9IHRoaXMuX21pZ3JhdGVTdGF0ZShub3JtYWxpemVkU3RhdGUpO1xuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkU3RhdGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbWlncmF0ZVN0YXRlKHN0YXRlOiBHb2xkZW5MYXlvdXRTdGF0ZSk6IElHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSB7XG4gICAgICBjb25zdCBzdGF0ZVZlcnNpb24gPSBzdGF0ZS52ZXJzaW9uO1xuXG4gICAgICBpZiAoc3RhdGVWZXJzaW9uID09PSBHb2xkZW5MYXlvdXRDb21wb25lbnQuc3RhdGVWZXJzaW9uKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLnZlcnNpb24gPT0gbnVsbCB8fCBzdGF0ZS52ZXJzaW9uICE9PSBHb2xkZW5MYXlvdXRDb21wb25lbnQuc3RhdGVWZXJzaW9uKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgSW5jb21wYXRpYmxlIGxheW91dCBzdGF0ZSB2ZXJHb2xkZW5MYXlvdXRTdGF0ZXNpb25zLiBDdXJyZW50IGxheW91dCBzdGF0ZSB2ZXJzaW9uOiAke0dvbGRlbkxheW91dENvbXBvbmVudC5zdGF0ZVZlcnNpb259LCB5b3VyIHN0YXRlIHZlcnNpb246ICR7c3RhdGUudmVyc2lvbiB8fCAnbm9uZSd9YCk7XG4gICAgICAgIHN0YXRlLmNvbnRlbnQgPSBbXTsgLy8gY2xlYXIgYWxsIGNvbXBvbmVudHNcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuXG4gICAgYXN5bmMgYWRkSXRlbUFzQ29sdW1uKGNvbXBvbmVudENvbmZpZzogR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbXBvbmVudENvbmZpZykge1xuICAgICAgICBpZiAodGhpcy5nb2xkZW5MYXlvdXQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fY3JlYXRlTGF5b3V0KG51bGwpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsYXlvdXRSb290ID0gKHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QgYXMgR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRlbnRJdGVtKTtcblxuICAgICAgICBpZiAodGhpcy5pc0xheW91dEVtcHR5KSB7XG4gICAgICAgICAgICBsYXlvdXRSb290LmFkZENoaWxkKGNvbXBvbmVudENvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGF5b3V0Um9vdC5jb250ZW50SXRlbXMubGVuZ3RoID09PSAxICYmIGxheW91dFJvb3QuY29udGVudEl0ZW1zWzBdLmlzUm93KSB7XG4gICAgICAgICAgICBsYXlvdXRSb290LmNvbnRlbnRJdGVtc1swXS5hZGRDaGlsZChjb21wb25lbnRDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlQ29udGVudEl0ZW0oe1xuICAgICAgICAgICAgdHlwZTogJ3JvdycsXG4gICAgICAgICAgICBpZDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSwgLy8gKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIGhlaWdodDogMTAwXG4gICAgICAgIH0pIGFzIGFueTtcblxuICAgICAgICBjb25zdCB0ZW1wID0gdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5jb250ZW50SXRlbXNbMF07XG5cbiAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5yZXBsYWNlQ2hpbGQoXG4gICAgICAgICAgICB0ZW1wLFxuICAgICAgICAgICAgcm93XG4gICAgICAgICk7XG5cbiAgICAgICAgcm93LmFkZENoaWxkKHRlbXApO1xuICAgICAgICByb3cuYWRkQ2hpbGQoY29tcG9uZW50Q29uZmlnKTtcbiAgICB9XG5cblxuICAgIGFzeW5jIGFkZENvbXBvbmVudEFzQ29sdW1uKGNvbXBvbmVudE5hbWU6IHN0cmluZywgY29tcG9uZW50U3RhdGUpIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50Q29uZmlnID0gdGhpcy5fY3JlYXRlQ29tcG9uZW50Q29udGVudEl0ZW1Db25maWcoY29tcG9uZW50TmFtZSwgY29tcG9uZW50U3RhdGUpO1xuICAgICAgICB0aGlzLmFkZEl0ZW1Bc0NvbHVtbihjb21wb25lbnRDb25maWcpO1xuICAgIH1cblxuXG4gICAgYXN5bmMgYWRkQ29tcG9uZW50KGNvbXBvbmVudE5hbWU6IHN0cmluZywgY29tcG9uZW50U3RhdGUsIHBhcmVudDogR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbnRlbnRJdGVtKSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudENvbmZpZyA9IHRoaXMuX2NyZWF0ZUNvbXBvbmVudENvbnRlbnRJdGVtQ29uZmlnKGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudFN0YXRlKTtcblxuICAgICAgICBpZiAodGhpcy5pc0xheW91dEVtcHR5KSB7XG4gICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5yb290LmFkZENoaWxkKGNvbXBvbmVudENvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnRBc0NvbHVtbihjb21wb25lbnROYW1lLCBjb21wb25lbnRTdGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJlbnQuYWRkQ2hpbGQoY29tcG9uZW50Q29uZmlnKTtcbiAgICB9XG5cbiAgICBhZGRJdGVtKGNvbXBvbmVudENvbmZpZzogYW55KSB7XG4gICAgICAgIGNvbnN0IGlzTGF5b3V0RW1wdHkgPSB0aGlzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDA7XG5cbiAgICAgICAgY29uc3Qgc3RhY2sgPSB7XG4gICAgICAgICAgICB0eXBlOiAnc3RhY2snLFxuICAgICAgICAgICAgaWQ6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksXG4gICAgICAgICAgICBjb250ZW50OiBbXG4gICAgICAgICAgICAgICAgY29tcG9uZW50Q29uZmlnXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGlzTGF5b3V0RW1wdHkpIHtcbiAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QuYWRkQ2hpbGQoc3RhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc3RhY2tDb250ZW50SXRlbTogYW55ID0gdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlQ29udGVudEl0ZW0oe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdzdGFjaycsXG4gICAgICAgICAgICAgICAgaWQ6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgY29udGVudDogW11cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzdGFja0NvbnRlbnRJdGVtLmFkZENoaWxkKFxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LmNyZWF0ZUNvbnRlbnRJdGVtKGNvbXBvbmVudENvbmZpZylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IHRoaXMuZ29sZGVuTGF5b3V0LmNyZWF0ZUNvbnRlbnRJdGVtKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY29sdW1uJyxcbiAgICAgICAgICAgICAgICBpZDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMTAwXG4gICAgICAgICAgICB9KSBhcyBhbnk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRlbXAgPSB0aGlzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtc1swXTtcblxuICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5yZXBsYWNlQ2hpbGQoXG4gICAgICAgICAgICAgICAgdGVtcCxcbiAgICAgICAgICAgICAgICBjb2x1bW5cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbHVtbi5hZGRDaGlsZCh0ZW1wKTtcbiAgICAgICAgICAgIGNvbHVtbi5hZGRDaGlsZChzdGFja0NvbnRlbnRJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEl0ZW1zQnlJZChpZDogc3RyaW5nKTogYW55W10ge1xuICAgICAgICByZXR1cm4gKHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QgYXMgYW55KS5nZXRJdGVtc0J5SWQoaWQpIGFzIGFueVtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldExhYmVscyhsYWJlbHM6IEdvbGRlbkxheW91dExhYmVscykge1xuICAgICAgICB0aGlzLl9sYWJlbHMgPSBPYmplY3QuYXNzaWduKHt9LCBEZWZhdWx0TGFiZWxzLCBsYWJlbHMpO1xuICAgICAgICBjb25zdCBpc0xheW91dEluaXRpYWxpemVkID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29sZGVuTGF5b3V0ICYmIHRoaXMuZ29sZGVuTGF5b3V0LmlzSW5pdGlhbGlzZWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2V0TGFiZWwgPSAobGFiZWw6IGtleW9mIEdvbGRlbkxheW91dExhYmVscyk6IE9ic2VydmFibGU8c3RyaW5nPiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0TGFiZWwobGFiZWwsIGZhbHNlKVxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIoKCkgPT4gaXNMYXlvdXRJbml0aWFsaXplZCgpKSxcbiAgICAgICAgICAgICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kkKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZ2V0TGFiZWwoJ2FkZENvbXBvbmVudCcpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoYC4ke0NsYXNzLmFkZENvbXBvbmVudH1gKS5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGdldExhYmVsKCdjbG9zZScpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoYC4ke0NsYXNzLmNsb3NlfWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZ2V0TGFiZWwoJ21heGltaXNlJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkuZmluZChgLiR7Q2xhc3MubWF4aW1pc2V9YCkuYXR0cigndGl0bGUnLCBsYWJlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBnZXRMYWJlbCgnbWluaW1pc2UnKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgobGFiZWw6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICQodGhpcy5lbC5uYXRpdmVFbGVtZW50KS5maW5kKGAubG1fbWF4aW1pc2VkIC4ke0NsYXNzLm1heGltaXNlfWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZ2V0TGFiZWwoJ3BvcG91dCcpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoYC4ke0NsYXNzLnBvcG91dH1gKS5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGdldExhYmVsKCdhZGRpdGlvbmFsVGFicycpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoYC4ke0NsYXNzLnRhYnNEcm9wZG93bn1gKS5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGdldExhYmVsKCdwb3BpbicpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoYC4ke0NsYXNzLnBvcGlufWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TGFiZWwobGFiZWw6IGtleW9mIEdvbGRlbkxheW91dExhYmVscywgZmlyc3RWYWx1ZTogYm9vbGVhbiA9IHRydWUpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBsYWJlbCQgPSB0aGlzLl9sYWJlbHNbbGFiZWxdO1xuXG4gICAgICAgIGlmIChmaXJzdFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbGFiZWwkXG4gICAgICAgICAgICAgICAgLnBpcGUoZmlyc3QoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGFiZWwkO1xuICAgIH1cblxuICAgIHVwZGF0ZVNpemUoKSB7XG4gICAgICAgIGlmICh0aGlzLmdvbGRlbkxheW91dCkge1xuICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQudXBkYXRlU2l6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kkLm5leHQoKTtcbiAgICAgICAgdGhpcy5fZGVzdHJveSQuY29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGNsZWFyKCkge1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzp1bmxvYWQnLCBbJyRldmVudCddKVxuICAgIHVubG9hZE5vdGlmaWNhdGlvbigkZXZlbnQ6IGFueSkge1xuICAgICAgICB0aGlzLmNsb3NlUG9wdXBzKCk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5jbG9zZVBvcHVwcygpO1xuXG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kkLm5leHQoKTtcbiAgICAgICAgdGhpcy5fZGVzdHJveSQuY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jcmVhdGVDb21wb25lbnRDb250ZW50SXRlbUNvbmZpZyhjb21wb25lbnROYW1lOiBzdHJpbmcsIGNvbXBvbmVudFN0YXRlKTogR29sZGVuTGF5b3V0TmFtZXNwYWNlLkNvbXBvbmVudENvbmZpZyB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcbiAgICAgICAgICAgIGlkOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBjb21wb25lbnROYW1lOiBjb21wb25lbnROYW1lLFxuICAgICAgICAgICAgY29tcG9uZW50U3RhdGU6IHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRTdGF0ZTogY29tcG9uZW50U3RhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=