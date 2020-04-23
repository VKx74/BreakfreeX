import {FormControl, ValidatorFn} from "@angular/forms";


export function TrimmedMinLengthValidator(minLength: number): ValidatorFn {
    return function (control: FormControl) {
        const trimmedValue = (control.value as string).trim();

        if (trimmedValue.length < minLength) {
            return {'trimmedMinLength': true};
        }

        return null;
    };
}