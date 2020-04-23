import {AbstractControl, ValidatorFn, Validators} from "@angular/forms";

export interface IRangeValidatorParams {
    min?: number;
    max?: number;
}

export function digitValidator(): ValidatorFn {
    return Validators.pattern('^[0-9]*$');
}

export function integerNumberValidator(): ValidatorFn {
    return Validators.pattern('^(-?[1-9][0-9]*|0)$');
}

export function positiveIntegerNumberValidator(): ValidatorFn {
    return Validators.pattern('^[1-9][0-9]*$');
}

export function negativeIntegerNumberValidator(): ValidatorFn {
    return Validators.pattern('^-[1-9]+[0-9]*$');
}

export function floatNumberValidator(): ValidatorFn {
    return Validators.pattern('^(-?[0-9]+\.[0-9]+|-?[1-9][0-9]*|0)$');
}

export function positiveFloatValidator(): ValidatorFn {
    return Validators.pattern('^([0-9]+\.[0-9]+|-?[1-9][0-9]*|0)$');
}

export function phoneNumberValidator(): ValidatorFn {
    return Validators.pattern('^[+]*[0-9]*$');
}

export function rangeValidator(params: IRangeValidatorParams): ValidatorFn {
    const min = params.min != null ? params.min : Number.MIN_SAFE_INTEGER;
    const max = params.max != null ? params.max : Number.MAX_SAFE_INTEGER;

    return function (control: AbstractControl) {
        const minError = Validators.min(min)(control);
        const maxError = Validators.max(max)(control);

        if (minError) {
            return minError;
        }

        if (maxError) {
            return maxError;
        }

        return null;
    };
}

export function floatNumberRangeValidator(params: IRangeValidatorParams): ValidatorFn {
    return (control: AbstractControl) => {
        const rangeError = rangeValidator(params)(control);

        if (rangeError) {
            return rangeError;
        }

        return floatNumberValidator()(control);
    };
}


// export function DecimalNumberValidator(): ValidatorFn {
//     return Validators.pattern('^-?[[[0-9]+(\\.[0-9]+)][[1-9]+]]?$');
// }
