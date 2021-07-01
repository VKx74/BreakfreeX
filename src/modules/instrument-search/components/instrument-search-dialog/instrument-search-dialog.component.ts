import { Component, ElementRef, HostListener, Inject, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { Modal } from "Shared";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { SettingsTranslateService } from 'modules/broker/localization/token';
import { IInstrument } from '@app/models/common/instrument';
import { InstrumentService } from '@app/services/instrument.service';

export interface InstrumentSearchDialogData {
    instrument: IInstrument;
}

enum InstrumentType {
    All = "All",
    ForexMajor = "Forex Major",
    ForexMinor = "Forex Minor",
    ForexExotic = "Forex Exotic",
    Indices = "Indices",
    Commodities = "Commodities",
    Metals = "Metals",
    Bonds = "Bonds",
    Stocks = "Stocks",
    Crypto = "Crypto"
}

@Component({
    selector: 'instrument-search-dialog',
    templateUrl: './instrument-search-dialog.component.html',
    styleUrls: ['./instrument-search-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SettingsTranslateService
        }
    ]
})
export class InstrumentSearchDialogComponent extends Modal implements OnInit {
    private _timeout: any;
    private _instrumentName: string;

    public loading: boolean = true;
    public selectedInstrumentType: InstrumentType = InstrumentType.All;
    public instrumentTypes: InstrumentType[] = Object.keys(InstrumentType).map(_ => InstrumentType[_]);
    public instruments: IInstrument[] = [];
    public preselectedInstrument: IInstrument;
    @ViewChild ('input_control', {static: true}) input: ElementRef;

    public get instrumentName(): string {
        return this._instrumentName;
    }

    public set instrumentName(value: string) {
        if (this._instrumentName !== value) {
            this._instrumentName = value;
            this._handleSearchChanged();
        }
    }

    constructor(private _injector: Injector,
        private _instrumentService: InstrumentService,
        @Inject(MAT_DIALOG_DATA) public data: InstrumentSearchDialogData) {
        super(_injector);

        if (this.data && this.data.instrument) {
            this.instrumentName = this.data.instrument.symbol;
            this.preselectedInstrument = this.data.instrument;
        } else {
            this._handleSearchChanged();
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.input.nativeElement.focus();
    }

    selectType(type: InstrumentType) {
        this.selectedInstrumentType = type;
    }

    handleInstrumentSelected(instrument: IInstrument) {
        this.close(instrument);
    }

    mouseenterOnElement(instrument: IInstrument) {
        this.preselectedInstrument = instrument;
    }

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();
            this._handleArrow(false);
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();
            this._handleArrow(true);
        }

        if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            if (this.preselectedInstrument) {
                console.log(this.preselectedInstrument);
                this.close(this.preselectedInstrument);
            }
        }
    }

    private _handleArrow(isUp: boolean) {
        let index = this.instruments.indexOf(this.preselectedInstrument);
        let newValue = this.instruments[index + (isUp ? -1 : 1)];
        if (newValue) {
            this.preselectedInstrument = newValue;
        }
    }

    private _handleSearchChanged() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        this._timeout = setTimeout(() => {
            this._loadInstruments();
        }, 500);
    }

    private _loadInstruments() {
        this.loading = true;
        this._instrumentService.getInstruments(undefined, this.instrumentName).subscribe((data) => {
            if (!this.instrumentName || this.instrumentName.length < 2) {
                this.instruments = data.splice(0, 200);
            } else {
                this.instruments = data;
            }

            if (this.instruments && this.instruments.length) {
                if (this.preselectedInstrument) {
                    let existing = this.instruments.find(_ => _.id === this.preselectedInstrument.id
                        && _.datafeed === this.preselectedInstrument.datafeed);

                    if (existing) {
                        this.preselectedInstrument = existing;
                    } else {
                        this.preselectedInstrument = this.instruments[0];
                    }
                } else {
                    this.preselectedInstrument = this.instruments[0];
                }
            } else {
                this.preselectedInstrument = null;
            }
            this.loading = false;
            this.input.nativeElement.focus();
        });
    }
}
