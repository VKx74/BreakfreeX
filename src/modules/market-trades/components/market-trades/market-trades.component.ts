import {Component, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {IInstrument} from "@app/models/common/instrument";
import {InstrumentService} from "@app/services/instrument.service";
import {EExchange} from "@app/models/common/exchange";
import {RealtimeService} from "@app/services/realtime.service";
import {ITick} from "@app/models/common/tick";
import {Subscription} from "rxjs";
import {ESide} from "@app/models/common/side";
import {TranslateService} from "@ngx-translate/core";
import {Actions, LinkingAction} from "@linking/models";
import {HistoryService} from "@app/services/history.service";
import {MarketTradesTranslateService} from "../../localization/token";
import {ComponentIdentifier} from "@app/models/app-config";
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {DataTableComponent} from 'modules/datatable/components/data-table/data-table.component';
import {GoldenLayoutItemState} from "angular-golden-layout";

export interface IMarketTradesComponentState {
    activeInstrument: IInstrument;
    precision: number;
}

class LevelPrice {
    public price: number;
    public amount: number;
    public time: number;
    public orderSide: ESide;
}

@Component({
    selector: 'market-trades',
    templateUrl: './market-trades.component.html',
    styleUrls: ['./market-trades.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: MarketTradesTranslateService
        }
    ]
})
export class MarketTradesComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'Market Trades';
    static previewImgClass = 'crypto-icon-mt';
    public readonly supportedPrecisions: number[] = [1, 0.1, 0.01, 0.001, 0.0001];
    private subscription: Subscription;
    private _levelsCount = 20;
    baseCurrency: string;
    dependCurrency: string;
    pricePecision = 0;
    totalAmountPrecision = 4;
    levels: LevelPrice[];
    activeInstrument: IInstrument;
    @ViewChild(DataTableComponent, {static: false})
    dataTable: DataTableComponent;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(@Optional() @Inject(GoldenLayoutItemState) protected _state: IMarketTradesComponentState,
                private _instrumentService: InstrumentService,
                private _translateService: TranslateService,
                private _realtimeService: RealtimeService,
                private _historyService: HistoryService,
                protected _injector: Injector) {
        super(_injector);

        this.levels = [];
        this.baseCurrency = '';
        this.dependCurrency = '';

        super.setTitle(
            this._translateService.stream('componentName')
        );
    }

    ngOnInit() {
        if (this._state && this._state.activeInstrument) {
            this.loadState(this._state);
        } else {
            this._instrumentService.getInstruments().subscribe(values => {
                if (values && values.length) {
                    const activeInstrument = values[0];
                    this._selectInstrument(activeInstrument);
                    this.fireStateChanged();
                }
            });
        }

        this._initLinking();
    }

    private _initLinking() {
        this.linker.onAction((action: LinkingAction) => {
            if (action.type === Actions.ChangeInstrument) {
                if (action.data !== this.activeInstrument) {
                    this._selectInstrument(action.data);
                    this.fireStateChanged();
                }
            }
        });
    }

    private _sendInstrumentChange(instrument: IInstrument) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrument,
            data: instrument
        };
        this.linker.sendAction(linkAction);
    }

    setTotalAmountPrecision(precision: number) {
        this.totalAmountPrecision = this.supportedPrecisions.indexOf(precision);
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._sendInstrumentChange(instrument);

        if (instrument !== this.activeInstrument) {
            this._selectInstrument(instrument);
            this.fireStateChanged();
        }
    }

    private _selectInstrument(instrument: IInstrument) {
        this.activeInstrument = instrument;
        this.baseCurrency = instrument.baseInstrument;
        this.dependCurrency = instrument.dependInstrument;
        this.pricePecision = instrument.pricePrecision;
        this.levels = [];
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        const lastTicks = this._realtimeService.getLastTicks(this.activeInstrument);

        if (lastTicks && lastTicks.length) {
            lastTicks.reverse().forEach(value => {
                this._processTick(value);
            });
        }

        this._historyService.getLastTrades(this.activeInstrument).subscribe((values: ITick[]) => {
            if (values && values.length) {
                this._insertTickHistory(values);
            }
        });

        this.subscription = this._realtimeService.subscribeToTicks(this.activeInstrument, (value: ITick) => {
            this._processTick(value);
        });
    }

    private _processTick(value: ITick) {
        if (this.levels.length > this._levelsCount) {
            for (let i = this.levels.length - 1; i > 0; i--) {
                let current = this.levels[i];
                let prev = this.levels[i - 1];
                current.amount = prev.amount;
                current.orderSide = prev.orderSide;
                current.price = prev.price;
                current.time = prev.time;
            }
            this.levels[0].amount = value.volume;
            this.levels[0].orderSide = value.side;
            this.levels[0].price = value.price;
            this.levels[0].time = value.time;
         } else {
            this.levels.unshift({
                orderSide: value.side,
                amount: value.volume,
                price: value.price,
                time: value.time
            });
    
            if (this.dataTable) {
                this.dataTable.updateDataSource();
            }   
        }
    }

    private _insertTickHistory(values: ITick[]) {
        for (let value of values) {
            this.levels.push({
                orderSide: value.side,
                amount: value.volume,
                price: value.price,
                time: value.time
            });
        }

        this.levels = this.levels.sort((a, b) => {
            return (new Date(b.time)).getTime() - (new Date(a.time)).getTime();
        });

        if (this.levels.length > this._levelsCount) {
            this.levels.splice(-1, this.levels.length - this._levelsCount);
        }
    }

    loadState(state: IMarketTradesComponentState) {
        if (state.precision) {
            this.totalAmountPrecision = state.precision;
        }

        this._selectInstrument(state.activeInstrument);
    }

    protected getComponentState() {
        return {
            activeInstrument: this.activeInstrument,
            precision: this.totalAmountPrecision
        };
    }

    getPriceLevelClass(level: LevelPrice): string {
        return level.orderSide === ESide.buy
            ? 'buy-price-level'
            : 'sell-price-level';
    }

    getPriceLevelHighlightColor(level: LevelPrice): string {
        return level.orderSide === ESide.buy
            ? 'rgba(0, 255, 0, 0.3)'
            : 'rgba(255, 0, 0, 0.3)';
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
