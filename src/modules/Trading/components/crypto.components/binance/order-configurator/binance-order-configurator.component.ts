import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { ITradeTick, ITick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType, OrderTradeType, OrderPlacedFrom, RiskClass } from "../../../../models/models";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subject, Subscription } from "rxjs";
import { BrokerService } from "@app/services/broker.service";
import { finalize } from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { MatDialog } from '@angular/material/dialog';
import { OrderComponentSubmitHandler } from 'modules/Trading/components/trade-manager/order-configurator-modal/order-configurator-modal.component';


export class BinanceOrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    // fillPolicy?: OrderFillPolicy;
    // expirationType?: OrderExpirationType;
    // expirationDate?: number;
    price?: number; // Limit price
    sl?: number; // Stop price
    tp?: number; // Stop price
    // comment?: string; // Stop price
    // timeframe?: number;
    // tradeType?: OrderTradeType;
    // placedFrom?: OrderPlacedFrom;

    static createLimit(): BinanceOrderConfig {
        const order = this.create();
        order.type = OrderTypes.Limit;
        return order;
    }

    static createMarket(): BinanceOrderConfig {
        const order = this.create();
        order.type = OrderTypes.Market;
        return order;
    }

    private static create(): BinanceOrderConfig {
        return {
            instrument: null,
            side: OrderSide.Buy,
            amount: 0.1,
            type: OrderTypes.Market,
            // expirationType: OrderExpirationType.GTC,
            // fillPolicy: OrderFillPolicy.IOC
        };
    }
}


@Component({
    selector: 'binance-order-configurator',
    templateUrl: './binance-order-configurator.component.html',
    styleUrls: ['./binance-order-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
    ]
})
export class BinanceOrderConfiguratorComponent implements OnInit {
    private _config: BinanceOrderConfig = BinanceOrderConfig.createMarket();
    private marketSubscription: Subscription;
    private technicalComment: string;

    @Input() submitHandler: OrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();
    @Output() onOrderPlaced = new EventEmitter<any>();
    @Output() onInstrumentSelected = new EventEmitter<string>();
    @Input()
    set config(value: BinanceOrderConfig) {
        if (value) {
            this._config = value;
        }
    }

    get config(): BinanceOrderConfig {
        return this._config;
    }

    minAmountValue: number = 0.01;
    minPriceValue: number = 0.000001;
    priceStep: number = 0.00001;
    amountStep: number = 0.01;
    decimals: number = 5;
    lastTick: ITradeTick = null;
    allowedOrderTypes: OrderTypes[] = [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];
    orderFillPolicies: OrderFillPolicy[] = [OrderFillPolicy.FF, OrderFillPolicy.FOK, OrderFillPolicy.IOC];
    expirationTypes: OrderExpirationType[] = [OrderExpirationType.GTC, OrderExpirationType.Specified, OrderExpirationType.Today];
    processingSubmit: boolean;

    get instrumentSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {
            return this._brokerService.getInstruments(e, s);
        };
    }

    constructor(private _dialog: MatDialog,
        private _alertService: AlertService,
        private _translateService: TranslateService,
        private _brokerService: BrokerService) {
        // this._config = MTOrderConfig.createMarket(this._brokerService.activeBroker.instanceType);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    @bind
    @memoize({ primitive: true })
    orderTypeStr(type: OrderTypes): Observable<string> {
        const _map = {
            [OrderTypes.Market]: 'tradeManager.market',
            [OrderTypes.Limit]: 'tradeManager.limit',
            [OrderTypes.Stop]: 'tradeManager.stop',
            [OrderTypes.StopLimit]: 'tradeManager.stopLimit'
        };

        return this._translateService.stream(_map[type]);
    }

    isBuyMode() {
        return this.config.side === OrderSide.Buy;
    }

    isPriceVisible() {
        return this.config.type === OrderTypes.Limit || this.config.type === OrderTypes.Stop;
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    handleTypeSelected(type: OrderTypes) {
        this.config.type = type;
    }

    private _selectInstrument(instrument: IInstrument, resetPrice = true) {
        this.lastTick = null;
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

        this.config.instrument = instrument;
        const broker = this._brokerService.activeBroker;
        const symbol = instrument.symbol;

        this.amountStep = broker.instrumentAmountStep(symbol);
        this.minAmountValue = broker.instrumentMinAmount(symbol);
        this.priceStep = broker.instrumentTickSize(symbol);
        this.minPriceValue = broker.instrumentTickSize(symbol);
        this.decimals = broker.instrumentDecimals(symbol);

        if (instrument) {
            if (resetPrice) {
                this._config.price = 0;
                this._config.sl = null;
                this._config.tp = null;
            }

            broker.getPrice(symbol).subscribe((tick: ITradeTick) => {
                if (!tick || tick.symbol !== this.config.instrument.symbol) {
                    return;
                }
                this._setTick(tick);
            });

            this.marketSubscription = broker.subscribeToTicks(symbol, (tick: ITradeTick) => {
                if (tick.symbol !== this.config.instrument.symbol) {
                    return;
                }

                this._setTick(tick);
            });

            this.onInstrumentSelected.emit(symbol);
        }
    }

    submit() {
        if (this.submitHandler) {
            this.submitHandler(this.config);
            this.onSubmitted.emit();
        } else {
            this._placeOrder();
        }
    }

    private _setTick(tick: ITradeTick) {
        this.lastTick = tick;
        const price = this._config.side === OrderSide.Buy ? tick.ask : tick.bid;

        if (tick && !this._config.price) {
            this._config.price = price;
        }
    }

    private _placeOrder() {
        if (!this.config.instrument) {
            this._alertService.info("Select instrument");
            return;
        }

        const broker = this._brokerService.activeBroker;
        // let comment = (this.technicalComment || "") + (this.config.comment || "");
        const placeOrderData = {
            // Comment: comment,
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Type: this.config.type,
            Price: this.config.type !== OrderTypes.Market ? Number(this.config.price) : 0,
            SL: this.config.sl ? Number(this.config.sl) : 0,
            TP: this.config.tp ? Number(this.config.tp) : 0,
            // FillPolicy: this.config.fillPolicy,
            // ExpirationType: this.config.expirationType,
            // ExpirationDate: this._getSetupDate(),
            // PlacedFrom: this.config.placedFrom,
            // Timeframe: this.config.timeframe,
            // TradeType: this.config.tradeType
        };

        this.processingSubmit = true;
        broker.placeOrder(placeOrderData)
            .pipe(finalize(() => {
            }))
            .subscribe(value => {
                this.processingSubmit = false;
                if (value.result) {
                    this._alertService.success("Order sent");
                    this.onOrderPlaced.emit(placeOrderData);
                    this.onSubmitted.emit();
                } else {
                    this._alertService.error(value.msg);
                }
            }, error => {
                this.processingSubmit = false;
                this._alertService.error(error);
            });
    }

    setBuyMode() {
        this.config.side = OrderSide.Buy;
    }

    setSellMode() {
        this.config.side = OrderSide.Sell;
    }

    ngOnDestroy() {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
    }
}
