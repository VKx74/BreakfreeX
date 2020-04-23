/// <reference types="../../node_modules/@types/jquery" />
export interface IGoldenLayoutItem {
    saveState(): any;
    onResize(): void;
    onShow(): void;
    onHide(): void;
    onTabCreated(tabElement: JQuery): void;
    onContainerMaximized(isOwnContainer: boolean): void;
    onContainerMinimized(isOwnContainer: boolean): void;
}
