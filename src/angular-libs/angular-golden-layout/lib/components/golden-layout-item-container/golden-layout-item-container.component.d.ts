/// <reference types="../../node_modules/@types/jquery" />
import { ComponentFactoryResolver, Injector } from '@angular/core';
import { Observable } from "rxjs";
import { GoldenLayoutItem } from "../../golden-layout-item";
import { ComponentResolver, IGoldenLayoutComponentConfiguration } from '../../models/configuration';
declare enum LoadComponentState {
    Loading = 0,
    Success = 1,
    Failed = 2
}
export declare class GoldenLayoutItemContainerComponent extends GoldenLayoutItem {
    protected _container: any;
    private _componentResolver;
    private _configuration;
    private _componentFactoryResolver;
    private _injector;
    componentContainer: any;
    private _layoutItem;
    protected _tabElement: JQuery;
    loadComponentState: LoadComponentState;
    LoadComponentState: typeof LoadComponentState;
    readonly loadingLabel: Observable<string>;
    readonly failedToLoadLabel: Observable<string>;
    constructor(_container: any, _componentResolver: ComponentResolver, _configuration: IGoldenLayoutComponentConfiguration, _componentFactoryResolver: ComponentFactoryResolver, _injector: Injector);
    ngOnInit(): void;
    saveState(): any;
    onResize(): void;
    onShow(): void;
    onHide(): void;
    onTabCreated(tabElement: JQuery): void;
    onContainerMaximized(isOwnContainer: boolean): void;
    onContainerMinimized(isOwnContainer: boolean): void;
    ngOnDestroy(): void;
}
export {};
