import {Directive, ElementRef, Host, Inject, Input, Optional, SkipSelf} from '@angular/core';
import {ErrorProviderToken} from "../error-provider.token";
import {IFormErrorProvider} from "../error.provider";
import {ControlContainer, FormControl, ValidationErrors} from "@angular/forms";
import {map, startWith, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {Observable, of, Subscription} from "rxjs";

@Directive({
    selector: '[formError]'
})
export class FormErrorDirective {
    @Input('formError') formControlName: string;
    @Input('errorProvider') customErrorProvider: IFormErrorProvider;

    formControl: FormControl;
    private _subscription: Subscription;

    constructor(private _el: ElementRef,
                @Inject(ErrorProviderToken) private _errorProvider: IFormErrorProvider,
                @Optional() @Host() @SkipSelf()
                private _controlContainer: ControlContainer) {
    }

    ngOnInit() {
        if (this._controlContainer) {
            if (this.formControlName) {
                this.formControl = this._controlContainer.control.get(this.formControlName) as FormControl;
            } else {
                console.warn('Missing FormControlName directive from host element of the component');
            }
        } else {
            console.warn('Can\'t find parent FormGroup directive');
        }

        const formControl = this.formControl;

        if (formControl) {
            formControl.valueChanges
                .pipe(
                    startWith(null), // initial
                    map(() => {
                        if (formControl.valid) {
                            return of(null);
                        } else {
                            return this._getErrorMessage(formControl.errors);
                        }
                    }),
                    takeUntil(componentDestroyed(this))
                )
                .subscribe((errorMessageObs: Observable<string>) => {
                    this._setErrorMessageObs(errorMessageObs);
                });
        }
    }

    private _setErrorMessageObs(errorObs: Observable<string>) {
        const native = this._el.nativeElement;

        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }

        if (errorObs) {
            this._subscription = errorObs.subscribe((errorMessage: string) => {
                native.textContent = errorMessage || '';
                native.setAttribute('title', errorMessage || '');
            });
        } else {
            native.textContent = '';
            native.setAttribute('title', '');
        }
    }

    private _getErrorMessage(errors: ValidationErrors): Observable<string> {
        if (errors == null) {
            return of(null);
        }

        return this.customErrorProvider
            ? this.customErrorProvider.errorMessageSource(errors)
            : this._errorProvider.errorMessageSource(errors);
    }

    ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
