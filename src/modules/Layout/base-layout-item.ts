import { EventEmitter, Output } from "@angular/core";
import { LinkingAction } from "@linking/models/models";

export abstract class BaseLayoutItem {
    @Output() onOpenChart = new EventEmitter<LinkingAction>();
    @Output() initialized = new EventEmitter<BaseLayoutItem>();
    @Output() stateChanged = new EventEmitter<BaseLayoutItem>();
    @Output() beforeDestroy = new EventEmitter<BaseLayoutItem>();

    abstract get componentId(): string;

    constructor() {
    }

    abstract getState(): any;

    abstract setState(state: any);
}