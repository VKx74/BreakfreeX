import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { IInstrument } from "@app/models/common/instrument";
import { InstrumentService } from "@app/services/instrument.service";
import { EExchange } from "@app/models/common/exchange";
import { map, switchMap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { SharedTranslateService } from "@app/localization/shared.token";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';
import { InstrumentSearchDialogComponent } from '../instrument-search-dialog/instrument-search-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export const INPUT_DEBOUNCE_TIME = 500;

@Component({
    selector: 'instrument-search',
    templateUrl: 'instrument-search.component.html',
    styleUrls: ['instrument-search.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SharedTranslateService
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InstrumentSearchComponent),
            multi: true
        }
    ]
})
export class InstrumentSearchComponent {
    @Input() instrumentSearchCallback?: (e?: EExchangeInstance, s?: string) => Observable<IInstrument[]>;
    @Input() placeholder: string;
    @Input() formControlName: string;
    @Input() resetAfterSelection: boolean = false;
    @Input() openPanelOnClick = false;
    @Input() showDropDown = false;
    @Input() isBrokerSearch = false;
    @Output() onSelect = new EventEmitter<IInstrument>();
    @ViewChild(MatAutocompleteTrigger, { static: true }) trigger;
    @ViewChild ('instrument_input', {static: true}) input: ElementRef;

    inputControl = new FormControl();
    filteredInstruments: Observable<IInstrument[]>;
    triggerDomElement: HTMLInputElement;
    selectedInstrument: IInstrument;

    @Input() set instrument(value: IInstrument) {
        if (value) {
            this.setInstrument(value);
        }
    }

    constructor(private _instrumentService: InstrumentService, private _dialog: MatDialog) {

        this.filteredInstruments = this.inputControl.valueChanges
            .pipe(
                debounceTime(INPUT_DEBOUNCE_TIME),
                distinctUntilChanged(),
                switchMap((term: string) => {
                    if (typeof term !== 'string') { // temp fix
                        return of([]);
                    }

                    const mapData = function (data: IInstrument[]) {
                        if (!term || term.length < 2) {
                            return data.splice(0, 200);
                        } else {
                            return data;
                        }
                    };

                    if (this.instrumentSearchCallback) {
                        return this.instrumentSearchCallback(undefined, term).pipe(map(mapData));
                    } else {
                        return this._instrumentService.getInstruments(undefined, term).pipe(map(mapData));
                    }
                }),
            );
    }

    ngOnInit() {
        this.triggerDomElement = this.trigger._element.nativeElement;
    }

    displayWith = (instrument: IInstrument) => {
        if (instrument) {
            return instrument.symbol;
        }
    }

    handleInstrumentSelected(event: MatAutocompleteSelectedEvent) {
        const instrument = event.option.value;
        this.setSelectedInstrument(instrument);
    } 
    
    setSelectedInstrument(instrument: IInstrument) {
        this.onSelect.emit(instrument);
        this.writeValue(instrument);

        if (this.resetAfterSelection) {
            this.reset();
        }
    }

    setInstrument(instrument: IInstrument) {
        if (instrument) {
            this.writeValue(instrument);
        }
    }

    handleClick() {
        if (!this.showDropDown) {
            this.input.nativeElement.blur();
            this._dialog.open(InstrumentSearchDialogComponent, {
                data: {
                    instrument: this.selectedInstrument,
                    instrumentSearchCallback: this.instrumentSearchCallback,
                    isBrokerSearch: this.isBrokerSearch
                }
            }).afterClosed().subscribe((data) => {
                if (data) {
                    this.setSelectedInstrument(data);
                }
            });
        }
    }

    onFocus() {
        if (this.showDropDown) {
            if (this.triggerDomElement.value === '') {
                this.trigger._onChange("");
                this.trigger.openPanel();
            }
        }
    }

    onClick() {
        if (this.openPanelOnClick) {
            if (this.triggerDomElement.value === '') {
                this.trigger._onChange('');
                this.trigger.openPanel();
            }
        }
    }

    handleBlur() {
        if (!this.showDropDown) {
            return;
        }

        setTimeout(() => {
            if (this.selectedInstrument && this.inputControl.value !== this.displayWith(this.selectedInstrument)) {
                this.inputControl.setValue(this.selectedInstrument);
            }

            // this.trigger.closePanel();
        }, 300); // fix it
    }

    reset() {
        this.inputControl.reset();
        this.selectedInstrument = null;
    }

    writeValue(instrument: IInstrument): void {
        this.inputControl.setValue(instrument);
        this.selectedInstrument = instrument;
        this.onChange(instrument);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.inputControl.disable();
        } else {
            this.inputControl.enable();
        }
    }

    getPlaceholderText() {
        if (this.placeholder) {
            return this.placeholder;
        }
    }

    onChange: (value: IInstrument) => void = (value: IInstrument) => {
    }

    onTouched = () => {
    }
}


