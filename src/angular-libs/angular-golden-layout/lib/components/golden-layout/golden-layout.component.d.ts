/// <reference path="../../../../libs/golden-layout.d.ts" />
import { ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, Injector, NgZone, ViewContainerRef } from '@angular/core';
import { ComponentResolver, GoldenLayoutLabels, IGoldenLayoutComponentConfiguration } from '../../models/configuration';
import { IGoldenLayoutComponentState } from "../../models/golden-layout-component-state";
import { BehaviorSubject, Subject } from "rxjs";
import { LayoutManagerService } from "../../services/layout-manager.service";
import { PopupWindowManager } from "../../popup-window-manager";
import ComponentConfig = GoldenLayoutNamespace.ComponentConfig;
export declare type ComponentInitCallback = (container: GoldenLayoutNamespace.Container, componentState: any) => void;
export interface GoldenLayoutState extends IGoldenLayoutComponentState, GoldenLayoutNamespace.Config {
}
export declare const DefaultLabels: GoldenLayoutLabels;
export declare class GoldenLayoutComponent {
    private viewContainer;
    private _layoutManager;
    private componentFactoryResolver;
    private ngZone;
    private _changeDetectorRef;
    private _appRef;
    private injector;
    private _configuration;
    static stateVersion: string;
    private el;
    popupsWindows: PopupWindowManager[];
    $onAddComponent: Subject<any>;
    $layoutEmpty: BehaviorSubject<boolean>;
    $stateChanged: Subject<{}>;
    goldenLayout: GoldenLayout;
    private _destroy$;
    private _labels;
    private _resize$;
    private _suppressChangeDetection;
    private _isDestroyed;
    readonly isLayoutEmpty: boolean;
    static getSingleComponentLayoutConfig(componentConfig: ComponentConfig): IGoldenLayoutComponentState;
    constructor(viewContainer: ViewContainerRef, _layoutManager: LayoutManagerService, componentFactoryResolver: ComponentFactoryResolver, ngZone: NgZone, _changeDetectorRef: ChangeDetectorRef, _appRef: ApplicationRef, injector: Injector, _configuration: IGoldenLayoutComponentConfiguration);
    ngOnInit(): void;
    ngDoCheck(): void;
    private _registerComponents;
    private _createLayout;
    onResize(event: any): void;
    private _handleItemCreated;
    private _handleStackCreated;
    createComponentInitCallback(componentResolver: ComponentResolver): ComponentInitCallback;
    fireStateChanged(): void;
    /**
     * Creates an injector capable of injecting the Layout object,
     * component container, and initial component state.
     */
    private _createComponentInjector;
    /**
     * Registers an event handler for each implemented hook.
     * @param container Golden Layout component container.
     * @param component Angular component instance.
     */
    private _bindEventHooks;
    private _addPopoutBtn;
    private _addPopinBtn;
    private _getMaximiseIcon;
    private _getMinimiseIcon;
    private _addMaximizeBtn;
    private _addCloseBtn;
    private _addCloseTabBtn;
    private _handleTabCreated;
    private _handlePopupClick;
    private _addMobileTabDraggingSupport;
    private _overrideTabOnDragStart;
    private _openPopup;
    private _saveItemState;
    saveState(): GoldenLayoutState;
    loadState(state: IGoldenLayoutComponentState, fireStateChanged?: boolean): Promise<any>;
    saveItemState(itemId: string): any;
    closePopups(): void;
    getAllComponents(): GoldenLayoutNamespace.ContentItem[];
    private _normalizeLayoutState;
    private _migrateState;
    addItemAsColumn(componentConfig: GoldenLayoutNamespace.ComponentConfig): Promise<void>;
    addComponentAsColumn(componentName: string, componentState: any): Promise<void>;
    addComponent(componentName: string, componentState: any, parent: GoldenLayoutNamespace.ContentItem): Promise<void>;
    addItem(componentConfig: any): void;
    getItemsById(id: string): any[];
    private _setLabels;
    private _getLabel;
    updateSize(): void;
    ngOnDestroy(): void;
    clear(): void;
    unloadNotification($event: any): void;
    destroy(): void;
    private _createComponentContentItemConfig;
}
