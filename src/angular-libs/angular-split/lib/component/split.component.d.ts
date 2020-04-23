import { ChangeDetectorRef, Renderer2, AfterViewInit, OnDestroy, ElementRef, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IArea, IOutputData, IOutputAreaSizes } from '../interface';
import { SplitAreaDirective } from '../directive/splitArea.directive';
/**
 * angular-split
 *
 *
 *  PERCENT MODE ([unit]="'percent'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |       20                 30                 20                 15                 15      | <-- [size]="x"
 * |               10px               10px               10px               10px               | <-- [gutterSize]="10"
 * |calc(20% - 8px)    calc(30% - 12px)   calc(20% - 8px)    calc(15% - 6px)    calc(15% - 6px)| <-- CSS flex-basis property (with flex-grow&shrink at 0)
 * |     152px              228px              152px              114px              114px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <-- el.getBoundingClientRect().width
 *  flex-basis = calc( { area.size }% - { area.size/100 * nbGutter*gutterSize }px );
 *
 *
 *  PIXEL MODE ([unit]="'pixel'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |      100                250                 *                 150                100      | <-- [size]="y"
 * |               10px               10px               10px               10px               | <-- [gutterSize]="10"
 * |   0 0 100px          0 0 250px           1 1 auto          0 0 150px          0 0 100px   | <-- CSS flex property (flex-grow/flex-shrink/flex-basis)
 * |     100px              250px              200px              150px              100px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <-- el.getBoundingClientRect().width
 *
 */
export declare class SplitComponent implements AfterViewInit, OnDestroy {
    private ngZone;
    private elRef;
    private cdRef;
    private renderer;
    private _direction;
    direction: 'horizontal' | 'vertical';
    readonly isHorizontalDirection: boolean;
    private _unit;
    unit: 'percent' | 'pixel';
    private _gutterSize;
    gutterSize: number | null;
    private _gutterStep;
    gutterStep: number;
    private _restrictMove;
    restrictMove: boolean;
    private _useTransition;
    useTransition: boolean;
    private _disabled;
    disabled: boolean;
    private _dir;
    dir: 'ltr' | 'rtl';
    private _gutterDblClickDuration;
    gutterDblClickDuration: number;
    dragStart: EventEmitter<IOutputData>;
    dragEnd: EventEmitter<IOutputData>;
    gutterClick: EventEmitter<IOutputData>;
    gutterDblClick: EventEmitter<IOutputData>;
    private transitionEndSubscriber;
    readonly transitionEnd: Observable<IOutputAreaSizes>;
    private dragProgressSubject;
    dragProgress$: Observable<IOutputData>;
    private isDragging;
    private dragListeners;
    private snapshot;
    private startPoint;
    private endPoint;
    readonly displayedAreas: Array<IArea>;
    private readonly hidedAreas;
    private gutterEls;
    constructor(ngZone: NgZone, elRef: ElementRef, cdRef: ChangeDetectorRef, renderer: Renderer2);
    ngAfterViewInit(): void;
    private getNbGutters;
    addArea(component: SplitAreaDirective): void;
    removeArea(component: SplitAreaDirective): void;
    updateArea(component: SplitAreaDirective, resetOrders: boolean, resetSizes: boolean): void;
    showArea(component: SplitAreaDirective): void;
    hideArea(comp: SplitAreaDirective): void;
    getVisibleAreaSizes(): IOutputAreaSizes;
    setVisibleAreaSizes(sizes: IOutputAreaSizes): boolean;
    private build;
    private refreshStyleSizes;
    _clickTimeout: number | null;
    clickGutter(event: MouseEvent | TouchEvent, gutterNum: number): void;
    startDragging(event: MouseEvent | TouchEvent, gutterOrder: number, gutterNum: number): void;
    private dragEvent;
    private stopDragging;
    notify(type: 'start' | 'progress' | 'end' | 'click' | 'dblclick' | 'transitionEnd', gutterNum: number): void;
    private _moveGutter;
    private _resetGutterOffset;
    ngOnDestroy(): void;
}
