import {Observable} from "rxjs";
import {Component, EventEmitter, forwardRef, Input, Output} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";

@Component({
    selector: 'search-input',
    templateUrl: 'search-input.component.html',
    styleUrls: ['search-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInputComponent),
            multi: true
        },
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class SearchInputComponent implements ControlValueAccessor {
    @Input() placeholder: string;
    @Output() onEnter = new EventEmitter<string>();
    @Output() onInput = new EventEmitter<string>();

    formControl: FormControl;

    ngOnInit() {
        this.formControl = new FormControl();
        this.formControl.valueChanges
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe((query: string) => {
                this.onChange(query);
                this.onInput.emit(query);
            });
    }

    handleSearchEnterKey() {
        this.onEnter.emit(this.formControl.value);
    }

    writeValue(value: string): void {
        this.formControl.setValue(value);
        this.onChange(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
    }

    onChange: (value: any) => void = (value: any) => {
    }
    onTouched = () => {
    }

    ngOnDestroy() {

    }
}


