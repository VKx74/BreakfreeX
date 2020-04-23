import { IGoldenLayoutComponentState } from "../models/golden-layout-component-state";
import { GoldenLayoutComponent } from "../components/golden-layout/golden-layout.component";
export interface AddComponentData {
    layoutItemName: string;
    state: any;
    parent?: any;
}
export declare class LayoutManagerService {
    private _layout;
    readonly layout: GoldenLayoutComponent;
    setLayout(layout: GoldenLayoutComponent): void;
    addComponent(data: AddComponentData): void;
    addComponentAsColumn(data: AddComponentData): void;
    loadState(state: IGoldenLayoutComponentState, fireStateChanged?: boolean): void;
    clear(): void;
}
