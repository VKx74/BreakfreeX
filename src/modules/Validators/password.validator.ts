import {FormControl, ValidatorFn, Validators} from "@angular/forms";

export enum PasswordValidationErrorType {
    MinLength,
    MustContainNumber,
    MustContainUpperCase,
    MustContainLowerCase
}

export interface PasswordValidationError {
    type: PasswordValidationErrorType;
    message: string;
}

export const PasswordMinLength = 8;

export function passwordValidator(): ValidatorFn {
    return function (control: FormControl) {
        let errors: PasswordValidationError[] = [];

        if (Validators.minLength(PasswordMinLength)(control)) {
            errors.push({
                type: PasswordValidationErrorType.MinLength,
                message: 'Password must have a minimum length of 8 characters'
            });
        }

        if (Validators.pattern(/[0-9]/)(control)) {
            errors.push({
                type: PasswordValidationErrorType.MustContainNumber,
                message: 'Password must contain at least one number'
            });
        }

        if (Validators.pattern(/[A-Z]/)(control)) {
            errors.push({
                type: PasswordValidationErrorType.MustContainUpperCase,
                message: 'Password must contain at least one uppercase letter'
            });
        }

        if (Validators.pattern(/[a-z]/)(control)) {
            errors.push({
                type: PasswordValidationErrorType.MustContainLowerCase,
                message: 'Password must contain at least one lowercase letter'
            });
        }

        return errors.length
            ? {passwordValidation: errors}
            : null;
    };
}