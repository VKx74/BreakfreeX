import {Component, EventEmitter, forwardRef, Input, Output, ViewChild} from '@angular/core';
import {IInstrument} from "@app/models/common/instrument";
import {InstrumentService} from "@app/services/instrument.service";
import {EExchange} from "@app/models/common/exchange";
import {map, switchMap} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {SharedTranslateService} from "@app/localization/shared.token";


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
    @Input() instrumentSearchCallback?: (e?: EExchange, s?: string) => Observable<IInstrument[]>;
    @Input() formControlName: string;
    @Input() resetAfterSelection: boolean = false;
    @Input() openPanelOnClick = false;
    @Output() onSelect = new EventEmitter<IInstrument>();
    @ViewChild(MatAutocompleteTrigger, {static: true}) trigger;

    inputControl = new FormControl();
    filteredInstruments: Observable<IInstrument[]>;
    triggerDomElement: HTMLInputElement;
    selectedInstrument: IInstrument;

    @Input() set instrument(value: IInstrument) {
        if (value) {
            this.setInstrument(value);
        }
    }

    constructor(private _instrumentService: InstrumentService) {

        this.filteredInstruments = this.inputControl.valueChanges
            .pipe(
                switchMap((term: string) => {
                    if (typeof term !== 'string') { // temp fix
                        return of([]);
                    }

                    const mapData = function (data: IInstrument[]) {
                        if (!term || term.length < 2) {
                            return data.splice(0, 50);
                        } else {
                            return data;
                        }
                    };

                    if (this.instrumentSearchCallback) {
                        return this.instrumentSearchCallback(EExchange.any, term).pipe(map(mapData));
                    } else {
                        return this._instrumentService.getInstruments(EExchange.any, term).pipe(map(mapData));
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

    onFocus() {
        if (this.triggerDomElement.value === '') {
            this.trigger._onChange("");
            this.trigger.openPanel();
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
        setTimeout(() => {
            if (this.selectedInstrument && this.inputControl.value !== this.displayWith(this.selectedInstrument)) {
                this.inputControl.setValue(this.selectedInstrument);
            }

            this.trigger.closePanel();
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

    onChange: (value: IInstrument) => void = (value: IInstrument) => {
    }

    onTouched = () => {
    }
}


