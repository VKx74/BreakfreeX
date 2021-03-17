import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { ITradeTick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, TimeInForce } from "../../../../models/models";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subscription } from "rxjs";
import { BrokerService } from "@app/services/broker.service";
import { finalize } from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { MatDialog } from '@angular/material/dialog';
import { OrderComponentSubmitHandler } from 'modules/Trading/components/trade-manager/order-configurator-modal/order-configurator-modal.component';
import { IBinanceFuturesPlaceOrderData } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import { EBrokerInstance } from '@app/interfaces/broker/broker';


export class BinanceFuturesOrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    price?: number;
    stopPrice?: number;
    tif?: TimeInForce;

    static createLimit(brokerType: EBrokerInstance): BinanceFuturesOrderConfig {
        const order = this.create(brokerType);
        order.type = OrderTypes.Limit;
        return order;
    }

    static createMarket(brokerType: EBrokerInstance): BinanceFuturesOrderConfig {
        const order = this.create(brokerType);
        order.type = OrderTypes.Market;
        return order;
    }

    private static create(brokerType: EBrokerInstance): BinanceFuturesOrderConfig {
        return {
            instrument: null,
            side: OrderSide.Buy,
            amount: brokerType === EBrokerInstance.BinanceFuturesCOIN ? 1 : 0.1,
            type: OrderTypes.Market,
            tif: TimeInForce.GoodTillCancel
        };
    }
}


@Component({
    selector: 'binance-futures-order-configurator',
    templateUrl: './binance-futures-order-configurator.component.html',
    styleUrls: ['./binance-futures-order-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
    ]
})
export class BinanceFuturesOrderConfiguratorComponent implements OnInit {
    private _config: BinanceFuturesOrderConfig;
    private marketSubscription: Subscription;
    OrderTypes = OrderTypes;

    @Input() submitHandler: OrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();
    @Output() onOrderPlaced = new EventEmitter<any>();
    @Output() onInstrumentSelected = new EventEmitter<string>();

    @Input()
    set config(value: BinanceFuturesOrderConfig) {
        if (value) {
            this._config = value;
        }
    }

    get config(): BinanceFuturesOrderConfig {
        return this._config;
    }

    minAmountValue: number = 0.01;
    minPriceValue: number = 0.000001;
    priceStep: number = 0.00001;
    amountStep: number = 0.01;
    decimals: number = 5;
    lastTick: ITradeTick = null;
    allowedOrderTypes: OrderTypes[] = [OrderTypes.Limit, OrderTypes.Market, OrderTypes.Stop, OrderTypes.TakeProfit, OrderTypes.StopMarket, OrderTypes.TakeProfitMarket];
    allowedTIFTypes: TimeInForce[] = [TimeInForce.GoodTillCancel, TimeInForce.FillOrKill, TimeInForce.ImmediateOrCancel, TimeInForce.GoodTillCrossing, TimeInForce.GoodTillExpiredOrCanceled];
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
            this.amountStep = this._brokerService.activeBroker.instanceType === EBrokerInstance.BinanceFuturesCOIN ? 1 : 0.1;
            this._config = BinanceFuturesOrderConfig.createMarket(this._brokerService.activeBroker.instanceType);
    }

    ngOnInit() {
        if (this.config.instrument) {
            this._selectInstrument(this.config.instrument, false);
        }
    }

    ngAfterViewInit() {
    }

    @bind
    @memoize({ primitive: true })
    orderTypeStr(type: OrderTypes): Observable<string> {
        const _map = {
            [OrderTypes.Market]: 'tradeManager.orderType.market',
            [OrderTypes.Limit]: 'tradeManager.orderType.limit',
            [OrderTypes.Stop]: 'tradeManager.orderType.stop',
            [OrderTypes.StopLimit]: 'tradeManager.orderType.stopLimit',
            [OrderTypes.LimitMaker]: 'tradeManager.orderType.limitMaker',
            [OrderTypes.Liquidation]: 'tradeManager.orderType.liquidation',
            [OrderTypes.StopLoss]: 'tradeManager.orderType.stopLoss',
            [OrderTypes.StopLossLimit]: 'tradeManager.orderType.stopLossLimit',
            [OrderTypes.StopMarket]: 'tradeManager.orderType.stopMarket',
            [OrderTypes.TakeProfit]: 'tradeManager.orderType.takeProfit',
            [OrderTypes.TakeProfitLimit]: 'tradeManager.orderType.takeProfitLimit',
            [OrderTypes.TakeProfitMarket]: 'tradeManager.orderType.takeProfitMarket',
            [OrderTypes.TrailingStopMarket]: 'tradeManager.orderType.trailingStopMarket',
        };

        return this._translateService.stream(_map[type]);
    }

    @bind
    @memoize({ primitive: true })
    orderTIFStr(type: TimeInForce): Observable<string> {
        const _map = {
            [TimeInForce.FillOrKill]: 'tradeManager.timeInForceType.fillOrKill',
            [TimeInForce.GoodTillCancel]: 'tradeManager.timeInForceType.goodTillCancel',
            [TimeInForce.GoodTillCrossing]: 'tradeManager.timeInForceType.goodTillCrossing',
            [TimeInForce.GoodTillExpiredOrCanceled]: 'tradeManager.timeInForceType.goodTillExpiredOrCanceled',
            [TimeInForce.ImmediateOrCancel]: 'tradeManager.timeInForceType.immediateOrCancel'
        };

        return this._translateService.stream(_map[type]);
    }

    isBuyMode() {
        return this.config.side === OrderSide.Buy;
    }

    isPriceRequired() {
        return this.config.type === OrderTypes.Limit || this.config.type === OrderTypes.Stop || this.config.type === OrderTypes.TakeProfit;
    }

    isStopPriceRequired() {
        return this.config.type === OrderTypes.Stop || this.config.type === OrderTypes.TakeProfit || this.config.type === OrderTypes.StopMarket || this.config.type === OrderTypes.TakeProfitMarket;
    }

    isTimeInForceRequired() {
        return this.config.type === OrderTypes.Limit;
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    handleTypeSelected(type: OrderTypes) {
        this.config.type = type;
    }

    handleTIFSelected(type: TimeInForce) {
        this.config.tif = type;
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
        const placeOrderData: IBinanceFuturesPlaceOrderData = {
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Type: this.config.type
        };

        if (this.isPriceRequired()) {
            placeOrderData["Price"] = Number(this.config.price);
        }

        if (this.isStopPriceRequired()) {
            placeOrderData["StopPrice"] = Number(this.config.stopPrice);
        }

        if (this.isTimeInForceRequired()) {
            placeOrderData["TimeInForce"] = this.config.tif;
        }

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
