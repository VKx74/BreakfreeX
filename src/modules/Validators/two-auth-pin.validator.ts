import {ValidatorFn, Validators} from "@angular/forms";


export function TwoAuthPinValidator(): ValidatorFn {
    return Validators.compose([
        Validators.minLength(6),
        Validators.maxLength(6)
    ]);
}
