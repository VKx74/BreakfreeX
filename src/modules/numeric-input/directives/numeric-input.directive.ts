import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {NgControl} from "@angular/forms";

export interface INumericInputRangeParams {
    min?: number;
    max?: number;
}

@Directive({
    selector: '[numericInput]'
})
export class NumericInputDirective {
    @Input() integerOnly: boolean = false;
    @Input() floatOnly: boolean = false;

    private _range: INumericInputRangeParams = {
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER
    };

    @Input() set range(value: INumericInputRangeParams) {
        this._range = value;
    }

    get allowNegative(): boolean {
        return this._range.min < 0;
    }

    private _prevValue: string;
    private _inputValueChanged: boolean = false;

    constructor(private _el: ElementRef,
                private _control: NgControl) {
    }

    ngOnInit() {
    }

    @HostListener('keydown', ['$event'])
    onKeyDown() {
        this._prevValue = this._el.nativeElement.value;
    }

    @HostListener('blur', ['$event'])
    onBlur() {
        const next = this._el.nativeElement.value;

        if (!this._inputValueChanged || !next || next.length === 0) {
            return;
        }

        const parsedValue = this.integerOnly ? parseInt(next, 10) : parseFloat(next);
        const setValue = this._control.control.setValue.bind(this._control.control);

        if (parsedValue < this._range.min) {
            setValue(this._range.min);
        } else if (parsedValue > this._range.max) {
            setValue(this._range.max);
        } else {
            setValue(parsedValue);
        }
    }

    @HostListener('input', ['$event'])
    onInput() {
        const regexp = this._getRegexp();
        const next = this._el.nativeElement.value;

        this._inputValueChanged = true;

        if (!next || !next.length) {
            return;
        }

        if (this.integerOnly) {
            if (this.allowNegative && next === '-') {
                return;
            }

            if (!String(next).match(regexp)) {
                this._control.control.setValue(this._prevValue);
                return;
            }
        }

        if (this.floatOnly) {
            if (this.allowNegative) {
                if (String(next).match(/^-?[0-9]*$/g)) {
                    return;
                }

                if (String(next).match(/^-?[0-9]+\.$/g)) {
                    return;
                }
            } else {
                if (String(next).match(/^[0-9]*$/g)) {
                    return;
                }

                if (String(next).match(/^[0-9]+\.$/g)) {
                    return;
                }
            }

            if (!String(next).match(regexp)) {
                this._control.control.setValue(this._prevValue);
                return;
            }
        }
    }

    private _getRegexp(): RegExp {
        if (this.integerOnly) {
            return this.allowNegative
                ? /^(-?[1-9][0-9]*|0)$/g
                : /^([1-9][0-9]*|0)$/g;
        }

        if (this.floatOnly) {
            return this.allowNegative
                ? /^(-?[0-9]+\.[0-9]*|-?[1-9][0-9]*|0)$/g
                : /^([0-9]+\.[0-9]*|-?[1-9][0-9]*|0)$/g;
        }
    }
}
