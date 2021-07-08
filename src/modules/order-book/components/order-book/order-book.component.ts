import {Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {IInstrument} from "app/models/common/instrument";
import {InstrumentService} from "app/services/instrument.service";
import {EExchange} from "app/models/common/exchange";
import {Subscription} from 'rxjs';
import {RealtimeService} from "app/services/realtime.service";
import {ILevel2, ITick} from "app/models/common/tick";
import {ESide} from "app/models/common/side";
import {TranslateService} from "@ngx-translate/core";
import {OrderBookTranslateService} from "../../localization/token";
import {LocalizationService} from "Localization";
import {Actions, LinkingAction} from "../../../Linking/models";
import {ComponentIdentifier} from "@app/models/app-config";
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";
import {GoldenLayoutItemState} from "angular-golden-layout";

export interface IOrderBookComponentState {
    activeInstrument: IInstrument;
    orderMode: OrderMode;
    precision: number;
}

class LevelPrice {
    public price: number;
    public amount: number;
    public total: number;
}

export const OrderMode = {
    BOTH: <OrderMode>'orderBoth',
    BUY: <OrderMode>'orderBuy',
    SELL: <OrderMode>'orderSell',
};
export type OrderMode = 'orderBoth' | 'orderBuy' | 'orderSell';

@Component({
    selector: 'order-book',
    templateUrl: 'order-book.component.html',
    styleUrls: ['order-book.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: OrderBookTranslateService
        }
    ]
})
export class OrderBookComponent extends BaseGoldenLayoutItemComponent {
    static componentName = 'Order Book';
    static previewImgClass = 'crypto-icon-ob';
    public readonly supportedPrecisions: number[] = [1, 0.1, 0.01, 0.001, 0.0001];
    private level2Subscription: Subscription;
    private marketSubscription: Subscription;
    private _scrollNeeded = false;

    @ViewChild('tableWrapper', {static: false}) tableWrapper: ElementRef;

    get OrderMode() {
        return OrderMode;
    }

    activeInstrument: IInstrument;

    private _orderMode: OrderMode;
    public get orderMode(): OrderMode {
        return this._orderMode;
    }

    public set orderMode(value: OrderMode) {
        this._orderMode = value;
        this._scrollNeeded = true;
    }

    totalAmountPrecision: number;
    buyLevels: LevelPrice[];
    sellLevels: LevelPrice[];
    baseCurrency: string;
    dependCurrency: string;
    buyTotalAmount = 0;
    sellTotalAmount = 0;
    spread = 0;
    lastMarketPrice = 0;
    lastMarketCost = 0;
    lastTickSide = ESide.sell;
    pricePecision = 0;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(@Optional() @Inject(GoldenLayoutItemState) protected _state: IOrderBookComponentState,
                private _instrumentService: InstrumentService,
                private _translateService: TranslateService,
                private _localizationService: LocalizationService,
                private _realtimeService: RealtimeService,
                protected _injector: Injector) {

        super(_injector);

        this.sellLevels = [];
        this.buyLevels = [];
        this.baseCurrency = '';
        this.dependCurrency = '';
        this.orderMode = OrderMode.BOTH;
        this.totalAmountPrecision = 4;

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
                    let activeInstrument = values[0];

                    this._selectInstrument(activeInstrument);
                    this.fireStateChanged();
                }
            });
        }
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
        if (precision !== this.pricePecision) {
            this.fireStateChanged();
        }
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

        this.buyLevels = [];
        this.sellLevels = [];
        this.buyTotalAmount = 0;
        this.sellTotalAmount = 0;
        this.spread = 0;
        this.lastMarketPrice = 0;
        this.lastMarketCost = 0;
        this.baseCurrency = instrument.baseInstrument;
        this.dependCurrency = instrument.dependInstrument;
        this.pricePecision = instrument.pricePrecision;

        if (this.level2Subscription) {
            this.level2Subscription.unsubscribe();
        }

        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

        this._scrollNeeded = true;

        const cachedL2 = this._realtimeService.getLastL2Ticks(this.activeInstrument);

        if (cachedL2) {
            this._processL2(cachedL2);
        }

        this.level2Subscription = this._realtimeService.subscribeToL2(this.activeInstrument, (levels: ILevel2) => {
            this._processL2(levels);
        });

        this.marketSubscription = this._realtimeService.subscribeToTicks(this.activeInstrument, (tick: ITick) => {
            this.lastMarketPrice = tick.price;
            this.lastMarketCost = tick.price * tick.volume;
            this.lastTickSide = tick.side;
        });
    }

    private _processL2(levels: ILevel2) {
        this.buyLevels = [];
        this.sellLevels = [];

        this.buyTotalAmount = 0;
        for (let i = 0; i < levels.buys.length; i++) {
            const level = levels.buys[i];
            this.buyTotalAmount += level.volume;
            this.buyLevels.push({
                price: level.price,
                amount: level.volume,
                total: this.buyTotalAmount
            });
        }

        this.sellTotalAmount = 0;
        for (let i = 0; i < levels.sells.length; i++) {
            const level = levels.sells[i];
            this.sellTotalAmount += level.volume;
            this.sellLevels.unshift({
                price: level.price,
                amount: level.volume,
                total: this.sellTotalAmount
            });
        }

        if (levels.buys.length && levels.sells.length) {
            this.spread = Math.abs(levels.buys[0].price - levels.sells[0].price);
        } else {
            this.spread = 0;
        }
    }

    loadState(state: IOrderBookComponentState) {
        if (!state || !state.activeInstrument || !state.activeInstrument.symbol) {
            return;
        }

        this.orderMode = state.orderMode;
        this.totalAmountPrecision = state.precision;
        this._selectInstrument(state.activeInstrument);
    }

    protected getComponentState(): any {
        return {
            activeInstrument: this.activeInstrument,
            orderMode: this.orderMode,
            precision: this.totalAmountPrecision
        };
    }

    buyLevelPercentageAmount(level: LevelPrice) {
        return (level.amount / this.buyTotalAmount * 100).toString() + '%';
    }

    sellLevelPercentageAmount(level: LevelPrice) {
        return (level.amount / this.sellTotalAmount * 100).toString() + '%';
    }

    trackBySell(index, item) {
        return index;
    }

    trackByBuy(index, item) {
        return index;
    }

    setOrderMode(mode: OrderMode) {
        this.orderMode = mode;
    }


    ngAfterViewChecked() {
        this._scrollCenter();
    }

    private _scrollCenter() {
        if (!this._scrollNeeded || !this.buyLevels.length || !this.sellLevels.length) {
            return false;
        }

        let scrollMargin = 0;

        if (this.orderMode === OrderMode.BOTH) {
            scrollMargin = (this.tableWrapper.nativeElement.scrollHeight / 2) - this.tableWrapper.nativeElement.clientHeight / 2;
        }

        if (!Number.isNaN(scrollMargin)) {
            this._scrollNeeded = false;
            $(this.tableWrapper.nativeElement).stop().animate({scrollTop: scrollMargin}, 100, 'swing');
        }
    }

    ngOnDestroy() {
      super.ngOnDestroy();

        if (this.level2Subscription) {
            this.level2Subscription.unsubscribe();
        }

        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
    }
}
