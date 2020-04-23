import { ElementRef, Renderer2, OnInit, OnDestroy, NgZone } from '@angular/core';
import { SplitComponent } from '../component/split.component';
export declare class SplitAreaDirective implements OnInit, OnDestroy {
    private ngZone;
    elRef: ElementRef;
    private renderer;
    private split;
    private _order;
    order: number | null;
    private _size;
    size: number | null;
    private _minSize;
    minSize: number | null;
    private _maxSize;
    maxSize: number | null;
    private _lockSize;
    lockSize: boolean;
    private _visible;
    visible: boolean;
    private transitionListener;
    private readonly lockListeners;
    constructor(ngZone: NgZone, elRef: ElementRef, renderer: Renderer2, split: SplitComponent);
    ngOnInit(): void;
    setStyleOrder(value: number): void;
    setStyleFlex(grow: number, shrink: number, basis: string, isMin: boolean, isMax: boolean): void;
    lockEvents(): void;
    unlockEvents(): void;
    ngOnDestroy(): void;
}
