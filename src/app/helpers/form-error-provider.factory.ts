import {TranslateService} from "@ngx-translate/core";
import {ValidationErrors} from "@angular/forms";
import {Observable} from "rxjs";
import {IFormErrorProvider} from "../../modules/form-error-directive/error.provider";
import {PasswordValidationError, PasswordValidationErrorType} from "Validators";

export const FormErrorProviderFactory = (translateService: TranslateService) => {
    const getErrorMessage = (errors: ValidationErrors): Observable<string> => {
        const stream = translateService.stream.bind(translateService);

        if (errors.required) {
            return stream('validationErrors.required');
        }

        if (errors.mismatchPasswords) {
            return stream('validationErrors.mismatchPasswords');
        }

        if (errors.passwordValidation) {
            const type = (errors.passwordValidation[0] as PasswordValidationError).type;
            const _map = {
                [PasswordValidationErrorType.MinLength]: 'validationErrors.passwordValidation.MinLength',
                [PasswordValidationErrorType.MustContainNumber]: 'validationErrors.passwordValidation.MustContainNumber',
                [PasswordValidationErrorType.MustContainUpperCase]: 'validationErrors.passwordValidation.MustContainUpperCase',
                [PasswordValidationErrorType.MustContainLowerCase]: 'validationErrors.passwordValidation.MustContainLowerCase',
            };

            return stream(_map[type]);
        }

        if (errors.min) { // Validators.min
            return stream('validationErrors.min', {minValue: errors.min.min});
        }

        if (errors.max) { // Validators.max
            return stream('validationErrors.max', {maxValue: errors.max.max});
        }

        if (errors.minlength) { // Validators.max
            return stream('validationErrors.minLength', {minValue: errors.minlength.requiredLength});
        }

        if (errors.maxlength) { // Validators.max
            return stream('validationErrors.maxLength', {maxValue: errors.maxlength.requiredLength});
        }

        return stream('validationErrors.invalid');
    };

    return {
        errorMessageSource(errors: ValidationErrors): Observable<string> {
            return getErrorMessage(errors);
        }
    } as IFormErrorProvider;
};
