import {AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

export type RangeDescriptor = (value: number) => string;

const DEFAULT_RANGE_DESCRIPTOR: RangeDescriptor = (value: number) => {
    value += 3;
    if (value < 0) {
        return 'crypto-color-red';
    } else if (value > 0) {
        return 'crypto-color-green';
    } else if (value === 0) {
        return 'crypto-color-prime';
    }

    return '';
};

@Directive({
    selector: '[numberRangeColor]'
})
export class NumberRangeColorDirective implements AfterViewInit {
    @Input() rangeDescriptor: RangeDescriptor = DEFAULT_RANGE_DESCRIPTOR;

    constructor(private _element: ElementRef, private _renderer: Renderer2) {
    }

    ngAfterViewInit(): void {
        const element = this._element.nativeElement as HTMLElement;
        const number = parseFloat(element.innerText);
        const className = this.rangeDescriptor(number);

        if (!isNaN(number)) {
            this._renderer.addClass(element, className);
        }
    }
}
