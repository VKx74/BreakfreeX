/// <reference types="../../node_modules/@types/jquery" />
import Dimensions = GoldenLayoutNamespace.Dimensions;
import { PopinHandler } from "../popup-window-manager";
import { Observable } from "rxjs";
import { ComponentFactory, Type } from '@angular/core';
import { GoldenLayoutLabels } from '..';
export interface IGoldenLayoutComponentSettings {
    hasHeaders?: boolean;
    constrainDragToContainer?: boolean;
    reorderEnabled?: boolean;
    selectionEnabled?: boolean;
    showPopoutIcon?: boolean;
    getPopoutIcon?: () => JQuery;
    showPopinIcon?: boolean;
    getPopinIcon?: () => JQuery;
    showMaximiseIcon?: boolean;
    getMaximiseIcon?: () => any;
    getMinimiseIcon?: () => any;
    showAddBtn?: boolean;
    getAddComponentBtnIcon?: () => any;
    showCloseIcon?: boolean;
    getCloseIcon?: () => JQuery;
    showCloseTabIcon?: boolean;
    getCloseTabIcon?: () => any;
    dimensions?: Dimensions;
    tabControlOffset?: number;
    popupWindowUrl?: string;
    popinHandler?: PopinHandler;
    openPopupHook?: (w: Window) => void;
    openPopupFailureHandler?: () => void;
    responsiveMode?: 'onload' | 'always' | 'none';
    canOpenPopupWindow?: () => boolean;
}
export interface GoldenLayoutLabels {
    addComponent?: Observable<string>;
    additionalTabs?: Observable<string>;
    maximise?: Observable<string>;
    minimise?: Observable<string>;
    popout?: Observable<string>;
    popin?: Observable<string>;
    close?: Observable<string>;
    loading?: Observable<string>;
    failedToLoadComponent?: Observable<string>;
}
export interface IComponentTypeResolver {
    componentName: string;
    component: Type<any>;
}
export interface IComponentFactoryResolver {
    componentName: string;
    factory: () => Observable<ComponentFactory<any>>;
}
export declare type ComponentResolver = IComponentTypeResolver | IComponentFactoryResolver;
export interface IGoldenLayoutComponentConfiguration {
    settings: IGoldenLayoutComponentSettings;
    labels?: GoldenLayoutLabels;
    components: ComponentResolver[];
}
