import {Component, Inject, Injector, ViewChild} from "@angular/core";
import {TrendDirection, WatchlistInstrumentVM} from "../../models/models";
import {ConfirmModalComponent} from "UI";
import {IInstrument} from "@app/models/common/instrument";
import {EMPTY, forkJoin, Subscription} from "rxjs";
import {RealtimeService} from "@app/services/realtime.service";
import {ILevel2, ITick} from "@app/models/common/tick";
import {JsUtil} from "../../../../utils/jsUtil";
import {catchError} from "rxjs/operators";
import {WatchListTranslateService} from "../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {LocalizationService} from "Localization";
import {InstrumentSearchComponent} from "@instrument-search/components/instrument-search/instrument-search.component";
import {MatDialog} from "@angular/material/dialog";
import {Actions, LinkingAction} from "../../../Linking/models";
import {LinkerFactory} from "../../../Linking/linking-manager";
import {IHistoryRequest} from "@app/models/common/historyRequest";
import {IPeriodicity} from "@app/models/common/periodicity";
import {IHistoryResponse} from "@app/models/common/historyResponse";
import {DataFeedBase} from "@chart/datafeed/DataFeedBase";
import {DataFeed} from "@chart/datafeed/DataFeed";
import {InstrumentService} from "@app/services/instrument.service";
import {EExchange} from "@app/models/common/exchange";
import {ComponentIdentifier} from "@app/models/app-config";
import {
    ColumnSortDataAccessor,
    DataTableComponent
} from "../../../datatable/components/data-table/data-table.component";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import bind from "bind-decorator";
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import {
    CryptoOrderConfiguratorModalComponent,
    ICryptoOrderFormConfig
} from "../../../Trading/components/crypto.components/crypto-order-configurator-modal/crypto-order-configurator-modal.component";
import {OrderConfig} from "../../../Trading/components/crypto.components/crypto-order-configurator/crypto-order-configurator.component";
import {ITcdComponentState} from "Chart";
import {AlertDialogComponent} from "../../../AutoTradingAlerts/components/alert-dialog/alert-dialog.component";
import {HistoryService} from "@app/services/history.service";
import {IBarData} from "@app/models/common/barData";

export interface IWatchlistComponentState {
    instruments: { symbol: string, exchange: EExchange }[];
    viewMode: WatchlistViewMode;
    hiddenColumns: string[];
}

export enum WatchlistViewMode {
    Table,
    Tile
}

interface IInstrumentOrderBookInfo {
    buys: { price: number; amount: number; total: number };
    sells: { price: number; amount: number; total: number };
    buysTotal: number;
    sellsTotal: number;
    lastBar: IBarData;
}


@Component({
    selector: 'watchlist',
    templateUrl: 'watchlist.component.html',
    styleUrls: ['watchlist.component.scss'],
    providers: [
        {
            provide: DataFeedBase,
            useClass: DataFeed
        },
        {
            provide: TranslateService,
            useExisting: WatchListTranslateService
        }
    ]
})
export class WatchlistComponent extends BaseLayoutItemComponent {
    static componentName = 'Watchlist';
    static previewImgClass = 'crypto-icon-watchlist';
    @ViewChild(InstrumentSearchComponent, {static: false}) instrumentSearch: InstrumentSearchComponent;
    @ViewChild(DataTableComponent, {static: false}) dataTableComponent: DataTableComponent;

    instrumentsVM: WatchlistInstrumentVM[] = [];
    instrumentsPriceHistory: { [symbolName: string]: number[] } = {};
    selectedInstrumentVM: WatchlistInstrumentVM = null;
    viewMode: WatchlistViewMode = WatchlistViewMode.Table;
    hiddenColumns: string[] = ["highestPrice", "lowestPrice", "volume24h", "tickTime", "chart"];

    intervals: { [symbolName: string]: any } = {};

    private _realtimeSubscriptions: { [instrumentHash: string]: Subscription } = {};

    get ViewMode() {
        return WatchlistViewMode;
    }

    get TrendDirection() {
        return TrendDirection;
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    _levels2Subscriptions = new Map<IInstrument, Subscription>();
    _visibleOrderBooks = new Map<IInstrument, boolean>();
    _instrumentsOrderBookInfo = new Map<IInstrument, IInstrumentOrderBookInfo>();

    constructor(@Inject(GoldenLayoutItemState) protected _state: IWatchlistComponentState,
                private _dialog: MatDialog,
                private _datafeed: DataFeedBase,
                private _historyService: HistoryService,
                private _realtimeService: RealtimeService,
                private _localizationService: LocalizationService,
                private _translateService: TranslateService,
                private _layoutManagerService: LayoutManagerService,
                private _linkerFactory: LinkerFactory,
                protected _injector: Injector,
                private _instrumentService: InstrumentService) {

        super(_injector);

        this.setTitle(
            this._translateService.stream('watchlistComponentName')
        );

        if (_state && _state.instruments) {
            this._loadState(_state);
        }
    }

    ngOnInit() {

    }

    protected useDefaultLinker(): boolean {
        return true;
    }

    protected getComponentState(): IWatchlistComponentState {
        return {
            instruments: this.instrumentsVM.map((vm) => ({
                symbol: vm.instrument.symbol,
                exchange: vm.instrument.exchange
            })),
            viewMode: this.viewMode,
            hiddenColumns:  this.dataTableComponent ? this.dataTableComponent.hiddenColumns$.getValue() : this.hiddenColumns
        };
    }

    setViewMode(viewMode: WatchlistViewMode, fireStateChanged: boolean = true) {
        this.viewMode = viewMode;

        if (this.dataTableComponent) {
            this.hiddenColumns = this.dataTableComponent.hiddenColumns$.getValue();
        }

        if (viewMode === WatchlistViewMode.Tile) {
            this.hideAllOrderBooks();
        }

        if (fireStateChanged) {
            this.fireStateChanged();
        }
    }

    @bind
    columnCaption(value: string) {
        return this._translateService.get(`watchList.${value}`);
    }

    private _initDatafeed(instrumentVM: WatchlistInstrumentVM) {
        this._datafeed.init(false).then(d => {
            this._getHistory(instrumentVM, d);
            const key = this.getKeyForInstrumentsPriceHistory(instrumentVM.instrument);
            if (this.intervals[key]) {
                clearInterval(this.intervals[key]);
            }
            this.intervals[key] = setInterval(() => {
                this._getHistory(instrumentVM, d);
            }, 3600000);
        });
    }

    private _getHistory(instrumentVM: WatchlistInstrumentVM, datafeed: any) {
        let requestMsg: IHistoryRequest = {
            instrument: instrumentVM.instrument,
            timeFrame: {
                periodicity: IPeriodicity.hour,
                interval: 1
            },
            startDate: new Date(new Date().getTime() - 86400000),
            endDate: new Date()
        };

        datafeed._historyService.getHistory(requestMsg).subscribe((response: IHistoryResponse) => {
            if (response && response.data.length) {
                const data = response.data;
                if (data.length > 24) {
                    data.reverse().length = 24;
                    data.reverse();
                }
                instrumentVM.initData(data);
                this.instrumentsVM = [...this.instrumentsVM];
                const key = this.getKeyForInstrumentsPriceHistory(instrumentVM.instrument);
                this.instrumentsPriceHistory[key] = data.map(value => value.close);
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

    handleInstrumentClick(instrumentVM: WatchlistInstrumentVM) {
        this.selectedInstrumentVM = instrumentVM;
        this._sendInstrumentChange(instrumentVM.instrument);
    }

    addInstrument(instrument: IInstrument, fireStateChanged: boolean = true) {
        const alreadyExist = this.instrumentsVM.findIndex(i => i.instrument.symbol === instrument.symbol && i.instrument.exchange === instrument.exchange) !== -1;

        if (alreadyExist) {
            return;
        }

        const instrumentVM = new WatchlistInstrumentVM(instrument);

        this.instrumentsVM = [...this.instrumentsVM, instrumentVM];
        this._initDatafeed(instrumentVM);
        this._subscribeOnInstrumentTick(instrumentVM);

        if (fireStateChanged) {
            this.fireStateChanged();
        }

        if (this.instrumentSearch) {
            this.instrumentSearch.reset();
        }
    }

    removeInstrument(instrument: WatchlistInstrumentVM) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`watchList.removeSymbol`),
                onConfirm: () => {
                    this._removeInstrument(instrument);
                }
            }
        } as any)
            .afterClosed();
    }

    placeOrder(watchlistInstrument: WatchlistInstrumentVM) {
        let tradeConfig = OrderConfig.create();
        tradeConfig.instrument = watchlistInstrument.instrument;
        const config: ICryptoOrderFormConfig = {
            tradeConfig: tradeConfig,
            skipOrderPlacing: false
        };
        this._dialog.open(CryptoOrderConfiguratorModalComponent, {
            data: config
        });
    }

    openChart(watchlistInstrument: WatchlistInstrumentVM) {
        this._layoutManagerService.addComponentAsColumn({
            layoutItemName: ComponentIdentifier.chart,
            state: {
                instrument: watchlistInstrument.instrument
            } as ITcdComponentState
        });
    }

    setAlert(watchlistInstrument: WatchlistInstrumentVM) {
        this._dialog.open(AlertDialogComponent, {
            data: {
                instrument: watchlistInstrument.instrument
            }
        });
    }

    private _loadState(state: IWatchlistComponentState) {
        if (state && state.hiddenColumns) {
            this.hiddenColumns = state.hiddenColumns;
        }

        this.setViewMode(state.viewMode, false);
        forkJoin(
            state.instruments.map((item) => {
                return this._instrumentService.getInstrumentBySymbol(item.symbol, item.exchange)
                    .pipe(
                        catchError((e) => {
                            console.error('Failed to load instrument', e);
                            return EMPTY;
                        })
                    );
            })
        ).subscribe((instruments: IInstrument[]) => {
            instruments.forEach((instrument) => {
                if (instrument) {
                    this.addInstrument(instrument, false);
                }
            });
        });
    }

    getKeyForInstrumentsPriceHistory(instrument: IInstrument) {
        return instrument.symbol + instrument.exchange;
    }

    private _updateWatchlistChartHistory(instrument: IInstrument, lastPrice: number) {
        const key = this.getKeyForInstrumentsPriceHistory(instrument);
        const history = this.instrumentsPriceHistory[key];
        if (history) {
            history.splice(history.length - 1, 1, lastPrice);
            this.instrumentsPriceHistory[key] = [...history];
        }
    }

    priceDataAccessor: ColumnSortDataAccessor = (instrument: WatchlistInstrumentVM, columnName: string) => {
        return instrument.tick ? instrument.tick.price : 0;
    }

    private _removeInstrument(instrumentVM: WatchlistInstrumentVM) {
        this.instrumentsVM = this.instrumentsVM.filter(vm => vm.instrument.symbol !== instrumentVM.instrument.symbol || vm.instrument.exchange !== instrumentVM.instrument.exchange);
        this._unsubscribeFromInstrumentTick(instrumentVM);
        const key = this.getKeyForInstrumentsPriceHistory(instrumentVM.instrument);

        if (this.intervals[key]) {
            clearInterval(this.intervals[key]);
        }

        if (this.isOrderBookVisible(instrumentVM.instrument)) {
            this.hideOrderBook(instrumentVM.instrument);
        }

        this.fireStateChanged();
    }

    private _subscribeOnInstrumentTick(instrumentVM: WatchlistInstrumentVM) {
        const subscription = this._realtimeService.subscribeToTicks(instrumentVM.instrument, (tick: ITick) => {
            this._updateWatchlistChartHistory(instrumentVM.instrument, tick.price);
            instrumentVM.handleTick(tick);
            this.instrumentsVM = [...this.instrumentsVM];
        });

        const hash = JsUtil.getInstrumentHash(instrumentVM.instrument);
        this._realtimeSubscriptions[hash] = subscription;
    }

    private _unsubscribeFromInstrumentTick(instrumentVM: WatchlistInstrumentVM) {
        const hash = JsUtil.getInstrumentHash(instrumentVM.instrument);
        const subscription = this._realtimeSubscriptions[hash];
        const key = this.getKeyForInstrumentsPriceHistory(instrumentVM.instrument);

        if (subscription) {
            subscription.unsubscribe();
            delete this._realtimeSubscriptions[hash];
        }

        if (this.instrumentsPriceHistory[key]) {
            delete this.instrumentsPriceHistory[key];
        }
    }

    showOrderBook(instrument: IInstrument) {
        if (this.isOrderBookVisible(instrument)) {
            return;
        }

        this._instrumentsOrderBookInfo.set(instrument, {
            buys: null,
            sells: null,
            buysTotal: 0,
            sellsTotal: 0,
            lastBar: null
        });

        const processLevels = (levels: ILevel2) => {
            const buys: any[] = [];
            const sells: any[] = [];
            let buysTotal = 0;
            let sellsTotal = 0;

            for (let i = 0; i < levels.buys.slice(0, 5).length; i++) {
                const level = levels.buys[i];
                buysTotal += level.volume;

                buys.push({
                    price: level.price,
                    amount: level.volume.toFixed(4),
                    total: buysTotal.toFixed(4)
                });
            }

            for (let i = 0; i < levels.sells.slice(0, 5).length; i++) {
                const level = levels.sells[i];
                sellsTotal += level.volume;

                sells.push({
                    price: level.price,
                    amount: level.volume.toFixed(4),
                    total: sellsTotal.toFixed(4)
                });
            }

            const info = this._instrumentsOrderBookInfo.get(instrument);

            info.sells = sells as any;
            info.buys = buys as any;
            info.sellsTotal = sellsTotal;
            info.buysTotal = buysTotal;
        };

        this._visibleOrderBooks.set(instrument, true);
        this._levels2Subscriptions.set(instrument, this._realtimeService.subscribeToL2(instrument, processLevels));

        const cachedLevels = this._realtimeService.getLastL2Ticks(instrument);

        if (cachedLevels) {
            processLevels(cachedLevels);
        }

        this._historyService.getHistoryByBackBarsCount({
            instrument: instrument,
            timeFrame: {interval: 1, periodicity: IPeriodicity.day},
            barsCount: 1,
            endDate: new Date()
        })
            .subscribe({
                next: (resp) => {
                    const lastBar = resp.data[0];
                    const info = this._instrumentsOrderBookInfo.get(instrument);

                    if (info) {
                        info.lastBar = lastBar;
                    }
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }

    hideOrderBook(instrument: IInstrument) {
        this._visibleOrderBooks.delete(instrument);
        this._instrumentsOrderBookInfo.delete(instrument);
        this._levels2Subscriptions.get(instrument).unsubscribe();
        this._levels2Subscriptions.delete(instrument);
    }

    isOrderBookVisible(instrument: IInstrument): boolean {
        return this._visibleOrderBooks.has(instrument);
    }

    hideAllOrderBooks() {
        this._visibleOrderBooks.forEach((v, instrument) => {
            this.hideOrderBook(instrument);
        });
    }

    handleToggleOrderBook(instrument: IInstrument, rowIndex: number) {
        if (this.isOrderBookVisible(instrument)) {
            this.hideOrderBook(instrument);
            this.dataTableComponent.collapseRow(rowIndex);
        } else {
            this.showOrderBook(instrument);
            this.dataTableComponent.expandRow(rowIndex);
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        Object.keys(this._realtimeSubscriptions).forEach((prop) => {
            this._realtimeSubscriptions[prop].unsubscribe();
        });

        for (let interval in this.intervals) {
            clearInterval(this.intervals[interval]);
        }
    }
}
