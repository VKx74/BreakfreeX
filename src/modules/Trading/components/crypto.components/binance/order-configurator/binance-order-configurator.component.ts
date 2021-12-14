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
import { BinanceBroker } from '@app/services/binance/binance.broker';
import { BinanceOrderConfigurationChecklist } from '../../common/binance-order-configuration-checklist';
import { BinanceFuturesBroker } from '@app/services/binance-futures/binance-futures.broker';

// stopPrice - Used with STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, and TAKE_PROFIT_LIMIT orders.
// icebergQty - Used with LIMIT, STOP_LOSS_LIMIT, and TAKE_PROFIT_LIMIT to create an iceberg order.
export class BinanceOrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    price?: number;
    stopPrice?: number;
    stopLimitPrice?: number;
    icebergQty?: number;
    tif?: TimeInForce;
    useIcebergQty?: boolean;
    timeframe?: number;
    lastPrice?: number;
    sl?: number;
    tp?: number;
    reduceOnly?: boolean;

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
            amount: 0.01,
            type: OrderTypes.Market,
            tif: TimeInForce.GoodTillCancel
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
export class BinanceOrderConfiguratorComponent extends BinanceOrderConfigurationChecklist implements OnInit {
    private _config: BinanceOrderConfig = BinanceOrderConfig.createMarket();
    private marketSubscription: Subscription;

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

    get broker(): BinanceBroker | BinanceFuturesBroker {
        return this._brokerService.activeBroker as any;
    }
    get dialog(): MatDialog {
        return this._dialog;
    }

    minAmountValue: number = 0.01;
    minPriceValue: number = 0.000001;
    priceStep: number = 0.00001;
    amountStep: number = 0.0001;
    decimals: number = 5;
    allowedOrderTypes: OrderTypes[] = [OrderTypes.Limit, OrderTypes.Market, OrderTypes.StopLoss, OrderTypes.StopLossLimit, OrderTypes.TakeProfit, OrderTypes.TakeProfitLimit, OrderTypes.LimitMaker, OrderTypes.OCO];
    allowedTIFTypes: TimeInForce[] = [TimeInForce.GoodTillCancel, TimeInForce.FillOrKill, TimeInForce.ImmediateOrCancel, TimeInForce.GoodTillCrossing];
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
        super();
        this._config = BinanceOrderConfig.createMarket();
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
            [OrderTypes.OCO]: 'tradeManager.orderType.ocoOrder'
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
        return this.config.type === OrderTypes.Limit || this.config.type === OrderTypes.StopLossLimit || 
            this.config.type === OrderTypes.TakeProfitLimit || this.config.type === OrderTypes.LimitMaker || 
            this.config.type === OrderTypes.OCO;
    }

    isStopPriceRequired() {
        return this.config.type === OrderTypes.StopLoss || this.config.type === OrderTypes.StopLossLimit || 
            this.config.type === OrderTypes.TakeProfitLimit || this.config.type === OrderTypes.TakeProfit || 
            this.config.type === OrderTypes.OCO;
    } 
    
    isStopLimitPriceRequired() {
        return this.config.type === OrderTypes.OCO;
    }

    isIcebergQtyAllowed() {
        return this.config.type === OrderTypes.Limit || this.config.type === OrderTypes.StopLossLimit || this.config.type === OrderTypes.TakeProfitLimit;
    }

    isTimeInForceRequired() {
        return this.config.type === OrderTypes.Limit || this.config.type === OrderTypes.StopLossLimit || this.config.type === OrderTypes.TakeProfitLimit || this.config.type === OrderTypes.OCO;
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    handleTypeSelected(type: OrderTypes) {
        this.config.type = type;
        this._raiseCalculateChecklist();
    }

    handleTIFSelected(type: TimeInForce) {
        this.config.tif = type;
    }   
    
    isSLAndTPAllowed() {
        return this.config.type === OrderTypes.Market || this.config.type === OrderTypes.Limit;
    }

    isReduceOnlyAllowed() {
        return this.config.type !== OrderTypes.Market && this.config.type !== OrderTypes.Limit;
    }

    valueChanged() {
        this._raiseCalculateChecklist();
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

        if (this.config.amount < this.minAmountValue) {
            this.config.amount = this.minAmountValue;
        }

        if (instrument) {
            if (resetPrice) {
                this._config.price = 0;
            }

            this.checklistItems = [];
            this._setCalculatingChecklistStatus(true);
            this._recalculatePossible = true;
            this._wrongInstrumentShown = false;

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

    private _placeOrder() {
        if (!this.config.instrument) {
            this._alertService.info("Select instrument");
            return;
        }

        const broker = this._brokerService.activeBroker as BinanceBroker;
        const placeOrderData = {
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
        
        if (this.isStopLimitPriceRequired()) {
            placeOrderData["StopLimitPrice"] = Number(this.config.stopLimitPrice);
        }

        if (this.isTimeInForceRequired()) {
            placeOrderData["TimeInForce"] = this.config.tif;
        }

        if (this.isIcebergQtyAllowed() && this.config.useIcebergQty && this.config.icebergQty) {
            placeOrderData["IcebergQty"] = Number(this.config.icebergQty);
        }

        if (this.isSLAndTPAllowed()) {
            placeOrderData["SL"] = this.config.sl;
            placeOrderData["TP"] = this.config.tp;
        }
        
        if (this.isReduceOnlyAllowed() && this.config.reduceOnly) {
            placeOrderData["ReduceOnly"] = true;
        }

        this.processingSubmit = true;
        (this.config.type === OrderTypes.OCO ? broker.placeOCOOrder(placeOrderData) : broker.placeOrder(placeOrderData))
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
        this._raiseCalculateChecklist();
    }

    setSellMode() {
        this.config.side = OrderSide.Sell;
        this._raiseCalculateChecklist();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
    }
}
