import { Component, ElementRef, HostListener, Inject, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { Modal } from "Shared";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { SettingsTranslateService } from 'modules/broker/localization/token';
import { IInstrument } from '@app/models/common/instrument';
import { InstrumentService } from '@app/services/instrument.service';
import { EMarketSpecific } from '@app/models/common/marketSpecific';
import { EExchange } from '@app/models/common/exchange';

export interface InstrumentSearchDialogData {
    instrument: IInstrument;
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
    private _allTypes: any = "All";
    private _selectedInstrumentType: string = this._allTypes;

    public loading: boolean = true;
    public instrumentTypes: EMarketSpecific[] = [];
    public instruments: IInstrument[] = [];
    public preselectedInstrument: IInstrument;
    @ViewChild('input_control', { static: true }) input: ElementRef;

    public get instrumentName(): string {
        return this._instrumentName;
    }

    public set instrumentName(value: string) {
        if (this._instrumentName !== value) {
            this._instrumentName = value;
            this._handleSearchChanged();
        }
    }

    public get selectedInstrumentType(): string {
        return this._selectedInstrumentType;
    }

    public set selectedInstrumentType(value: string) {
        if (this._selectedInstrumentType !== value) {
            this._selectedInstrumentType = value;
            this._loadInstruments();
        }
    }

    constructor(private _injector: Injector,
        private _instrumentService: InstrumentService,
        @Inject(MAT_DIALOG_DATA) public data: InstrumentSearchDialogData) {
        super(_injector);

        this.instrumentTypes = Object.keys(EMarketSpecific).map(_ => EMarketSpecific[_]);
        this.instrumentTypes.unshift(this._allTypes);

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

    selectType(type: EMarketSpecific) {
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

    generateHighlight(data: string): string {
        if (!this._instrumentName) {
            return data;
        }

        let indexOfHighlight = data.toUpperCase().indexOf(this._instrumentName.toUpperCase());
        if (indexOfHighlight === -1) {
            return data;
        }
        let startString = data.substr(0, indexOfHighlight);
        let highlightString = data.substr(indexOfHighlight, this._instrumentName.length);
        let endString = data.substr(indexOfHighlight + this._instrumentName.length);
        return `${startString}<span class="highlight">${highlightString}</span>${endString}`;
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
        this._instrumentService.getInstruments(undefined, this.instrumentName).subscribe((originalData) => {
            const filteredData = this._filterDataByType(originalData);
            if (!this.instrumentName || this.instrumentName.length < 2) {
                this.instruments = filteredData.splice(0, 300);
            } else {
                this.instruments = filteredData;
            }

            if (this.instruments && this.instruments.length) {
                if (this.preselectedInstrument) {
                    let existing = this.instruments.find(_ => _.id === this.preselectedInstrument.id && _.datafeed === this.preselectedInstrument.datafeed);
                    if (existing) {
                        let index = this.instruments.indexOf(existing);
                        if (index < 10) {
                            this.preselectedInstrument = existing;
                        } else {
                            this.preselectedInstrument = this.instruments[0];
                        }
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
            // this.input.nativeElement.focus();
        });
    }

    private _filterDataByType(data: IInstrument[]): IInstrument[] {
        const sortedData = data.sort((a, b) => {
            let isAPrimary = a.exchange === EExchange.Oanda || a.exchange === EExchange.Binance || a.exchange === EExchange.NASDAQ;
            let isBPrimary = b.exchange === EExchange.Oanda || b.exchange === EExchange.Binance || b.exchange === EExchange.NASDAQ;

            if (isBPrimary && !isAPrimary) {
                return 1;
            }
            if (isBPrimary && isAPrimary) {
                return 0;
            }
            if (!isBPrimary && !isAPrimary) {
                return 0;
            }

            return -1;
        });
        
        if (this.selectedInstrumentType === this._allTypes) {
            return sortedData;
        }

        return sortedData.filter(_ => _.specific === this.selectedInstrumentType);
    }
}
