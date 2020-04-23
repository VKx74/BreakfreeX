/// <reference types="../../node_modules/@types/jquery" />
import Container = GoldenLayoutNamespace.Container;
import { Observable } from 'rxjs';
import { Injector } from "@angular/core";
import { GoldenLayoutComponent } from "./components/golden-layout/golden-layout.component";
import { IGoldenLayoutItem } from './models/golden-layout-item';
export declare class GoldenLayoutItem implements IGoldenLayoutItem {
    protected _container: Container;
    protected _goldenLayoutComponent: GoldenLayoutComponent;
    protected _tabElement: JQuery;
    private _titleSubscription;
    private _destroy;
    constructor(injector: Injector);
    saveState(): any;
    onResize(): void;
    onShow(): void;
    onHide(): void;
    onTabCreated(tabElement: JQuery): void;
    onContainerMaximized(isOwnContainer: boolean): void;
    onContainerMinimized(isOwnContainer: boolean): void;
    setTitle(title$: Observable<string>): void;
    fireStateChanged(): void;
    ngOnDestroy(): void;
}
