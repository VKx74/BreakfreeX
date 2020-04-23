import { Observable } from 'rxjs';
import ItemConfig = GoldenLayoutNamespace.ItemConfig;
import { IGoldenLayoutComponentSettings } from './models/configuration';
import ComponentConfig = GoldenLayoutNamespace.ComponentConfig;
export declare type PopinHandler = (componentConfig: ComponentConfig) => void;
export declare type PopupStateChangedHandler = () => void;
export interface IPopupWindowManagerConfig {
    componentConfig: ItemConfig;
    layoutSettings: IGoldenLayoutComponentSettings;
    popinHandler: PopinHandler;
    popupStateChangedHandler: PopupStateChangedHandler;
    popupClosedHandler: (closedByUser: boolean) => void;
    runChangeDetectionHandler: () => void;
}
export interface IPopupWindowConfig {
    componentConfig: any;
    layoutSettings: any;
    popin: PopinHandler;
    fireStateChanged: PopupStateChangedHandler;
    runChangeDetectionInRootWindow: () => void;
    needRunChangeDetection: Observable<any>;
    onLayoutCreated: (GoldenLayoutComponent: any) => void;
}
export declare const PopupWindowConfigKey = "popupWindowConfigKey";
export declare class PopupWindowManager {
    window: Window;
    private popupConfig;
    id: string;
    private _closedByUser;
    private _runChangeDetection$;
    private _popupLayout;
    static openWindow(url: string): Window;
    static serializeWindowOptions(windowOptions: any): string;
    constructor(window: Window, popupConfig: IPopupWindowManagerConfig);
    runChangeDetection(): void;
    saveState(): ComponentConfig;
    close(): void;
}
