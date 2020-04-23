import {PipeTransform} from "@angular/core";

export abstract class BaseImpurePipe implements PipeTransform {
    private _value: any;
    private _prevArguments: any;

    transform(value: any, ...args): any {
        if (this._prevArguments && this._isValueCached(this._prevArguments, arguments)) {
            return this._value;
        } else {
            this._prevArguments = arguments;
            this._value = this._transform.apply(this, arguments);

            return this._value;
        }
    }

    protected abstract _transform(value: any, ...args): any;

    protected _isValueCached(prevArguments, currentArguments): boolean {
        if (prevArguments.length !== currentArguments.length) {
            return false;
        }

        for (let prop in prevArguments) {
            if (prevArguments[prop] !== currentArguments[prop]) {
                return false;
            }
        }

        return true;
    }

    protected reset() {
        this._prevArguments = null;
    }
}
