import {FormControl, ValidatorFn} from "@angular/forms";


export function TrimmedValidator(): ValidatorFn {
    return function (control: FormControl) {
        const value = (control.value as string);
        const trimmedValue = value.trim();

        if (trimmedValue.length !== value.length) {
            return {'trimmed': true};
        }

        return null;
    };
}