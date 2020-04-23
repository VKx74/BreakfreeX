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
const COMPONENT_REF_KEY = '$componentRef';
/** @type {?} */
export const DefaultLabels = {
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
const Class = {
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
export class GoldenLayoutComponent {
    /**
     * @param {?} viewContainer
     * @param {?} _layoutManager
     * @param {?} componentFactoryResolver
     * @param {?} ngZone
     * @param {?} _changeDetectorRef
     * @param {?} _appRef
     * @param {?} injector
     * @param {?} _configuration
     */
    constructor(viewContainer, _layoutManager, componentFactoryResolver, ngZone, _changeDetectorRef, _appRef, injector, _configuration) {
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
    /**
     * @return {?}
     */
    get isLayoutEmpty() {
        return this.$layoutEmpty.getValue();
    }
    /**
     * @param {?} componentConfig
     * @return {?}
     */
    static getSingleComponentLayoutConfig(componentConfig) {
        return {
            version: GoldenLayoutComponent.stateVersion,
            content: [
                componentConfig
            ]
        };
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._resize$
            .pipe(auditTime(10), takeUntil(this._destroy$))
            .subscribe((/**
         * @return {?}
         */
        () => {
            if (this.goldenLayout) {
                this.goldenLayout.updateSize();
            }
        }));
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (!this._suppressChangeDetection) {
            this.popupsWindows.forEach((/**
             * @param {?} w
             * @return {?}
             */
            w => w.runChangeDetection()));
        }
    }
    /**
     * @private
     * @return {?}
     */
    _registerComponents() {
        for (const component of this._configuration.components) {
            this.goldenLayout.registerComponent(component.componentName, this.createComponentInitCallback(component));
        }
    }
    /**
     * @private
     * @param {?} state
     * @return {?}
     */
    _createLayout(state) {
        /** @type {?} */
        const createLayout = (/**
         * @return {?}
         */
        () => {
            return new Promise((/**
             * @param {?} resolve
             * @return {?}
             */
            (resolve) => {
                /** @type {?} */
                const notOpenedPopupsComponents = [];
                if (state.openPopups) {
                    for (const itemConfig of state.openPopups) {
                        /** @type {?} */
                        const opened = this._openPopup(itemConfig);
                        if (!opened) {
                            notOpenedPopupsComponents.push(itemConfig);
                        }
                    }
                }
                if (notOpenedPopupsComponents.length) {
                    /** @type {?} */
                    const isLayoutEmpty = state.content.length === 0;
                    if (isLayoutEmpty) {
                        state.content = [
                            {
                                type: 'row',
                                width: 100,
                                height: 100,
                                content: [
                                    ...notOpenedPopupsComponents
                                ]
                            }
                        ];
                    }
                    else {
                        state.content = [
                            {
                                type: "row",
                                width: 100,
                                height: 100,
                                content: [
                                    Object.assign({}, state.content[0], { width: 50, height: 100 }),
                                    ...notOpenedPopupsComponents
                                ]
                            }
                        ];
                    }
                }
                this.goldenLayout = new GoldenLayout((/** @type {?} */ (state)), $(this.el.nativeElement));
                this.goldenLayout.on('stateChanged', (/**
                 * @param {?} v
                 * @return {?}
                 */
                (v) => {
                    if (this.goldenLayout.isInitialised) {
                        this.$stateChanged.next();
                    }
                }));
                this._registerComponents();
                ((/** @type {?} */ (window))).gl = this.goldenLayout;
                ((/** @type {?} */ (window))).glc = this;
                this.goldenLayout.on('itemCreated', (/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    this._handleItemCreated(item);
                }));
                // Destory child angular components on golden-helpers container destruction.
                this.goldenLayout.on('itemDestroyed', (/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    /** @type {?} */
                    const container = item.container;
                    /** @type {?} */
                    const component = container && container[COMPONENT_REF_KEY];
                    if (component) {
                        component.destroy();
                        ((/** @type {?} */ (container)))[COMPONENT_REF_KEY] = null;
                    }
                }));
                this.goldenLayout.on('stackCreated', (/**
                 * @param {?} stack
                 * @return {?}
                 */
                (stack) => {
                    this._handleStackCreated(stack);
                }));
                this.goldenLayout.eventHub.on('selectionChanged', (/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                }));
                this.goldenLayout.eventHub.on('columnCreated', (/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                }));
                this.goldenLayout.on('itemCreated', (/**
                 * @return {?}
                 */
                () => {
                    this.$layoutEmpty.next(false);
                }));
                this.goldenLayout.on('itemDestroyed', ((/**
                 * @return {?}
                 */
                () => {
                    /** @type {?} */
                    let _ignoredItem = null;
                    return (/**
                     * @param {?} item
                     * @return {?}
                     */
                    (item) => {
                        if (item.parent && (item.parent.isColumn || item.parent.isRow) && item.parent.contentItems.length === 2) {
                            _ignoredItem = item.parent;
                        }
                        if (item !== _ignoredItem) {
                            /** @type {?} */
                            const isLayoutEmpty = this.goldenLayout.root.contentItems.filter((/**
                             * @param {?} i
                             * @return {?}
                             */
                            (i) => i !== item)).length === 0;
                            this.$layoutEmpty.next(isLayoutEmpty);
                            this._changeDetectorRef.detectChanges();
                        }
                    });
                }))());
                this.goldenLayout.on('beforeItemDestroyed', (/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    if (item.isMaximised) {
                        item.toggleMaximise(); // fix issue with deleting maximised component
                    }
                }));
                this.goldenLayout.on('initialised', (/**
                 * @return {?}
                 */
                () => {
                    this.$layoutEmpty.next(this.goldenLayout.root.contentItems.length === 0);
                    if (!this._isDestroyed) {
                        this._changeDetectorRef.detectChanges();
                    }
                    // this.goldenLayout.updateSize();
                    resolve();
                }));
                // Initialize the helpers.
                this.goldenLayout.init();
            }));
        });
        return new Promise((/**
         * @param {?} resolve
         * @param {?} rej
         * @return {?}
         */
        (resolve, rej) => {
            setTimeout((/**
             * @return {?}
             */
            () => {
                resolve(createLayout());
            }), 0);
        }));
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onResize(event) {
        this._resize$.next();
    }
    /**
     * @private
     * @param {?} item
     * @return {?}
     */
    _handleItemCreated(item) {
        try {
            if (item.isStack && this._configuration.settings.showAddBtn !== false) {
                /** @type {?} */
                const addComponentBtn = $(`<span class='${Class.addComponent}'></span>`);
                this._getLabel('addComponent')
                    .subscribe((/**
                 * @param {?} label
                 * @return {?}
                 */
                (label) => {
                    addComponentBtn.attr('title', label);
                }));
                if (this._configuration.settings.getAddComponentBtnIcon) {
                    addComponentBtn.append(this._configuration.settings.getAddComponentBtnIcon());
                }
                $(((/** @type {?} */ (item))).header.tabsContainer).append(addComponentBtn);
                this.ngZone.run((/**
                 * @return {?}
                 */
                () => {
                    addComponentBtn.click((/**
                     * @return {?}
                     */
                    () => {
                        this.$onAddComponent.next(item);
                    }));
                }));
            }
            item.on('resize', (/**
             * @return {?}
             */
            () => {
                $(window).trigger('resize');
            }));
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    _handleStackCreated(stack) {
        if (this._configuration.settings.showCloseIcon !== false) {
            this._addCloseBtn(stack);
        }
        else {
            stack.header.controlsContainer
                .find(`.${Class.close}`).hide();
        }
        if (this._configuration.settings.showMaximiseIcon !== false) {
            this._addMaximizeBtn(stack);
        }
        else {
            stack.header.controlsContainer
                .find(`.${Class.maximise}`).hide();
        }
        if (this._configuration.settings.showPopoutIcon !== false) {
            this._addPopoutBtn(stack);
        }
        else {
            stack.header.controlsContainer
                .find(`.${Class.popout}`).hide();
        }
        this._getLabel('additionalTabs')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            stack.header.controlsContainer
                .find(`.${Class.tabsDropdown}`).attr('title', label);
        }));
        if (this._configuration.settings.showPopinIcon !== false) {
            this._addPopinBtn(stack);
        }
    }
    /**
     * @param {?} componentResolver
     * @return {?}
     */
    createComponentInitCallback(componentResolver) {
        /** @type {?} */
        const that = this;
        return (/**
         * @param {?} container
         * @param {?} state
         * @return {?}
         */
        function (container, state) {
            that.ngZone.run((/**
             * @return {?}
             */
            () => {
                // Create an instance of the angular component.
                // Create an instance of the angular component.
                /** @type {?} */
                const factory = that.componentFactoryResolver.resolveComponentFactory((/** @type {?} */ (that.injector.get(GoldenLayoutItemContainerToken))));
                /** @type {?} */
                const injector = that._createComponentInjector(container, state.componentState, componentResolver);
                /** @type {?} */
                const componentRef = that.viewContainer.createComponent(factory, undefined, injector);
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
    }
    /**
     * @return {?}
     */
    fireStateChanged() {
        this.$stateChanged.next();
    }
    /**
     * Creates an injector capable of injecting the Layout object,
     * component container, and initial component state.
     * @private
     * @param {?} container
     * @param {?} state
     * @param {?} componentResolver
     * @return {?}
     */
    _createComponentInjector(container, state, componentResolver) {
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
    }
    /**
     * Registers an event handler for each implemented hook.
     * @private
     * @param {?} container Golden Layout component container.
     * @param {?} componentRef
     * @return {?}
     */
    _bindEventHooks(container, componentRef) {
        /** @type {?} */
        const component = (/** @type {?} */ (componentRef.instance));
        container.on('resize', (/**
         * @return {?}
         */
        () => {
            component.onResize();
        }));
        container.on('show', (/**
         * @return {?}
         */
        () => {
            component.onShow();
        }));
        container.on('hide', (/**
         * @return {?}
         */
        () => {
            component.onHide();
        }));
        container.on('tab', (/**
         * @param {?} tab
         * @return {?}
         */
        (tab) => {
            this._handleTabCreated(tab);
            if (((/** @type {?} */ (container)))._config.isClosable) {
                tab.element.addClass(Class.ClosableTab);
            }
            component.onTabCreated((/** @type {?} */ (tab.element)));
        }));
    }
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    _addPopoutBtn(stack) {
        /** @type {?} */
        const popoutBtn = stack.header.controlsContainer
            .find(`.${Class.popout}`);
        popoutBtn.off();
        this._getLabel('popout').pipe()
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            popoutBtn.attr('title', label);
        }));
        if (this._configuration.settings.getPopoutIcon) {
            popoutBtn.append(this._configuration.settings.getPopoutIcon());
        }
        popoutBtn.click((/**
         * @return {?}
         */
        () => {
            this._handlePopupClick(stack);
        }));
    }
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    _addPopinBtn(stack) {
        /** @type {?} */
        const popinBtn = $(`
            <li class="${Class.popin}"></li>
        `);
        this._getLabel('popin')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            popinBtn.attr('title', label);
        }));
        popinBtn.append(this._configuration.settings.getPopinIcon());
        fromEvent(popinBtn, 'click').pipe(first()).subscribe((/**
         * @return {?}
         */
        () => {
            for (let component of stack.contentItems) {
                this._saveItemState(component.container);
            }
            this._configuration.settings.popinHandler(stack.config);
        }));
        stack.header.controlsContainer.find('.lm_tabdropdown').after(popinBtn);
    }
    /**
     * @private
     * @return {?}
     */
    _getMaximiseIcon() {
        return this._configuration.settings.getMaximiseIcon
            ? this._configuration.settings.getMaximiseIcon()
            : null;
    }
    /**
     * @private
     * @return {?}
     */
    _getMinimiseIcon() {
        return this._configuration.settings.getMinimiseIcon
            ? this._configuration.settings.getMinimiseIcon()
            : null;
    }
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    _addMaximizeBtn(stack) {
        /** @type {?} */
        const updateBtn = (/**
         * @param {?} isMaximised
         * @return {?}
         */
        (isMaximised) => {
            /** @type {?} */
            const icon = isMaximised ? this._getMinimiseIcon() : this._getMaximiseIcon();
            /** @type {?} */
            const maximiseBtn = stack.header.controlsContainer.find(`.${Class.maximise}`);
            maximiseBtn.empty();
            this._getLabel(isMaximised ? 'minimise' : 'maximise')
                .subscribe((/**
             * @param {?} label
             * @return {?}
             */
            (label) => {
                maximiseBtn.attr('title', label);
            }));
            if (icon) {
                maximiseBtn.append(icon);
            }
        });
        stack.on('maximised', (/**
         * @return {?}
         */
        () => updateBtn(true)));
        stack.on('minimised', (/**
         * @return {?}
         */
        () => updateBtn(false)));
        updateBtn(false);
    }
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    _addCloseBtn(stack) {
        /** @type {?} */
        const btn = stack.header.controlsContainer.find(`.${Class.close}`);
        if (this._configuration.settings.getCloseIcon) {
            btn.append(this._configuration.settings.getCloseIcon());
        }
        this._getLabel('close')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            btn.attr('title', label);
        }));
    }
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    _addCloseTabBtn(tab) {
        if (this._configuration.settings.getCloseTabIcon) {
            tab.closeElement.append(this._configuration.settings.getCloseTabIcon());
        }
    }
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    _handleTabCreated(tab) {
        if (this._configuration.settings.showCloseTabIcon !== false) {
            this._addCloseTabBtn(tab);
        }
        else {
            tab.closeElement.hide();
        }
        this._addMobileTabDraggingSupport(tab);
    }
    /**
     * @private
     * @param {?} stack
     * @return {?}
     */
    _handlePopupClick(stack) {
        if (this._configuration.settings.canOpenPopupWindow != null && !this._configuration.settings.canOpenPopupWindow()) {
            return;
        }
        /** @type {?} */
        const activeContentItem = stack.getActiveContentItem();
        /** @type {?} */
        const parentId = activeContentItem.parent && activeContentItem.parent.config.id;
        for (let item of stack.contentItems) {
            this._saveItemState(item.container);
        }
        // activeContentItem.container.extendState({
        //     componentState: activeContentItem.container[COMPONENT_REF_KEY].instance.saveState(),
        //     parentId: parentId
        // });
        /** @type {?} */
        const componentConfig = stack.config;
        this._openPopup(componentConfig);
        stack.parent.removeChild(stack);
    }
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    _addMobileTabDraggingSupport(tab) {
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
        const tabDrag = $(`<span class="${Class.tabDrag}"></span>`);
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
    }
    /**
     * @private
     * @param {?} tab
     * @return {?}
     */
    _overrideTabOnDragStart(tab) {
        /** @type {?} */
        const origin = tab._onDragStart;
        /** @type {?} */
        const dragListener = tab._dragListener;
        /** @type {?} */
        const dragElement = $(tab.element).find(`.${Class.tabDrag}`);
        dragListener.off('dragStart', origin, tab);
        /** @type {?} */
        const onDragStart = (/**
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
        () => {
            dragElement.remove();
        }), null);
    }
    /**
     * @private
     * @param {?} componentConfig
     * @return {?}
     */
    _openPopup(componentConfig) {
        /** @type {?} */
        let popupWindow;
        /** @type {?} */
        let popupWindowManager;
        /** @type {?} */
        const popupWindowConfig = {
            componentConfig: componentConfig,
            layoutSettings: this._configuration.settings,
            popinHandler: (/**
             * @param {?} _componentConfig
             * @return {?}
             */
            (_componentConfig) => {
                popupWindow.close();
                this.addItemAsColumn(_componentConfig);
            }),
            popupStateChangedHandler: (/**
             * @return {?}
             */
            () => {
                this.$stateChanged.next();
            }),
            popupClosedHandler: (/**
             * @param {?} closedByUser
             * @return {?}
             */
            (closedByUser) => {
                if (closedByUser) {
                    this.popupsWindows = this.popupsWindows.filter((/**
                     * @param {?} p
                     * @return {?}
                     */
                    p => p !== popupWindowManager));
                    this.$stateChanged.next();
                }
            }),
            runChangeDetectionHandler: (/**
             * @return {?}
             */
            () => {
                this._suppressChangeDetection = true;
                this._appRef.tick();
                this._suppressChangeDetection = false;
                this.popupsWindows.filter((/**
                 * @param {?} w
                 * @return {?}
                 */
                w => w !== popupWindowManager)).forEach((/**
                 * @param {?} w
                 * @return {?}
                 */
                w => w.runChangeDetection()));
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
    }
    /**
     * @private
     * @param {?} container
     * @return {?}
     */
    _saveItemState(container) {
        container.setState(Object.assign({}, container.getState(), {
            componentState: ((/** @type {?} */ (container[COMPONENT_REF_KEY].instance))).saveState()
        }));
    }
    /**
     * @return {?}
     */
    saveState() {
        for (let component of this.getAllComponents()) {
            this._saveItemState(((/** @type {?} */ (component))).container);
        }
        /** @type {?} */
        const state = Object.assign({}, this.goldenLayout.toConfig(), { openPopups: this.popupsWindows.map((/**
             * @param {?} p
             * @return {?}
             */
            p => p.saveState())), version: GoldenLayoutComponent.stateVersion });
        return state;
    }
    /**
     * @param {?} state
     * @param {?=} fireStateChanged
     * @return {?}
     */
    loadState(state, fireStateChanged = false) {
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
        () => {
            if (fireStateChanged) {
                this.$stateChanged.next();
            }
            return Promise.resolve();
        }));
    }
    /**
     * @param {?} itemId
     * @return {?}
     */
    saveItemState(itemId) {
        /** @type {?} */
        const items = this.goldenLayout.root.getItemsById(itemId);
        /** @type {?} */
        const item = items && items.length ? items[0] : null;
        if (!item) {
            return null;
        }
        return item.config;
    }
    /**
     * @return {?}
     */
    closePopups() {
        this.popupsWindows.forEach((/**
         * @param {?} p
         * @return {?}
         */
        (p) => {
            p.close();
        }));
    }
    /**
     * @return {?}
     */
    getAllComponents() {
        if (this.goldenLayout && this.goldenLayout.isInitialised) {
            return (/** @type {?} */ (this.goldenLayout.root.getItemsByType('component')));
        }
        return [];
    }
    /**
     * @private
     * @param {?} state
     * @return {?}
     */
    _normalizeLayoutState(state) {
        /** @type {?} */
        let normalizedState = (/** @type {?} */ (Object.assign({}, state, {
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
    }
    /**
     * @private
     * @param {?} state
     * @return {?}
     */
    _migrateState(state) {
        /** @type {?} */
        const stateVersion = state.version;
        if (stateVersion === GoldenLayoutComponent.stateVersion) {
            return state;
        }
        if (state.version == null || state.version !== GoldenLayoutComponent.stateVersion) {
            console.warn(`Incompatible layout state verGoldenLayoutStatesions. Current layout state version: ${GoldenLayoutComponent.stateVersion}, your state version: ${state.version || 'none'}`);
            state.content = []; // clear all components
        }
        return state;
    }
    /**
     * @param {?} componentConfig
     * @return {?}
     */
    addItemAsColumn(componentConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.goldenLayout == null) {
                try {
                    if (this.goldenLayout.isInitialised) {
                        this.goldenLayout.destroy();
                    }
                    yield this._createLayout(null);
                }
                catch (e) {
                    console.error(e);
                }
            }
            /** @type {?} */
            const layoutRoot = ((/** @type {?} */ (this.goldenLayout.root)));
            if (this.isLayoutEmpty) {
                layoutRoot.addChild(componentConfig);
                return;
            }
            if (layoutRoot.contentItems.length === 1 && layoutRoot.contentItems[0].isRow) {
                layoutRoot.contentItems[0].addChild(componentConfig);
                return;
            }
            /** @type {?} */
            const row = (/** @type {?} */ (this.goldenLayout.createContentItem({
                type: 'row',
                id: (new Date()).getTime(),
                // (new Date()).getTime()
                width: 100,
                height: 100
            })));
            /** @type {?} */
            const temp = this.goldenLayout.root.contentItems[0];
            this.goldenLayout.root.replaceChild(temp, row);
            row.addChild(temp);
            row.addChild(componentConfig);
        });
    }
    /**
     * @param {?} componentName
     * @param {?} componentState
     * @return {?}
     */
    addComponentAsColumn(componentName, componentState) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {?} */
            const componentConfig = this._createComponentContentItemConfig(componentName, componentState);
            this.addItemAsColumn(componentConfig);
        });
    }
    /**
     * @param {?} componentName
     * @param {?} componentState
     * @param {?} parent
     * @return {?}
     */
    addComponent(componentName, componentState, parent) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            /** @type {?} */
            const componentConfig = this._createComponentContentItemConfig(componentName, componentState);
            if (this.isLayoutEmpty) {
                this.goldenLayout.root.addChild(componentConfig);
                return;
            }
            if (!parent) {
                this.addComponentAsColumn(componentName, componentState);
            }
            parent.addChild(componentConfig);
        });
    }
    /**
     * @param {?} componentConfig
     * @return {?}
     */
    addItem(componentConfig) {
        /** @type {?} */
        const isLayoutEmpty = this.goldenLayout.root.contentItems.length === 0;
        /** @type {?} */
        const stack = {
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
            const stackContentItem = this.goldenLayout.createContentItem({
                type: 'stack',
                id: (new Date()).getTime(),
                content: []
            });
            stackContentItem.addChild(this.goldenLayout.createContentItem(componentConfig));
            /** @type {?} */
            const column = (/** @type {?} */ (this.goldenLayout.createContentItem({
                type: 'column',
                id: (new Date()).getTime(),
                width: 100,
                height: 100
            })));
            /** @type {?} */
            const temp = this.goldenLayout.root.contentItems[0];
            this.goldenLayout.root.replaceChild(temp, column);
            column.addChild(temp);
            column.addChild(stackContentItem);
        }
    }
    /**
     * @param {?} id
     * @return {?}
     */
    getItemsById(id) {
        return (/** @type {?} */ (((/** @type {?} */ (this.goldenLayout.root))).getItemsById(id)));
    }
    /**
     * @private
     * @param {?} labels
     * @return {?}
     */
    _setLabels(labels) {
        this._labels = Object.assign({}, DefaultLabels, labels);
        /** @type {?} */
        const isLayoutInitialized = (/**
         * @return {?}
         */
        () => {
            return this.goldenLayout && this.goldenLayout.isInitialised;
        });
        /** @type {?} */
        const getLabel = (/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            return this._getLabel(label, false)
                .pipe(filter((/**
             * @return {?}
             */
            () => isLayoutInitialized())), takeUntil(this._destroy$));
        });
        getLabel('addComponent')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.${Class.addComponent}`).attr('title', label);
        }));
        getLabel('close')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.${Class.close}`).attr('title', label);
        }));
        getLabel('maximise')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.${Class.maximise}`).attr('title', label);
        }));
        getLabel('minimise')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.lm_maximised .${Class.maximise}`).attr('title', label);
        }));
        getLabel('popout')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.${Class.popout}`).attr('title', label);
        }));
        getLabel('additionalTabs')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.${Class.tabsDropdown}`).attr('title', label);
        }));
        getLabel('popin')
            .subscribe((/**
         * @param {?} label
         * @return {?}
         */
        (label) => {
            $(this.el.nativeElement).find(`.${Class.popin}`).attr('title', label);
        }));
    }
    /**
     * @private
     * @param {?} label
     * @param {?=} firstValue
     * @return {?}
     */
    _getLabel(label, firstValue = true) {
        /** @type {?} */
        const label$ = this._labels[label];
        if (firstValue) {
            return label$
                .pipe(first());
        }
        return label$;
    }
    /**
     * @return {?}
     */
    updateSize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
        this._isDestroyed = true;
    }
    /**
     * @return {?}
     */
    clear() {
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    unloadNotification($event) {
        this.closePopups();
    }
    /**
     * @return {?}
     */
    destroy() {
        this.closePopups();
        this._destroy$.next();
        this._destroy$.complete();
    }
    /**
     * @private
     * @param {?} componentName
     * @param {?} componentState
     * @return {?}
     */
    _createComponentContentItemConfig(componentName, componentState) {
        return {
            type: 'component',
            id: (new Date()).getTime().toString(),
            componentName: componentName,
            componentState: {
                componentState: componentState
            }
        };
    }
}
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
GoldenLayoutComponent.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: LayoutManagerService },
    { type: ComponentFactoryResolver },
    { type: NgZone },
    { type: ChangeDetectorRef },
    { type: ApplicationRef },
    { type: Injector },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentConfiguration,] }] }
];
GoldenLayoutComponent.propDecorators = {
    el: [{ type: ViewChild, args: ['glroot', { static: false },] }],
    onResize: [{ type: HostListener, args: ['window:resize', ['$event'],] }],
    unloadNotification: [{ type: HostListener, args: ['window:unload', ['$event'],] }]
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWdvbGRlbi1sYXlvdXQvIiwic291cmNlcyI6WyJsaWIvY29tcG9uZW50cy9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDREQUE0RDs7QUFFNUQsT0FBTyxFQUNILGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULHdCQUF3QixFQUV4QixVQUFVLEVBQ1YsWUFBWSxFQUFFLE1BQU0sRUFDcEIsUUFBUSxFQUNSLE1BQU0sRUFDTixrQkFBa0IsRUFFbEIsU0FBUyxFQUNULGdCQUFnQixFQUNuQixNQUFNLGVBQWUsQ0FBQztBQUl2QixPQUFPLEVBQUMsZUFBZSxFQUFFLFNBQVMsRUFBYyxFQUFFLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw0Q0FBNEMsQ0FBQztBQUNqRixPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx5REFBeUQsQ0FBQztBQUUxRyxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUMzRSxPQUFPLEVBQTRCLGtCQUFrQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFekYsT0FBTyxFQUFDLDhCQUE4QixFQUFDLE1BQU0saURBQWlELENBQUM7QUFDL0YsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDbEcsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sNkNBQTZDLENBQUM7Ozs7QUFLbEYsdUNBQ0M7O01BRUssaUJBQWlCLEdBQUcsZUFBZTs7QUFDekMsTUFBTSxPQUFPLGFBQWEsR0FBdUI7SUFDN0Ms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YztZQU9kLFFBQVE7NENBaUdLLE1BQU0sU0FBQyxrQ0FBa0M7OztpQkFsQ3JELFNBQVMsU0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDO3VCQXFNbkMsWUFBWSxTQUFDLGVBQWUsRUFBRSxDQUFDLFFBQVEsQ0FBQztpQ0FvckJ4QyxZQUFZLFNBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxDQUFDOzs7O0lBMTNCekMsbUNBQTBCOzs7OztJQUMxQixtQ0FBNkQ7O0lBRTdELDhDQUF5Qzs7SUFDekMsZ0RBQXFDOztJQUNyQyw2Q0FBbUQ7O0lBQ25ELDhDQUE4Qjs7SUFDOUIsNkNBQTJCOzs7OztJQUUzQiwwQ0FBa0M7Ozs7O0lBQ2xDLHdDQUFvRDs7Ozs7SUFDcEQseUNBQWlDOzs7OztJQUNqQyx5REFBeUM7Ozs7O0lBQ3pDLDZDQUE2Qjs7Ozs7SUFlakIsOENBQXVDOzs7OztJQUN2QywrQ0FBNEM7Ozs7O0lBQzVDLHlEQUEwRDs7Ozs7SUFDMUQsdUNBQXNCOzs7OztJQUN0QixtREFBNkM7Ozs7O0lBQzdDLHdDQUErQjs7Ozs7SUFDL0IseUNBQTBCOzs7OztJQUMxQiwrQ0FBdUciLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vLi4vbGlicy9nb2xkZW4tbGF5b3V0LmQudHNcIiAvPlxuXG5pbXBvcnQge1xuICAgIEFwcGxpY2F0aW9uUmVmLFxuICAgIENoYW5nZURldGVjdG9yUmVmLFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29tcG9uZW50UmVmLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgSG9zdExpc3RlbmVyLCBJbmplY3QsXG4gICAgSW5qZWN0b3IsXG4gICAgTmdab25lLFxuICAgIFJlZmxlY3RpdmVJbmplY3RvcixcbiAgICBUeXBlLFxuICAgIFZpZXdDaGlsZCxcbiAgICBWaWV3Q29udGFpbmVyUmVmXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21wb25lbnRSZXNvbHZlciwgR29sZGVuTGF5b3V0TGFiZWxzLCBJR29sZGVuTGF5b3V0Q29tcG9uZW50Q29uZmlndXJhdGlvbn0gZnJvbSAnLi4vLi4vbW9kZWxzL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtJR29sZGVuTGF5b3V0Q29tcG9uZW50U3RhdGV9IGZyb20gXCIuLi8uLi9tb2RlbHMvZ29sZGVuLWxheW91dC1jb21wb25lbnQtc3RhdGVcIjtcbmltcG9ydCBDb250YWluZXIgPSBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGFpbmVyO1xuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIGZyb21FdmVudCwgT2JzZXJ2YWJsZSwgb2YsIFN1YmplY3R9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQge2F1ZGl0VGltZSwgZmlsdGVyLCBmaXJzdCwgdGFrZVVudGlsfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcbmltcG9ydCB7R29sZGVuTGF5b3V0Q29udGFpbmVyfSBmcm9tIFwiLi4vLi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtY29udGFpbmVyLnRva2VuXCI7XG5pbXBvcnQge0dvbGRlbkxheW91dEl0ZW1Db21wb25lbnRSZXNvbHZlcn0gZnJvbSBcIi4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWl0ZW0tY29tcG9uZW50LWZhY3RvcnkudG9rZW5cIjtcblxuaW1wb3J0IHtMYXlvdXRNYW5hZ2VyU2VydmljZX0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2xheW91dC1tYW5hZ2VyLnNlcnZpY2VcIjtcbmltcG9ydCB7SVBvcHVwV2luZG93TWFuYWdlckNvbmZpZywgUG9wdXBXaW5kb3dNYW5hZ2VyfSBmcm9tIFwiLi4vLi4vcG9wdXAtd2luZG93LW1hbmFnZXJcIjtcbmltcG9ydCBDb21wb25lbnRDb25maWcgPSBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29tcG9uZW50Q29uZmlnO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRJdGVtQ29udGFpbmVyVG9rZW59IGZyb20gXCIuLi8uLi90b2tlbnMvZ29sZGVuLWxheW91dC1pdGVtLWNvbnRhaW5lci50b2tlblwiO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9ufSBmcm9tIFwiLi4vLi4vdG9rZW5zL2dvbGRlbi1sYXlvdXQtY29uZmlndXJhdGlvbi50b2tlblwiO1xuaW1wb3J0IHtHb2xkZW5MYXlvdXRJdGVtU3RhdGV9IGZyb20gJy4uLy4uL3Rva2Vucy9nb2xkZW4tbGF5b3V0LWl0ZW0tc3RhdGUudG9rZW4nO1xuaW1wb3J0IHtJR29sZGVuTGF5b3V0SXRlbX0gZnJvbSAnLi4vLi4vbW9kZWxzL2dvbGRlbi1sYXlvdXQtaXRlbSc7XG5cbmV4cG9ydCB0eXBlIENvbXBvbmVudEluaXRDYWxsYmFjayA9IChjb250YWluZXI6IEdvbGRlbkxheW91dE5hbWVzcGFjZS5Db250YWluZXIsIGNvbXBvbmVudFN0YXRlOiBhbnkpID0+IHZvaWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR29sZGVuTGF5b3V0U3RhdGUgZXh0ZW5kcyBJR29sZGVuTGF5b3V0Q29tcG9uZW50U3RhdGUsIEdvbGRlbkxheW91dE5hbWVzcGFjZS5Db25maWcge1xufVxuXG5jb25zdCBDT01QT05FTlRfUkVGX0tFWSA9ICckY29tcG9uZW50UmVmJztcbmV4cG9ydCBjb25zdCBEZWZhdWx0TGFiZWxzOiBHb2xkZW5MYXlvdXRMYWJlbHMgPSB7XG4gICAgYWRkaXRpb25hbFRhYnM6IG9mKCdBZGRpdGlvbmFsIHRhYnMnKSxcbiAgICBhZGRDb21wb25lbnQ6IG9mKCdBZGQgQ29tcG9uZW50JyksXG4gICAgbWF4aW1pc2U6IG9mKCdNYXhpbWlzZScpLFxuICAgIG1pbmltaXNlOiBvZignTWluaW1pc2UnKSxcbiAgICBwb3BvdXQ6IG9mKCdPcGVuIGluIG5ldyB3aW5kb3cnKSxcbiAgICBwb3Bpbjogb2YoJ1BvcCBpbicpLFxuICAgIGNsb3NlOiBvZignQ2xvc2UnKSxcbiAgICBsb2FkaW5nOiBvZignTG9hZGluZycpLFxuICAgIGZhaWxlZFRvTG9hZENvbXBvbmVudDogb2YoJ0ZhaWxlZCB0byBsb2FkIGNvbXBvbmVudCcpXG59O1xuY29uc3QgQ2xhc3MgPSB7XG4gICAgdGFic0Ryb3Bkb3duOiAnbG1fdGFiZHJvcGRvd24nLFxuICAgIGFkZENvbXBvbmVudDogJ2xtX2FkZC1jb21wb25lbnQnLFxuICAgIGNsb3NlOiAnbG1fY2xvc2UnLFxuICAgIGNsb3NlVGFiOiAnbG1fY2xvc2VfdGFiJyxcbiAgICBtYXhpbWlzZTogJ2xtX21heGltaXNlJyxcbiAgICBwb3BvdXQ6ICdsbV9wb3BvdXQnLFxuICAgIHBvcGluOiAnbG1fcG9waW4nLFxuICAgIHRhYkRyYWc6ICdsbV90YWJfZHJhZycsXG4gICAgQ2xvc2FibGVUYWI6ICdjbG9zYWJsZS10YWInXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICAgIHNlbGVjdG9yOiAnZ29sZGVuLWxheW91dCcsXG4gICAgdGVtcGxhdGVVcmw6ICdnb2xkZW4tbGF5b3V0LmNvbXBvbmVudC5odG1sJyxcbiAgICBzdHlsZVVybHM6IFtcbiAgICAgICAgJ2dvbGRlbi1sYXlvdXQuY29tcG9uZW50LnNjc3MnXG4gICAgXSxcbiAgICBwcm92aWRlcnM6IFtdXG59KVxuZXhwb3J0IGNsYXNzIEdvbGRlbkxheW91dENvbXBvbmVudCB7XG4gICAgc3RhdGljIHN0YXRlVmVyc2lvbiA9ICcxJzsgLy8gYWxzbyBuZWVkIGNoYW5nZSBpbiBzYXZlZCB3b3Jrc3BhY2VzXG4gICAgQFZpZXdDaGlsZCgnZ2xyb290Jywge3N0YXRpYzogZmFsc2V9KSBwcml2YXRlIGVsOiBFbGVtZW50UmVmO1xuXG4gICAgcG9wdXBzV2luZG93czogUG9wdXBXaW5kb3dNYW5hZ2VyW10gPSBbXTtcbiAgICAkb25BZGRDb21wb25lbnQgPSBuZXcgU3ViamVjdDxhbnk+KCk7XG4gICAgJGxheW91dEVtcHR5ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG4gICAgJHN0YXRlQ2hhbmdlZCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgZ29sZGVuTGF5b3V0OiBHb2xkZW5MYXlvdXQ7XG5cbiAgICBwcml2YXRlIF9kZXN0cm95JCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgcHJpdmF0ZSBfbGFiZWxzOiBHb2xkZW5MYXlvdXRMYWJlbHMgPSBEZWZhdWx0TGFiZWxzO1xuICAgIHByaXZhdGUgX3Jlc2l6ZSQgPSBuZXcgU3ViamVjdCgpO1xuICAgIHByaXZhdGUgX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfaXNEZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIGdldCBpc0xheW91dEVtcHR5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy4kbGF5b3V0RW1wdHkuZ2V0VmFsdWUoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0U2luZ2xlQ29tcG9uZW50TGF5b3V0Q29uZmlnKGNvbXBvbmVudENvbmZpZzogQ29tcG9uZW50Q29uZmlnKTogSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZlcnNpb246IEdvbGRlbkxheW91dENvbXBvbmVudC5zdGF0ZVZlcnNpb24sXG4gICAgICAgICAgICBjb250ZW50OiBbXG4gICAgICAgICAgICAgICAgY29tcG9uZW50Q29uZmlnXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgX2xheW91dE1hbmFnZXI6IExheW91dE1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBfYXBwUmVmOiBBcHBsaWNhdGlvblJlZixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgICAgICAgICAgICBASW5qZWN0KEdvbGRlbkxheW91dENvbXBvbmVudENvbmZpZ3VyYXRpb24pIHByaXZhdGUgX2NvbmZpZ3VyYXRpb246IElHb2xkZW5MYXlvdXRDb21wb25lbnRDb25maWd1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuX2xheW91dE1hbmFnZXIuc2V0TGF5b3V0KHRoaXMpO1xuICAgICAgICB0aGlzLl9zZXRMYWJlbHModGhpcy5fY29uZmlndXJhdGlvbi5sYWJlbHMgPyBPYmplY3QuYXNzaWduKHt9LCBEZWZhdWx0TGFiZWxzLCB0aGlzLl9jb25maWd1cmF0aW9uLmxhYmVscykgOiBEZWZhdWx0TGFiZWxzKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplJFxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgYXVkaXRUaW1lKDEwKSxcbiAgICAgICAgICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveSQpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nb2xkZW5MYXlvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIG5nRG9DaGVjaygpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zdXBwcmVzc0NoYW5nZURldGVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wb3B1cHNXaW5kb3dzLmZvckVhY2godyA9PiB3LnJ1bkNoYW5nZURldGVjdGlvbigpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3JlZ2lzdGVyQ29tcG9uZW50cygpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb21wb25lbnQgb2YgdGhpcy5fY29uZmlndXJhdGlvbi5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5yZWdpc3RlckNvbXBvbmVudChcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29tcG9uZW50TmFtZSxcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbXBvbmVudEluaXRDYWxsYmFjayhjb21wb25lbnQpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXRlTGF5b3V0KHN0YXRlOiBHb2xkZW5MYXlvdXRTdGF0ZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUxheW91dCA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vdE9wZW5lZFBvcHVwc0NvbXBvbmVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5vcGVuUG9wdXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbUNvbmZpZyBvZiBzdGF0ZS5vcGVuUG9wdXBzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuZWQgPSB0aGlzLl9vcGVuUG9wdXAoaXRlbUNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3BlbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90T3BlbmVkUG9wdXBzQ29tcG9uZW50cy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtQ29uZmlnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChub3RPcGVuZWRQb3B1cHNDb21wb25lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0xheW91dEVtcHR5ID0gc3RhdGUuY29udGVudC5sZW5ndGggPT09IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTGF5b3V0RW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmNvbnRlbnQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLm5vdE9wZW5lZFBvcHVwc0NvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jb250ZW50ID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJyb3dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmNvbnRlbnRbMF0sIHt3aWR0aDogNTAsIGhlaWdodDogMTAwfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5ub3RPcGVuZWRQb3B1cHNDb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0ID0gbmV3IEdvbGRlbkxheW91dChzdGF0ZSBhcyBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29uZmlnLCAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdzdGF0ZUNoYW5nZWQnLCAodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5nb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc3RhdGVDaGFuZ2VkLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVnaXN0ZXJDb21wb25lbnRzKCk7XG5cbiAgICAgICAgICAgICAgICAod2luZG93IGFzIGFueSkuZ2wgPSB0aGlzLmdvbGRlbkxheW91dDtcbiAgICAgICAgICAgICAgICAod2luZG93IGFzIGFueSkuZ2xjID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdpdGVtQ3JlYXRlZCcsIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUl0ZW1DcmVhdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gRGVzdG9yeSBjaGlsZCBhbmd1bGFyIGNvbXBvbmVudHMgb24gZ29sZGVuLWhlbHBlcnMgY29udGFpbmVyIGRlc3RydWN0aW9uLlxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdpdGVtRGVzdHJveWVkJywgKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBpdGVtLmNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29udGFpbmVyICYmIGNvbnRhaW5lcltDT01QT05FTlRfUkVGX0tFWV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChjb250YWluZXIgYXMgYW55KVtDT01QT05FTlRfUkVGX0tFWV0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5vbignc3RhY2tDcmVhdGVkJywgKHN0YWNrKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZVN0YWNrQ3JlYXRlZChzdGFjayk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5ldmVudEh1Yi5vbignc2VsZWN0aW9uQ2hhbmdlZCcsIChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LmV2ZW50SHViLm9uKCdjb2x1bW5DcmVhdGVkJywgKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQub24oJ2l0ZW1DcmVhdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRsYXlvdXRFbXB0eS5uZXh0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdpdGVtRGVzdHJveWVkJywgKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IF9pZ25vcmVkSXRlbSA9IG51bGw7IC8vIGl0ZW0gdGhhdCB3aWxsIGJlIHJlcGxhY2VkXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChpdGVtOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnBhcmVudCAmJiAoaXRlbS5wYXJlbnQuaXNDb2x1bW4gfHwgaXRlbS5wYXJlbnQuaXNSb3cpICYmIGl0ZW0ucGFyZW50LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWdub3JlZEl0ZW0gPSBpdGVtLnBhcmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gIT09IF9pZ25vcmVkSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzTGF5b3V0RW1wdHkgPSB0aGlzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtcy5maWx0ZXIoKGkpID0+IGkgIT09IGl0ZW0pLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRsYXlvdXRFbXB0eS5uZXh0KGlzTGF5b3V0RW1wdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdiZWZvcmVJdGVtRGVzdHJveWVkJywgKGl0ZW06IEdvbGRlbkxheW91dE5hbWVzcGFjZS5Db250ZW50SXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5pc01heGltaXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVNYXhpbWlzZSgpOyAvLyBmaXggaXNzdWUgd2l0aCBkZWxldGluZyBtYXhpbWlzZWQgY29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdpbml0aWFsaXNlZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kbGF5b3V0RW1wdHkubmV4dCh0aGlzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5nb2xkZW5MYXlvdXQudXBkYXRlU2l6ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIGhlbHBlcnMuXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQuaW5pdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWopID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyAvLyB1c2UgdGltZW91dCBmb3IgY29ycmVjdCBzaXppbmdcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNyZWF0ZUxheW91dCgpKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgb25SZXNpemUoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZXNpemUkLm5leHQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVJdGVtQ3JlYXRlZChpdGVtOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW0pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChpdGVtLmlzU3RhY2sgJiYgdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zaG93QWRkQnRuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkZENvbXBvbmVudEJ0biA9ICQoYDxzcGFuIGNsYXNzPScke0NsYXNzLmFkZENvbXBvbmVudH0nPjwvc3Bhbj5gKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2dldExhYmVsKCdhZGRDb21wb25lbnQnKVxuICAgICAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ29tcG9uZW50QnRuLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldEFkZENvbXBvbmVudEJ0bkljb24pIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkQ29tcG9uZW50QnRuLmFwcGVuZCh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldEFkZENvbXBvbmVudEJ0bkljb24oKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJCgoaXRlbSBhcyBhbnkpLmhlYWRlci50YWJzQ29udGFpbmVyKS5hcHBlbmQoYWRkQ29tcG9uZW50QnRuKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFkZENvbXBvbmVudEJ0bi5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRvbkFkZENvbXBvbmVudC5uZXh0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXRlbS5vbigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlU3RhY2tDcmVhdGVkKHN0YWNrOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2hvd0Nsb3NlSWNvbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZENsb3NlQnRuKHN0YWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5maW5kKGAuJHtDbGFzcy5jbG9zZX1gKS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zaG93TWF4aW1pc2VJY29uICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkTWF4aW1pemVCdG4oc3RhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhY2suaGVhZGVyLmNvbnRyb2xzQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgLmZpbmQoYC4ke0NsYXNzLm1heGltaXNlfWApLmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnNob3dQb3BvdXRJY29uICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkUG9wb3V0QnRuKHN0YWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5maW5kKGAuJHtDbGFzcy5wb3BvdXR9YCkuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0TGFiZWwoJ2FkZGl0aW9uYWxUYWJzJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhY2suaGVhZGVyLmNvbnRyb2xzQ29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKGAuJHtDbGFzcy50YWJzRHJvcGRvd259YCkuYXR0cigndGl0bGUnLCBsYWJlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zaG93UG9waW5JY29uICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkUG9waW5CdG4oc3RhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZUNvbXBvbmVudEluaXRDYWxsYmFjayhjb21wb25lbnRSZXNvbHZlcjogQ29tcG9uZW50UmVzb2x2ZXIpOiBDb21wb25lbnRJbml0Q2FsbGJhY2sge1xuICAgICAgICBjb25zdCB0aGF0ID0gdGhpcztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvbnRhaW5lcjogQ29udGFpbmVyLCBzdGF0ZTogYW55KSB7XG4gICAgICAgICAgICB0aGF0Lm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgYW5ndWxhciBjb21wb25lbnQuXG5cbiAgICAgICAgICAgICAgICBjb25zdCBmYWN0b3J5ID0gdGhhdC5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkodGhhdC5pbmplY3Rvci5nZXQoR29sZGVuTGF5b3V0SXRlbUNvbnRhaW5lclRva2VuKSBhcyBUeXBlPElHb2xkZW5MYXlvdXRJdGVtPik7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGF0Ll9jcmVhdGVDb21wb25lbnRJbmplY3Rvcihjb250YWluZXIsIHN0YXRlLmNvbXBvbmVudFN0YXRlLCBjb21wb25lbnRSZXNvbHZlcik7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50UmVmID0gdGhhdC52aWV3Q29udGFpbmVyLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCB1bmRlZmluZWQsIGluamVjdG9yKTtcblxuICAgICAgICAgICAgICAgIC8vIEJpbmQgdGhlIG5ldyBjb21wb25lbnQgdG8gY29udGFpbmVyJ3MgY2xpZW50IERPTSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5nZXRFbGVtZW50KCkuYXBwZW5kKCQoY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpKTtcblxuICAgICAgICAgICAgICAgIHRoYXQuX2JpbmRFdmVudEhvb2tzKGNvbnRhaW5lciwgY29tcG9uZW50UmVmKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9pbml0Q29tcG9uZW50KGNvbnRhaW5lciwgY29tcG9uZW50UmVmLmluc3RhbmNlKTtcblxuICAgICAgICAgICAgICAgICh3aW5kb3cgYXMgYW55KS5jb250YWluZXIgPSBjb250YWluZXI7XG5cbiAgICAgICAgICAgICAgICAvLyBTdG9yZSBhIHJlZiB0byB0aGUgY29tcG9lbmVudFJlZiBpbiB0aGUgY29udGFpbmVyIHRvIHN1cHBvcnQgZGVzdHJ1Y3Rpb24gbGF0ZXIgb24uXG4gICAgICAgICAgICAgICAgKGNvbnRhaW5lciBhcyBhbnkpW0NPTVBPTkVOVF9SRUZfS0VZXSA9IGNvbXBvbmVudFJlZjtcblxuXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgZmFjdG9yeSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGxheW91dEl0ZW1DbGFzcyk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3QgaW5qZWN0b3IgPSB0aGlzLl9jcmVhdGVDb21wb25lbnRJbmplY3Rvcihjb250YWluZXIsIHN0YXRlLmNvbXBvbmVudFN0YXRlKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCBjb21wb25lbnRSZWYgPSB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnksIHVuZGVmaW5lZCwgaW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gLy8gQmluZCB0aGUgbmV3IGNvbXBvbmVudCB0byBjb250YWluZXIncyBjbGllbnQgRE9NIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gY29udGFpbmVyLmdldEVsZW1lbnQoKS5hcHBlbmQoJChjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5fYmluZEV2ZW50SG9va3MoY29udGFpbmVyLCBjb21wb25lbnRSZWYpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2luaXRDb21wb25lbnQoY29udGFpbmVyLCBjb21wb25lbnRSZWYuaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gKHdpbmRvdyBhcyBhbnkpLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIC8vIFN0b3JlIGEgcmVmIHRvIHRoZSBjb21wb2VuZW50UmVmIGluIHRoZSBjb250YWluZXIgdG8gc3VwcG9ydCBkZXN0cnVjdGlvbiBsYXRlciBvbi5cbiAgICAgICAgICAgICAgICAvLyAoY29udGFpbmVyIGFzIGFueSlbQ09NUE9ORU5UX1JFRl9LRVldID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGZpcmVTdGF0ZUNoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuJHN0YXRlQ2hhbmdlZC5uZXh0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBpbmplY3RvciBjYXBhYmxlIG9mIGluamVjdGluZyB0aGUgTGF5b3V0IG9iamVjdCxcbiAgICAgKiBjb21wb25lbnQgY29udGFpbmVyLCBhbmQgaW5pdGlhbCBjb21wb25lbnQgc3RhdGUuXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY3JlYXRlQ29tcG9uZW50SW5qZWN0b3IoY29udGFpbmVyOiBhbnksIHN0YXRlOiBhbnksIGNvbXBvbmVudFJlc29sdmVyOiBDb21wb25lbnRSZXNvbHZlcik6IEluamVjdG9yIHtcbiAgICAgICAgcmV0dXJuIFJlZmxlY3RpdmVJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlOiBHb2xkZW5MYXlvdXRDb250YWluZXIsXG4gICAgICAgICAgICAgICAgdXNlVmFsdWU6IGNvbnRhaW5lclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlOiBHb2xkZW5MYXlvdXRJdGVtU3RhdGUsXG4gICAgICAgICAgICAgICAgdXNlVmFsdWU6IHN0YXRlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHByb3ZpZGU6IEdvbGRlbkxheW91dCxcbiAgICAgICAgICAgICAgICB1c2VWYWx1ZTogdGhpcy5nb2xkZW5MYXlvdXRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0Q29tcG9uZW50LFxuICAgICAgICAgICAgICAgIHVzZVZhbHVlOiB0aGlzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHByb3ZpZGU6IEdvbGRlbkxheW91dEl0ZW1Db21wb25lbnRSZXNvbHZlcixcbiAgICAgICAgICAgICAgICB1c2VWYWx1ZTogY29tcG9uZW50UmVzb2x2ZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSwgdGhpcy5pbmplY3Rvcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIGVhY2ggaW1wbGVtZW50ZWQgaG9vay5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEdvbGRlbiBMYXlvdXQgY29tcG9uZW50IGNvbnRhaW5lci5cbiAgICAgKiBAcGFyYW0gY29tcG9uZW50IEFuZ3VsYXIgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIHByaXZhdGUgX2JpbmRFdmVudEhvb2tzKGNvbnRhaW5lcjogYW55LCBjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxJR29sZGVuTGF5b3V0SXRlbT4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50UmVmLmluc3RhbmNlIGFzIElHb2xkZW5MYXlvdXRJdGVtO1xuXG4gICAgICAgIGNvbnRhaW5lci5vbigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50Lm9uUmVzaXplKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRhaW5lci5vbignc2hvdycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5vblNob3coKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29udGFpbmVyLm9uKCdoaWRlJywgKCkgPT4ge1xuICAgICAgICAgICAgY29tcG9uZW50Lm9uSGlkZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb250YWluZXIub24oJ3RhYicsICh0YWI6IEdvbGRlbkxheW91dE5hbWVzcGFjZS5UYWIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVRhYkNyZWF0ZWQodGFiKTtcblxuICAgICAgICAgICAgaWYgKChjb250YWluZXIgYXMgYW55KS5fY29uZmlnLmlzQ2xvc2FibGUpIHtcbiAgICAgICAgICAgICAgICB0YWIuZWxlbWVudC5hZGRDbGFzcyhDbGFzcy5DbG9zYWJsZVRhYik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbXBvbmVudC5vblRhYkNyZWF0ZWQodGFiLmVsZW1lbnQgYXMgSlF1ZXJ5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkUG9wb3V0QnRuKHN0YWNrOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcG9wb3V0QnRuID0gc3RhY2suaGVhZGVyLmNvbnRyb2xzQ29udGFpbmVyXG4gICAgICAgICAgICAuZmluZChgLiR7Q2xhc3MucG9wb3V0fWApO1xuXG4gICAgICAgIHBvcG91dEJ0bi5vZmYoKTtcblxuICAgICAgICB0aGlzLl9nZXRMYWJlbCgncG9wb3V0JykucGlwZSgpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvcG91dEJ0bi5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldFBvcG91dEljb24pIHtcbiAgICAgICAgICAgIHBvcG91dEJ0bi5hcHBlbmQodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRQb3BvdXRJY29uKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9wb3V0QnRuLmNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZVBvcHVwQ2xpY2soc3RhY2spO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRQb3BpbkJ0bihzdGFjazogYW55KSB7XG4gICAgICAgIGNvbnN0IHBvcGluQnRuID0gJChgXG4gICAgICAgICAgICA8bGkgY2xhc3M9XCIke0NsYXNzLnBvcGlufVwiPjwvbGk+XG4gICAgICAgIGApO1xuXG4gICAgICAgIHRoaXMuX2dldExhYmVsKCdwb3BpbicpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvcGluQnRuLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcG9waW5CdG4uYXBwZW5kKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0UG9waW5JY29uKCkpO1xuXG4gICAgICAgIGZyb21FdmVudChwb3BpbkJ0biwgJ2NsaWNrJykucGlwZShcbiAgICAgICAgICAgIGZpcnN0KClcbiAgICAgICAgKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHN0YWNrLmNvbnRlbnRJdGVtcykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NhdmVJdGVtU3RhdGUoY29tcG9uZW50LmNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MucG9waW5IYW5kbGVyKHN0YWNrLmNvbmZpZyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lci5maW5kKCcubG1fdGFiZHJvcGRvd24nKS5hZnRlcihwb3BpbkJ0bik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TWF4aW1pc2VJY29uKCk6IEpRdWVyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldE1heGltaXNlSWNvblxuICAgICAgICAgICAgPyB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldE1heGltaXNlSWNvbigpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZ2V0TWluaW1pc2VJY29uKCk6IEpRdWVyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldE1pbmltaXNlSWNvblxuICAgICAgICAgICAgPyB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldE1pbmltaXNlSWNvbigpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkTWF4aW1pemVCdG4oc3RhY2s6IGFueSkge1xuICAgICAgICBjb25zdCB1cGRhdGVCdG4gPSAoaXNNYXhpbWlzZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGljb24gPSBpc01heGltaXNlZCA/IHRoaXMuX2dldE1pbmltaXNlSWNvbigpIDogdGhpcy5fZ2V0TWF4aW1pc2VJY29uKCk7XG4gICAgICAgICAgICBjb25zdCBtYXhpbWlzZUJ0biA9IHN0YWNrLmhlYWRlci5jb250cm9sc0NvbnRhaW5lci5maW5kKGAuJHtDbGFzcy5tYXhpbWlzZX1gKTtcblxuICAgICAgICAgICAgbWF4aW1pc2VCdG4uZW1wdHkoKTtcblxuICAgICAgICAgICAgdGhpcy5fZ2V0TGFiZWwoaXNNYXhpbWlzZWQgPyAnbWluaW1pc2UnIDogJ21heGltaXNlJylcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG1heGltaXNlQnRuLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaWNvbikge1xuICAgICAgICAgICAgICAgIG1heGltaXNlQnRuLmFwcGVuZChpY29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBzdGFjay5vbignbWF4aW1pc2VkJywgKCkgPT4gdXBkYXRlQnRuKHRydWUpKTtcbiAgICAgICAgc3RhY2sub24oJ21pbmltaXNlZCcsICgpID0+IHVwZGF0ZUJ0bihmYWxzZSkpO1xuXG4gICAgICAgIHVwZGF0ZUJ0bihmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkQ2xvc2VCdG4oc3RhY2s6IGFueSkge1xuICAgICAgICBjb25zdCBidG4gPSBzdGFjay5oZWFkZXIuY29udHJvbHNDb250YWluZXIuZmluZChgLiR7Q2xhc3MuY2xvc2V9YCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0Q2xvc2VJY29uKSB7XG4gICAgICAgICAgICBidG4uYXBwZW5kKHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MuZ2V0Q2xvc2VJY29uKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZ2V0TGFiZWwoJ2Nsb3NlJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsKSA9PiB7XG4gICAgICAgICAgICAgICAgYnRuLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkQ2xvc2VUYWJCdG4odGFiOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuVGFiKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmdldENsb3NlVGFiSWNvbikge1xuICAgICAgICAgICAgdGFiLmNsb3NlRWxlbWVudC5hcHBlbmQodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5nZXRDbG9zZVRhYkljb24oKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVUYWJDcmVhdGVkKHRhYjogR29sZGVuTGF5b3V0TmFtZXNwYWNlLlRhYikge1xuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5zaG93Q2xvc2VUYWJJY29uICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5fYWRkQ2xvc2VUYWJCdG4odGFiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhYi5jbG9zZUVsZW1lbnQuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fYWRkTW9iaWxlVGFiRHJhZ2dpbmdTdXBwb3J0KHRhYik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlUG9wdXBDbGljayhzdGFjazogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmNhbk9wZW5Qb3B1cFdpbmRvdyAhPSBudWxsICYmICF0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmNhbk9wZW5Qb3B1cFdpbmRvdygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhY3RpdmVDb250ZW50SXRlbSA9IHN0YWNrLmdldEFjdGl2ZUNvbnRlbnRJdGVtKCk7XG4gICAgICAgIGNvbnN0IHBhcmVudElkID0gYWN0aXZlQ29udGVudEl0ZW0ucGFyZW50ICYmIGFjdGl2ZUNvbnRlbnRJdGVtLnBhcmVudC5jb25maWcuaWQ7XG5cbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBzdGFjay5jb250ZW50SXRlbXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3NhdmVJdGVtU3RhdGUoaXRlbS5jb250YWluZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWN0aXZlQ29udGVudEl0ZW0uY29udGFpbmVyLmV4dGVuZFN0YXRlKHtcbiAgICAgICAgLy8gICAgIGNvbXBvbmVudFN0YXRlOiBhY3RpdmVDb250ZW50SXRlbS5jb250YWluZXJbQ09NUE9ORU5UX1JFRl9LRVldLmluc3RhbmNlLnNhdmVTdGF0ZSgpLFxuICAgICAgICAvLyAgICAgcGFyZW50SWQ6IHBhcmVudElkXG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudENvbmZpZyA9IHN0YWNrLmNvbmZpZztcblxuICAgICAgICB0aGlzLl9vcGVuUG9wdXAoY29tcG9uZW50Q29uZmlnKTtcbiAgICAgICAgc3RhY2sucGFyZW50LnJlbW92ZUNoaWxkKHN0YWNrKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9hZGRNb2JpbGVUYWJEcmFnZ2luZ1N1cHBvcnQodGFiOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuVGFiKSB7XG4gICAgICAgIC8qXG4gICAgICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1RvdWNoL3RhcmdldFxuICAgICAgICAqXG4gICAgICAgICogSWYgdG91Y2hzdGFydCBldmVudCB0YXJnZXQgcmVtb3ZlZCBmcm9tIERPTSwgdGhlbiB0b3VjaG1vdmUgZXZlbnQgd29uJ3QgYmUgZmlyZWRcbiAgICAgICAgKlxuICAgICAgICAqIFNvbHV0aW9uOiBhZGQgb3ZlcmxheSBlbGVtZW50IHRvIGVhY2ggdGFiLCB0aGF0IHdpbGwgYmUgcmVwbGFjZWQgZnJvbSB0YWIgY29udGFpbmVyIHRvIGJvZHkgd2hlbiB0b3VjaHN0YXJ0XG4gICAgICAgICogZXZlbnQgd2lsbCBiZSBmaXJlZFxuICAgICAgICAqXG4gICAgICAgICpcbiAgICAgICAgKiAqL1xuXG4gICAgICAgIGNvbnN0IHRhYkRyYWcgPSAkKGA8c3BhbiBjbGFzcz1cIiR7Q2xhc3MudGFiRHJhZ31cIj48L3NwYW4+YCk7XG4gICAgICAgIHRhYkRyYWcuY3NzKHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgJ3otaW5kZXgnOiAxXG4gICAgICAgIH0pO1xuXG4gICAgICAgICQodGFiLmVsZW1lbnQpLmFwcGVuZCh0YWJEcmFnKTtcblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5yZW9yZGVyRW5hYmxlZCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX292ZXJyaWRlVGFiT25EcmFnU3RhcnQodGFiKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBfb3ZlcnJpZGVUYWJPbkRyYWdTdGFydCh0YWI6IGFueSkge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSB0YWIuX29uRHJhZ1N0YXJ0O1xuICAgICAgICBjb25zdCBkcmFnTGlzdGVuZXIgPSB0YWIuX2RyYWdMaXN0ZW5lcjtcbiAgICAgICAgY29uc3QgZHJhZ0VsZW1lbnQgPSAkKHRhYi5lbGVtZW50KS5maW5kKGAuJHtDbGFzcy50YWJEcmFnfWApO1xuXG4gICAgICAgIGRyYWdMaXN0ZW5lci5vZmYoJ2RyYWdTdGFydCcsIG9yaWdpbiwgdGFiKTtcbiAgICAgICAgY29uc3Qgb25EcmFnU3RhcnQgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgZHJhZ0VsZW1lbnQuYXBwZW5kVG8oJ2JvZHknKTtcbiAgICAgICAgICAgIG9yaWdpbi5jYWxsKHRhYiwgeCwgeSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGFiLl9vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0O1xuICAgICAgICBkcmFnTGlzdGVuZXIub24oJ2RyYWdTdGFydCcsICh0YWIgYXMgYW55KS5fb25EcmFnU3RhcnQsIHRhYik7XG4gICAgICAgIGRyYWdMaXN0ZW5lci5vbignZHJhZ1N0b3AnLCAoKSA9PiB7XG4gICAgICAgICAgICBkcmFnRWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgfSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfb3BlblBvcHVwKGNvbXBvbmVudENvbmZpZzogR29sZGVuTGF5b3V0TmFtZXNwYWNlLkl0ZW1Db25maWcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHBvcHVwV2luZG93OiBXaW5kb3c7XG4gICAgICAgIGxldCBwb3B1cFdpbmRvd01hbmFnZXI6IFBvcHVwV2luZG93TWFuYWdlcjtcblxuICAgICAgICBjb25zdCBwb3B1cFdpbmRvd0NvbmZpZzogSVBvcHVwV2luZG93TWFuYWdlckNvbmZpZyA9IHtcbiAgICAgICAgICAgIGNvbXBvbmVudENvbmZpZzogY29tcG9uZW50Q29uZmlnLFxuICAgICAgICAgICAgbGF5b3V0U2V0dGluZ3M6IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MsXG4gICAgICAgICAgICBwb3BpbkhhbmRsZXI6IChfY29tcG9uZW50Q29uZmlnKSA9PiB7XG4gICAgICAgICAgICAgICAgcG9wdXBXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEl0ZW1Bc0NvbHVtbihfY29tcG9uZW50Q29uZmlnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3B1cFN0YXRlQ2hhbmdlZEhhbmRsZXI6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzdGF0ZUNoYW5nZWQubmV4dCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvcHVwQ2xvc2VkSGFuZGxlcjogKGNsb3NlZEJ5VXNlcjogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjbG9zZWRCeVVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1cHNXaW5kb3dzID0gdGhpcy5wb3B1cHNXaW5kb3dzLmZpbHRlcihwID0+IHAgIT09IHBvcHVwV2luZG93TWFuYWdlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHN0YXRlQ2hhbmdlZC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bkNoYW5nZURldGVjdGlvbkhhbmRsZXI6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdXBwcmVzc0NoYW5nZURldGVjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwUmVmLnRpY2soKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdXBwcmVzc0NoYW5nZURldGVjdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMucG9wdXBzV2luZG93cy5maWx0ZXIodyA9PiB3ICE9PSBwb3B1cFdpbmRvd01hbmFnZXIpLmZvckVhY2godyA9PiB3LnJ1bkNoYW5nZURldGVjdGlvbigpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBwb3B1cFdpbmRvdyA9IFBvcHVwV2luZG93TWFuYWdlci5vcGVuV2luZG93KHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MucG9wdXBXaW5kb3dVcmwpO1xuXG4gICAgICAgIGlmICghcG9wdXBXaW5kb3cpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLm9wZW5Qb3B1cEZhaWx1cmVIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5vcGVuUG9wdXBGYWlsdXJlSGFuZGxlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5vcGVuUG9wdXBIb29rKSB7XG4gICAgICAgICAgICB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLm9wZW5Qb3B1cEhvb2socG9wdXBXaW5kb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgcG9wdXBXaW5kb3dNYW5hZ2VyID0gbmV3IFBvcHVwV2luZG93TWFuYWdlcihwb3B1cFdpbmRvdywgcG9wdXBXaW5kb3dDb25maWcpO1xuXG4gICAgICAgIHRoaXMucG9wdXBzV2luZG93cy5wdXNoKHBvcHVwV2luZG93TWFuYWdlcik7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2F2ZUl0ZW1TdGF0ZShjb250YWluZXI6IENvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIuc2V0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgY29udGFpbmVyLmdldFN0YXRlKCksIHtcbiAgICAgICAgICAgIGNvbXBvbmVudFN0YXRlOiAoY29udGFpbmVyW0NPTVBPTkVOVF9SRUZfS0VZXS5pbnN0YW5jZSBhcyBJR29sZGVuTGF5b3V0SXRlbSkuc2F2ZVN0YXRlKClcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHNhdmVTdGF0ZSgpOiBHb2xkZW5MYXlvdXRTdGF0ZSB7XG4gICAgICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmdldEFsbENvbXBvbmVudHMoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2F2ZUl0ZW1TdGF0ZSgoY29tcG9uZW50IGFzIGFueSkuY29udGFpbmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0YXRlOiBHb2xkZW5MYXlvdXRTdGF0ZSA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMuZ29sZGVuTGF5b3V0LnRvQ29uZmlnKCksXG4gICAgICAgICAgICBvcGVuUG9wdXBzOiB0aGlzLnBvcHVwc1dpbmRvd3MubWFwKHAgPT4gcC5zYXZlU3RhdGUoKSksXG4gICAgICAgICAgICB2ZXJzaW9uOiBHb2xkZW5MYXlvdXRDb21wb25lbnQuc3RhdGVWZXJzaW9uXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIGxvYWRTdGF0ZShzdGF0ZTogSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlLCBmaXJlU3RhdGVDaGFuZ2VkOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAodGhpcy5nb2xkZW5MYXlvdXQgJiYgdGhpcy5nb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQuZGVzdHJveSgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wb3B1cHNXaW5kb3dzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VQb3B1cHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVwc1dpbmRvd3MgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVMYXlvdXQodGhpcy5fbm9ybWFsaXplTGF5b3V0U3RhdGUoc3RhdGUpKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaXJlU3RhdGVDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHN0YXRlQ2hhbmdlZC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2F2ZUl0ZW1TdGF0ZShpdGVtSWQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5nZXRJdGVtc0J5SWQoaXRlbUlkKTtcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zICYmIGl0ZW1zLmxlbmd0aCA/IGl0ZW1zWzBdIDogbnVsbDtcblxuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZW0uY29uZmlnO1xuICAgIH1cblxuICAgIGNsb3NlUG9wdXBzKCkge1xuICAgICAgICB0aGlzLnBvcHVwc1dpbmRvd3MuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICAgICAgcC5jbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRBbGxDb21wb25lbnRzKCk6IEdvbGRlbkxheW91dE5hbWVzcGFjZS5Db250ZW50SXRlbVtdIHtcbiAgICAgICAgaWYgKHRoaXMuZ29sZGVuTGF5b3V0ICYmIHRoaXMuZ29sZGVuTGF5b3V0LmlzSW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRlbkxheW91dC5yb290LmdldEl0ZW1zQnlUeXBlKCdjb21wb25lbnQnKSBhcyBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW1bXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9ub3JtYWxpemVMYXlvdXRTdGF0ZShzdGF0ZTogSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlKTogSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlIHtcbiAgICAgICAgbGV0IG5vcm1hbGl6ZWRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCB7XG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc2V0dGluZ3MsIHtcbiAgICAgICAgICAgICAgICB0YWJDb250cm9sT2Zmc2V0OiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnRhYkNvbnRyb2xPZmZzZXQgIT0gbnVsbCA/IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3MudGFiQ29udHJvbE9mZnNldCA6IDEwMCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25FbmFibGVkOiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnNlbGVjdGlvbkVuYWJsZWQgIT0gbnVsbCA/IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2VsZWN0aW9uRW5hYmxlZCA6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlb3JkZXJFbmFibGVkOiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnJlb3JkZXJFbmFibGVkICE9IG51bGwgPyB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnJlb3JkZXJFbmFibGVkIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlTW9kZTogdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5yZXNwb25zaXZlTW9kZSAhPSBudWxsID8gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5yZXNwb25zaXZlTW9kZSA6ICdub25lJyxcbiAgICAgICAgICAgICAgICBzaG93Q2xvc2VJY29uOiB0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLnNob3dDbG9zZUljb24gIT0gbnVsbCA/IHRoaXMuX2NvbmZpZ3VyYXRpb24uc2V0dGluZ3Muc2hvd0Nsb3NlSWNvbiA6IHRydWVcbiAgICAgICAgICAgIH0gYXMgUGFydGlhbDxHb2xkZW5MYXlvdXROYW1lc3BhY2UuU2V0dGluZ3M+KSBhcyBHb2xkZW5MYXlvdXROYW1lc3BhY2UuU2V0dGluZ3NcbiAgICAgICAgfSkgYXMgSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlO1xuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWd1cmF0aW9uLnNldHRpbmdzLmRpbWVuc2lvbnMpIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRTdGF0ZS5kaW1lbnNpb25zID0gdGhpcy5fY29uZmlndXJhdGlvbi5zZXR0aW5ncy5kaW1lbnNpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9ybWFsaXplZFN0YXRlID0gdGhpcy5fbWlncmF0ZVN0YXRlKG5vcm1hbGl6ZWRTdGF0ZSk7XG5cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRTdGF0ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9taWdyYXRlU3RhdGUoc3RhdGU6IEdvbGRlbkxheW91dFN0YXRlKTogSUdvbGRlbkxheW91dENvbXBvbmVudFN0YXRlIHtcbiAgICAgIGNvbnN0IHN0YXRlVmVyc2lvbiA9IHN0YXRlLnZlcnNpb247XG5cbiAgICAgIGlmIChzdGF0ZVZlcnNpb24gPT09IEdvbGRlbkxheW91dENvbXBvbmVudC5zdGF0ZVZlcnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUudmVyc2lvbiA9PSBudWxsIHx8IHN0YXRlLnZlcnNpb24gIT09IEdvbGRlbkxheW91dENvbXBvbmVudC5zdGF0ZVZlcnNpb24pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJbmNvbXBhdGlibGUgbGF5b3V0IHN0YXRlIHZlckdvbGRlbkxheW91dFN0YXRlc2lvbnMuIEN1cnJlbnQgbGF5b3V0IHN0YXRlIHZlcnNpb246ICR7R29sZGVuTGF5b3V0Q29tcG9uZW50LnN0YXRlVmVyc2lvbn0sIHlvdXIgc3RhdGUgdmVyc2lvbjogJHtzdGF0ZS52ZXJzaW9uIHx8ICdub25lJ31gKTtcbiAgICAgICAgc3RhdGUuY29udGVudCA9IFtdOyAvLyBjbGVhciBhbGwgY29tcG9uZW50c1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG5cbiAgICBhc3luYyBhZGRJdGVtQXNDb2x1bW4oY29tcG9uZW50Q29uZmlnOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29tcG9uZW50Q29uZmlnKSB7XG4gICAgICAgIGlmICh0aGlzLmdvbGRlbkxheW91dCA9PSBudWxsKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdvbGRlbkxheW91dC5pc0luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9jcmVhdGVMYXlvdXQobnVsbCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxheW91dFJvb3QgPSAodGhpcy5nb2xkZW5MYXlvdXQucm9vdCBhcyBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW0pO1xuXG4gICAgICAgIGlmICh0aGlzLmlzTGF5b3V0RW1wdHkpIHtcbiAgICAgICAgICAgIGxheW91dFJvb3QuYWRkQ2hpbGQoY29tcG9uZW50Q29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsYXlvdXRSb290LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDEgJiYgbGF5b3V0Um9vdC5jb250ZW50SXRlbXNbMF0uaXNSb3cpIHtcbiAgICAgICAgICAgIGxheW91dFJvb3QuY29udGVudEl0ZW1zWzBdLmFkZENoaWxkKGNvbXBvbmVudENvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdvbGRlbkxheW91dC5jcmVhdGVDb250ZW50SXRlbSh7XG4gICAgICAgICAgICB0eXBlOiAncm93JyxcbiAgICAgICAgICAgIGlkOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpLCAvLyAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMDBcbiAgICAgICAgfSkgYXMgYW55O1xuXG4gICAgICAgIGNvbnN0IHRlbXAgPSB0aGlzLmdvbGRlbkxheW91dC5yb290LmNvbnRlbnRJdGVtc1swXTtcblxuICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5yb290LnJlcGxhY2VDaGlsZChcbiAgICAgICAgICAgIHRlbXAsXG4gICAgICAgICAgICByb3dcbiAgICAgICAgKTtcblxuICAgICAgICByb3cuYWRkQ2hpbGQodGVtcCk7XG4gICAgICAgIHJvdy5hZGRDaGlsZChjb21wb25lbnRDb25maWcpO1xuICAgIH1cblxuXG4gICAgYXN5bmMgYWRkQ29tcG9uZW50QXNDb2x1bW4oY29tcG9uZW50TmFtZTogc3RyaW5nLCBjb21wb25lbnRTdGF0ZSkge1xuICAgICAgICBjb25zdCBjb21wb25lbnRDb25maWcgPSB0aGlzLl9jcmVhdGVDb21wb25lbnRDb250ZW50SXRlbUNvbmZpZyhjb21wb25lbnROYW1lLCBjb21wb25lbnRTdGF0ZSk7XG4gICAgICAgIHRoaXMuYWRkSXRlbUFzQ29sdW1uKGNvbXBvbmVudENvbmZpZyk7XG4gICAgfVxuXG5cbiAgICBhc3luYyBhZGRDb21wb25lbnQoY29tcG9uZW50TmFtZTogc3RyaW5nLCBjb21wb25lbnRTdGF0ZSwgcGFyZW50OiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29udGVudEl0ZW0pIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50Q29uZmlnID0gdGhpcy5fY3JlYXRlQ29tcG9uZW50Q29udGVudEl0ZW1Db25maWcoY29tcG9uZW50TmFtZSwgY29tcG9uZW50U3RhdGUpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzTGF5b3V0RW1wdHkpIHtcbiAgICAgICAgICAgIHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QuYWRkQ2hpbGQoY29tcG9uZW50Q29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudEFzQ29sdW1uKGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudFN0YXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmVudC5hZGRDaGlsZChjb21wb25lbnRDb25maWcpO1xuICAgIH1cblxuICAgIGFkZEl0ZW0oY29tcG9uZW50Q29uZmlnOiBhbnkpIHtcbiAgICAgICAgY29uc3QgaXNMYXlvdXRFbXB0eSA9IHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zLmxlbmd0aCA9PT0gMDtcblxuICAgICAgICBjb25zdCBzdGFjayA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdzdGFjaycsXG4gICAgICAgICAgICBpZDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IFtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRDb25maWdcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNMYXlvdXRFbXB0eSkge1xuICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5hZGRDaGlsZChzdGFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzdGFja0NvbnRlbnRJdGVtOiBhbnkgPSB0aGlzLmdvbGRlbkxheW91dC5jcmVhdGVDb250ZW50SXRlbSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3N0YWNrJyxcbiAgICAgICAgICAgICAgICBpZDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICBjb250ZW50OiBbXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHN0YWNrQ29udGVudEl0ZW0uYWRkQ2hpbGQoXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlQ29udGVudEl0ZW0oY29tcG9uZW50Q29uZmlnKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgY29sdW1uID0gdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlQ29udGVudEl0ZW0oe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgIGlkOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMDBcbiAgICAgICAgICAgIH0pIGFzIGFueTtcblxuICAgICAgICAgICAgY29uc3QgdGVtcCA9IHRoaXMuZ29sZGVuTGF5b3V0LnJvb3QuY29udGVudEl0ZW1zWzBdO1xuXG4gICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC5yb290LnJlcGxhY2VDaGlsZChcbiAgICAgICAgICAgICAgICB0ZW1wLFxuICAgICAgICAgICAgICAgIGNvbHVtblxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29sdW1uLmFkZENoaWxkKHRlbXApO1xuICAgICAgICAgICAgY29sdW1uLmFkZENoaWxkKHN0YWNrQ29udGVudEl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SXRlbXNCeUlkKGlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIHJldHVybiAodGhpcy5nb2xkZW5MYXlvdXQucm9vdCBhcyBhbnkpLmdldEl0ZW1zQnlJZChpZCkgYXMgYW55W107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0TGFiZWxzKGxhYmVsczogR29sZGVuTGF5b3V0TGFiZWxzKSB7XG4gICAgICAgIHRoaXMuX2xhYmVscyA9IE9iamVjdC5hc3NpZ24oe30sIERlZmF1bHRMYWJlbHMsIGxhYmVscyk7XG4gICAgICAgIGNvbnN0IGlzTGF5b3V0SW5pdGlhbGl6ZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nb2xkZW5MYXlvdXQgJiYgdGhpcy5nb2xkZW5MYXlvdXQuaXNJbml0aWFsaXNlZDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBnZXRMYWJlbCA9IChsYWJlbDoga2V5b2YgR29sZGVuTGF5b3V0TGFiZWxzKTogT2JzZXJ2YWJsZTxzdHJpbmc+ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRMYWJlbChsYWJlbCwgZmFsc2UpXG4gICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcigoKSA9PiBpc0xheW91dEluaXRpYWxpemVkKCkpLFxuICAgICAgICAgICAgICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveSQpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBnZXRMYWJlbCgnYWRkQ29tcG9uZW50JylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkuZmluZChgLiR7Q2xhc3MuYWRkQ29tcG9uZW50fWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZ2V0TGFiZWwoJ2Nsb3NlJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkuZmluZChgLiR7Q2xhc3MuY2xvc2V9YCkuYXR0cigndGl0bGUnLCBsYWJlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBnZXRMYWJlbCgnbWF4aW1pc2UnKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgobGFiZWw6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICQodGhpcy5lbC5uYXRpdmVFbGVtZW50KS5maW5kKGAuJHtDbGFzcy5tYXhpbWlzZX1gKS5hdHRyKCd0aXRsZScsIGxhYmVsKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGdldExhYmVsKCdtaW5pbWlzZScpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQpLmZpbmQoYC5sbV9tYXhpbWlzZWQgLiR7Q2xhc3MubWF4aW1pc2V9YCkuYXR0cigndGl0bGUnLCBsYWJlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBnZXRMYWJlbCgncG9wb3V0JylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkuZmluZChgLiR7Q2xhc3MucG9wb3V0fWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZ2V0TGFiZWwoJ2FkZGl0aW9uYWxUYWJzJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkuZmluZChgLiR7Q2xhc3MudGFic0Ryb3Bkb3dufWApLmF0dHIoJ3RpdGxlJywgbGFiZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZ2V0TGFiZWwoJ3BvcGluJylcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKGxhYmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwubmF0aXZlRWxlbWVudCkuZmluZChgLiR7Q2xhc3MucG9waW59YCkuYXR0cigndGl0bGUnLCBsYWJlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9nZXRMYWJlbChsYWJlbDoga2V5b2YgR29sZGVuTGF5b3V0TGFiZWxzLCBmaXJzdFZhbHVlOiBib29sZWFuID0gdHJ1ZSk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGxhYmVsJCA9IHRoaXMuX2xhYmVsc1tsYWJlbF07XG5cbiAgICAgICAgaWYgKGZpcnN0VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBsYWJlbCRcbiAgICAgICAgICAgICAgICAucGlwZShmaXJzdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsYWJlbCQ7XG4gICAgfVxuXG4gICAgdXBkYXRlU2l6ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ29sZGVuTGF5b3V0KSB7XG4gICAgICAgICAgICB0aGlzLmdvbGRlbkxheW91dC51cGRhdGVTaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fZGVzdHJveSQubmV4dCgpO1xuICAgICAgICB0aGlzLl9kZXN0cm95JC5jb21wbGV0ZSgpO1xuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuXG4gICAgY2xlYXIoKSB7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignd2luZG93OnVubG9hZCcsIFsnJGV2ZW50J10pXG4gICAgdW5sb2FkTm90aWZpY2F0aW9uKCRldmVudDogYW55KSB7XG4gICAgICAgIHRoaXMuY2xvc2VQb3B1cHMoKTtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLmNsb3NlUG9wdXBzKCk7XG5cbiAgICAgICAgdGhpcy5fZGVzdHJveSQubmV4dCgpO1xuICAgICAgICB0aGlzLl9kZXN0cm95JC5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NyZWF0ZUNvbXBvbmVudENvbnRlbnRJdGVtQ29uZmlnKGNvbXBvbmVudE5hbWU6IHN0cmluZywgY29tcG9uZW50U3RhdGUpOiBHb2xkZW5MYXlvdXROYW1lc3BhY2UuQ29tcG9uZW50Q29uZmlnIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgICAgICAgICAgaWQ6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6IGNvbXBvbmVudE5hbWUsXG4gICAgICAgICAgICBjb21wb25lbnRTdGF0ZToge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFN0YXRlOiBjb21wb25lbnRTdGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==
