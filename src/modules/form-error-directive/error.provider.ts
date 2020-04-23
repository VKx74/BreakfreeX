import {Observable} from "rxjs";
import {ValidationErrors} from "@angular/forms";

export interface IFormErrorProvider {
    errorMessageSource(errors: ValidationErrors): Observable<string>;
}
