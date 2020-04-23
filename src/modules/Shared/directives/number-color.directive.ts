import {Directive, DoCheck, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {memoize} from "@decorators/memoize";

export enum NumberColorSetType {
    Class,
    Color,
}

type NumberColorProvider = (n: number | string, defaultColor?: string) => string;
const DEFAULT_COLOR_PROVIDER: NumberColorProvider = (n: number | string, defaultColor = 'crypto-color-prime') => {
    n = typeof n === 'string' ? parseFloat(n) : n;

    if (n == null || typeof n !== 'number') {
        return '';
    }

    if (n < 0) {
        return 'crypto-color-red';
    } else if (n > 0) {
        return 'crypto-color-green';
    } else {
        return defaultColor;
    }
};

@Directive({
    selector: '[numberColor]',
})
export class NumberColorDirective implements DoCheck {
    @Input() setColorBy = NumberColorSetType.Class;
    @Input() colorProvider = DEFAULT_COLOR_PROVIDER;
    @Input() defaultColor: string;
    @Input() listenToNumberChange = true;
    private _number: string = null;
    private _element = this._elementRef.nativeElement;

    get number() {
        return this._elementRef.nativeElement.innerText.trim();
    }

    constructor(private _elementRef: ElementRef<HTMLElement>, private _renderer: Renderer2) {
    }

    ngDoCheck() {
        if (this.listenToNumberChange) {
            const number = this.number;
            if (this._number === null) {
                this.setColor();
            } else {
                const checkRequired = this._number !== number && this._getColor(this._number) !== this._getColor(number);
                if (checkRequired) {
                    this._removePreviousColor();
                    this.setColor();

                }
            }
        }
    }

    ngAfterViewInit() {
        if (!this.listenToNumberChange) {
            this.setColor();
        }
    }

    setColor() {
        this._number = this.number;

        if (this._number == null || !this._getColor(this._number)) {
            return;
        }

        this._addColor();
    }

    private _addColor() {
        const color = this._getColor(this._number);
        if (this.setColorBy === NumberColorSetType.Class) {
            this._renderer.addClass(this._element, color);
        } else {
            this._renderer.setStyle(this._element, 'color', this._getColor(this._number));
        }
    }

    private _removePreviousColor() {
        const color = this._getColor(this._number);
        if (this.setColorBy === NumberColorSetType.Class) {
            this._renderer.removeClass(this._element, color);
        } else {
            this._renderer.removeStyle(this._element, 'color');
        }
    }

    @memoize()
    private _getColor(number: number | string) {
        return this.colorProvider(number, this.defaultColor);
    }
}
