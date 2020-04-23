import {ValidatorFn, Validators} from "@angular/forms";

export function URLValidator(): ValidatorFn {
    return Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
}