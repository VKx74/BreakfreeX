import { Component, ElementRef, Injector, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { Modal } from "Shared";
import { EExchange } from "../../../../../../app/models/common/exchange";
import { IInstrument } from "../../../../../../app/models/common/instrument";
import { TradingTranslateService } from "../../../../localization/token";
import { BrokerService } from "@app/services/broker.service";
import { InstrumentService } from "../../../../../../app/services/instrument.service";
import { InstrumentSearchComponent } from "../../../../../instrument-search/components/instrument-search/instrument-search.component";
import { DataTableComponent } from "../../../../../datatable/components/data-table/data-table.component";
import { AlertService } from "../../../../../Alert";
import { InstrumentMappingService } from "../../../../../../app/services/instrument-mapping.service";

export class MapPair {
    constructor(item1: string, item2: string) {
        this.Item1 = item1;
        this.Item2 = item2;
    }
    public Item1: string;
    public Item2: string;
}

@Component({
    selector: 'symbol-mapping',
    templateUrl: './symbol-mapping.component.html',
    styleUrls: ['./symbol-mapping.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class SymbolMappingComponent extends Modal<any> implements OnInit {
    constructor(injector: Injector,
        private _alertService: AlertService,
        private _brokerService: BrokerService,
        private _instrumentService: InstrumentService,
        private _symbolMappingService: InstrumentMappingService) {
        super(injector);
    }
    
    @ViewChild('feedInstrumentSearch', {static: false}) feedInstrumentSearch: InstrumentSearchComponent;
    @ViewChild('brokerInstrumentSearch', {static: false}) brokerInstrumentSearch: InstrumentSearchComponent;
    @ViewChild(DataTableComponent, {static: false}) table: DataTableComponent;

    private feedSymbol: string;
    private brokerSymbol: string;    
    private MappedAray: Array<MapPair>;    

    ngOnInit(): void {                
        this._symbolMappingService.getSymbolMapping()
        .subscribe((data: {[key: string]: string}) => {
            this.MappedAray = new Array();
            let keys = Object.keys(data);
            keys.forEach(key => {
                this.MappedAray.push(new MapPair(key, data[key]));
            });            
        });
    }

    handleDFeedInstrumentChange(instrument: IInstrument) {        
        this.feedSymbol = instrument.symbol;
    }

    handleBrokerInstrumentChange(instrument: IInstrument) {        
        this.brokerSymbol = instrument.symbol;
    }

    get instrumentDFeedSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {            
            return this._instrumentService.getInstruments(null, s);            
        };
    }

    get instrumentBrokerSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {            
            return this._brokerService.getInstruments(e, s);
        };
    }

    Remove(item: MapPair): void {
        let index = this.MappedAray.indexOf(item, 0);        
        if (index > -1) {            
            this._symbolMappingService.removeSymbolMapping(this.MappedAray[index].Item1)
            .subscribe((res: any) => {
                this.MappedAray.splice(index, 1);
                let arr = this.MappedAray;
                this.MappedAray = new Array();
                arr.forEach(element => {
                    this.MappedAray.push(element);
                });
            });
        }        
            
        this.table.updateDataSource();
    }

    Add(): void {
        let activeBroker = this._brokerService.getActiveBroker();        
        let errorMessage: string = '';
        if (!this.feedSymbol) {
            errorMessage = `Data feed symbol not set`;
        } else if (!this.brokerSymbol) {
            errorMessage = `Broker symbol not set`;
        } else {
            this.MappedAray.forEach((pair: MapPair) => {
                if (pair.Item1 === this.feedSymbol)
                    errorMessage = `Symbol ${this.feedSymbol} already mapped`;
                else if (pair.Item2 === this.brokerSymbol)
                    errorMessage = `Symbol ${this.brokerSymbol} already mapped`;
            });
        }

        if (errorMessage.length > 0) {
            this._alertService.error(errorMessage);
            return;
        }

        this._symbolMappingService
        .addSymbolMapping(this.feedSymbol, this.brokerSymbol)
        .subscribe((res: any) => {
            let item = new MapPair(this.feedSymbol, this.brokerSymbol);
            this.MappedAray.push(item);
            this.brokerInstrumentSearch.reset();
            this.feedInstrumentSearch.reset();
            this.feedSymbol = '';
            this.brokerSymbol = '';
            let arr = this.MappedAray;
            this.MappedAray = new Array();
            arr.forEach(element => {
                this.MappedAray.push(element);
            });
        }, (err: any) => {
            console.log('post error:');
            console.log(err);
        });     
    }
}