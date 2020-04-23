import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {JsUtil} from "../../../../utils/jsUtil";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";
import {MatSelectChange} from "@angular/material/select";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

export const SelectorTemplate = `
    <mat-form-field floatLabel="never" class="crypto-select full-width">
      <mat-select (selectionChange)="handleOptionSelected($event)"  placeholder="{{placeholder ? placeholder : 'selectOption' | translate}}"
        [value]="selectedOption"
        [disabled]="disabled" 
        [compareWith]="compareWith"
        >
       
        <mat-option *ngFor="let option of options" [value]="option" (click)="onOptionClick(option)">
          {{getOptionCaption(option) | async }}
        </mat-option>
      </mat-select>
    </mat-form-field>
`;

@Component({
    selector: 'selector',
    template: SelectorTemplate,
    styleUrls: ['selector.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectorComponent),
            multi: true
        }
    ]
})
export class SelectorComponent<T = any> implements ControlValueAccessor {
    id = JsUtil.generateGUID();

    @Input() allowSelectedOptionTriggering = false;
    @Input() disabled = false;
    @Input() options: T[] = [];
    @Input() selectedOption: T;
    @Input() placeholder: string;
    @Output() onSelect = new EventEmitter<T>();
    @Output() optionClick = new EventEmitter();
    @Input() optionCaption: (option: any) => Observable<string> = (option: any) => of(option.toString());
    @Input() optionValue: (option: any) => Observable<string> = (option: any) => of(option.toString());
    @Input() match: (option1: any, option2: any) => boolean = (option1: any, option2: any) => option1 === option2;

    ngOnInit() {
        if (this.selectedOption == null) {
            // this.selectedOption = this.options[0];
        }
    }

    getOptionCaption(option: any) {
        if (option == null) {
            return '';
        }

        return this.optionCaption(option);
    }

    handleOptionSelected(change: MatSelectChange) {
        if (this.selectedOption != null && this.compareWith(change.value, this.selectedOption)) {
            return;
        }

        this.onSelect.emit(change.value);
        this.writeValue(change.value);
    }

    writeValue(value: any): void {
        this.selectedOption = value;
        this.onChange(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    compareWith = (option1: any, option2: any) => {
        if (option1 != null && option2 != null) {
            return this.match(option1, option2);
        }

        return false;
    }

    onChange: (value: any) => void = (value: any) => {
    }
    onTouched = () => {
    }

    onOptionClick(option) {
        this.optionClick.emit(option);
    }
}


