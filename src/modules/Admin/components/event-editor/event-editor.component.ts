import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {EconomicEvent} from "@calendarEvents/models/models";
import {EventConsolidatorService} from "../../services/event-consolidator.service";
import {EEventVolatility} from "@calendarEvents/models/enums";
import {JsUtil} from "../../../../utils/jsUtil";
import {AlertService} from "@alert/services/alert.service";
import {TagsInputMode} from "@tagsInput/components/tags-input/tags-input.component";
import {TzUtils} from "TimeZones";
import {InstrumentService} from "@app/services/instrument.service";

export enum EventEditorAction {
    Create,
    Update,
    SetActual
}

@Component({
    selector: 'event-editor',
    templateUrl: './event-editor.component.html',
    styleUrls: ['./event-editor.component.scss']
})
export class EventEditorComponent extends Modal {
    formGroup: FormGroup;
    formGroupValidators = {
        titleMaxLength: 200,
        descriptionMaxLength: 3000,
        actualMaxLength: 20,

    };
    volatilityList: EEventVolatility[] = JsUtil.numericEnumToArray(EEventVolatility);
    symbols: string[] = [];
    processing: boolean = false;

    get event(): EconomicEvent {
        return this.data.event;
    }

    get EventEditorAction() {
        return EventEditorAction;
    }

    get EEventVolatility() {
        return EEventVolatility;
    }

    get mode(): EventEditorAction {
        return this.data.mode;
    }

    get TagsInputMode() {
        return TagsInputMode;
    }

    constructor(private _injector: Injector,
                private _alertService: AlertService,
                private _instrumentService: InstrumentService,
                private  _eventConsolidatorService: EventConsolidatorService) {
        super(_injector);
    }

    ngOnInit() {
        this.formGroup = this._getFormGroup();
        this.symbols = this.event.symbols.slice();
    }

    createEvent() {
        const formControls = this.formGroup.controls;
        let event: EconomicEvent = {
            id: JsUtil.generateGUID(),
            time: this._combineTime(formControls['date'].value, formControls['time'].value).valueOf(),
            title: formControls['title'].value,
            description: formControls['description'].value,
            volatility: formControls['volatility'].value,
            actual: formControls['actual'].value,
            consensus: formControls['consensus'].value,
            previous: formControls['previous'].value,
            symbols: this.symbols
        };

        this.processing = true;
        this._eventConsolidatorService.createEvent(event)
            .subscribe({
                next: () => {
                    this.close(true);
                },
                error: (e) => {
                    console.error(e);
                    this._alertService.error('Failed to create event');
                },
                complete: () => {
                    this.processing = false;
                }
            });
    }

    updateEvent(mode: EventEditorAction) {
        const formControls = this.formGroup.controls;
        let event: EconomicEvent = this.event;

        if (mode === EventEditorAction.SetActual) {
            event.actual = formControls['actual'].value;
        }

        if (mode === EventEditorAction.Update) {
            event.time = this._combineTime(formControls['date'].value, formControls['time'].value).valueOf();
            event.title = formControls['title'].value;
            event.description = formControls['description'].value;
            event.volatility = formControls['volatility'].value;
            event.actual = formControls['actual'].value;
            event.consensus = formControls['consensus'].value;
            event.previous = formControls['previous'].value;
            event.symbols = this.symbols;
        }

        this.processing = true;
        this._eventConsolidatorService.updateEvent(event)
            .subscribe({
                next: () => {
                    this.close(event);
                },
                error: (e) => {
                    console.error(e);
                    this._alertService.error('Failed to update event');
                },
                complete: () => {
                    this.processing = false;
                }
            });
    }

    addSymbol(symbol: string): void {
        this.symbols.push(symbol);
    }

    removeSymbol(symbol: string): void {
        const index = this.symbols.indexOf(symbol);

        if (index >= 0) {
            this.symbols.splice(index, 1);
        }
    }

    utcTimeToLocal(date: Date) {
        return TzUtils.utcToLocalTz(date);
    }

    private _combineTime(date: string, time: string): Number {
        let tempDate = moment(date);
        let tempTime = moment(time, 'HH:mm A');
        tempDate.set('hour', Number(tempTime.hour())).set('minute', Number(tempTime.minutes()));
        return TzUtils.localToUTCTz(new Date(tempDate.valueOf())).getTime();
    }

    private _getFormGroup() {
        const lengthValidators = this.formGroupValidators;
        if (this.mode === EventEditorAction.Update) {
            return new FormGroup({
                date: new FormControl(this.utcTimeToLocal(new Date(this.event.time)), Validators.required),
                time: new FormControl(
                    moment(this.utcTimeToLocal(new Date(this.event.time))).format('HH:mm A'), Validators.required),
                title: new FormControl(this.event.title, [Validators.required, Validators.maxLength(lengthValidators.titleMaxLength)]),
                description: new FormControl(this.event.description, [Validators.required, Validators.maxLength(lengthValidators.descriptionMaxLength)]),
                volatility: new FormControl(this.event.volatility, Validators.required),
                actual: new FormControl(this.event.actual, [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)]),
                consensus: new FormControl(this.event.consensus, [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)]),
                previous: new FormControl(this.event.previous, [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)])
            });
        } else if (this.mode === EventEditorAction.SetActual) {
            return new FormGroup({
                actual: new FormControl(this.event.actual, [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)])
            });
        } else {
            return new FormGroup({
                date: new FormControl('', Validators.required),
                time: new FormControl('', Validators.required),
                title: new FormControl('', [Validators.required, Validators.maxLength(lengthValidators.titleMaxLength)]),
                description: new FormControl('', [Validators.required, Validators.maxLength(lengthValidators.descriptionMaxLength)]),
                volatility: new FormControl(EEventVolatility.Medium, Validators.required),
                actual: new FormControl('', [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)]),
                consensus: new FormControl('', [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)]),
                previous: new FormControl('', [Validators.required, Validators.maxLength(lengthValidators.actualMaxLength)])
            });
        }
    }
}
