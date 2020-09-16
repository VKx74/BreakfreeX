import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { ITick, IMT5Tick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType } from "../../../../models/models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subscription } from "rxjs";
import { RealtimeService } from "@app/services/realtime.service";
import { BrokerService } from "@app/services/broker.service";
import { distinctUntilChanged, finalize, takeUntil } from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { JsUtil } from "../../../../../../utils/jsUtil";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { floatNumberRangeValidator } from "Validators";
import { OandaBrokerService } from '@app/services/oanda.exchange/oanda.broker.service';
import { IForexPlaceOrderAction } from 'modules/Trading/models/forex/forex.models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { MT5PlaceOrder } from 'modules/Trading/models/forex/mt/mt.models';

export class MT5OrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    fillPolicy: OrderFillPolicy;
    expirationType: OrderExpirationType;
    expirationDate?: number;
    price?: number; // Limit price
    sl?: number; // Stop price
    tp?: number; // Stop price
    useSL: boolean; // Stop price
    useTP: boolean; // Stop price
    comment?: string; // Stop price

    static create(): MT5OrderConfig {
        return {
            instrument: null,
            side: OrderSide.Buy,
            amount: 1,
            type: OrderTypes.Market,
            useSL: false,
            useTP: false,
            expirationType: OrderExpirationType.GTC,
            fillPolicy: OrderFillPolicy.IOC
        };
    }
}

export type MT5OrderComponentSubmitHandler = (config: MT5OrderConfig) => void;

@Component({
    selector: 'mt5-order-configurator',
    templateUrl: './mt5-order-configurator.component.html',
    styleUrls: ['./mt5-order-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
    ]
})
export class MT5OrderConfiguratorComponent implements OnInit {
    private _config: MT5OrderConfig = MT5OrderConfig.create();
    private _oneDayPlus = new Date(new Date().getTime() + (1000 * 24 * 60 * 60));
    private _selectedTime: string = `${this._oneDayPlus.getUTCHours()}:${this._oneDayPlus.getUTCMinutes()}`;
    private _selectedDate: Date = this._oneDayPlus;
    private marketSubscription: Subscription;

    @Input()
    set config(value: MT5OrderConfig) {
        if (value) {
            this._config = value;

            if (this._config.expirationDate) {
                this._selectedDate = new Date(this._config.expirationDate);
                this._selectedTime = `${this._selectedDate.getUTCHours()}:${this._selectedDate.getUTCMinutes()}`;
            }
        }
    }
    
    get config(): MT5OrderConfig {
        return this._config;
    }

    @Input() submitHandler: MT5OrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();

    set selectedTime(value: string) {
        if (value) {
            this._selectedTime = value;
        }
    }
    get selectedTime(): string {
        return this._selectedTime;
    } 
    
    set selectedDate(value: Date) {
        if (value) {
            this._selectedDate = value;
        }
    }
    get selectedDate(): Date {
        return this._selectedDate;
    }

    minAmountValue: number = 0.01;
    minPriceValue: number = 0.000001;
    priceStep: number = 0.00001;
    amountStep: number = 0.01;
    decimals: number = 5;

    lastTick: IMT5Tick;
    allowedOrderTypes: OrderTypes[] = [];
    orderFillPolicies: OrderFillPolicy[] = [OrderFillPolicy.FF, OrderFillPolicy.FOK, OrderFillPolicy.IOC];
    expirationTypes: OrderExpirationType[] = [OrderExpirationType.GTC, OrderExpirationType.Specified, OrderExpirationType.Today];
    processingSubmit: boolean;

    get instrumentSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {
            return this._brokerService.getInstruments(e, s);
        };
    }

    constructor(private _alertService: AlertService,
        private _translateService: TranslateService,
        private _brokerService: BrokerService) {
    }

    ngOnInit() {
        this.allowedOrderTypes = [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];

        if (!this.config.instrument) {
            this._brokerService.getInstruments().subscribe({
                next: (value: IInstrument[]) => {
                    if (value && value.length) {
                        this._selectInstrument(value[0]);
                    }
                },
                error: (e) => {
                    console.error('Failed to load instrument', e);
                }
            });
        }
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

    isExpirationVisible() {
        return this.config.expirationType === OrderExpirationType.Specified;
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    handleTypeSelected(type: OrderTypes) {
        this.config.type = type;

        if (this.config.type === OrderTypes.Market) {
            this.config.fillPolicy = OrderFillPolicy.IOC;
        } else {
            this.config.fillPolicy = OrderFillPolicy.FF;
        }
    }

    handleExpirationTypeSelected(type: OrderExpirationType) {
        this.config.expirationType = type;
    }

    handleFillPolicySelected(type: OrderFillPolicy) {
        this.config.fillPolicy = type;
    }

    private _selectInstrument(instrument: IInstrument) {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
        console.log(instrument);

        this.config.instrument = instrument;
        const broker = this._brokerService.activeBroker as MT5Broker;
        const symbol = instrument.symbol;

        this.amountStep = broker.instrumentAmountStep(symbol);
        this.minAmountValue = broker.instrumentMinAmount(symbol);
        this.priceStep = broker.instrumentTickSize(symbol);
        this.minPriceValue = broker.instrumentTickSize(symbol);
        this.decimals = broker.instrumentDecimals(symbol);

        if (instrument) {
            this._config.price = 0;
            this.marketSubscription = broker.subscribeToTicks(symbol, (tick: IMT5Tick) => {
                this.lastTick = tick;
                const price = this._config.side === OrderSide.Buy ? tick.ask : tick.bid;

                if (tick && !this._config.price) {
                    this._config.price = price;
                }
                if (tick && !this._config.sl) {
                    this._config.sl = price;
                }
                if (tick && !this._config.tp) {
                    this._config.tp = price;
                }
            });
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

    private _getSetupDate(): number {
        if (this.config.expirationType !== OrderExpirationType.Specified) {
            return 0;
        }

        const hourMin = this._selectedTime.split(":");
        let h = hourMin[0];
        let m = hourMin[1];

        if (h.length === 1) {
            h = `0${h}`;
        }
        if (m.length === 1) {
            m = `0${m}`;
        }

        const dateString = this._selectedDate.toISOString().split("T")[0];
        const timeString = `${h}:${m}:00.500Z`;
        const exp = new Date(`${dateString}T${timeString}`).getTime() / 1000;
        return Math.roundToDecimals(exp, 0);
    }

    private _placeOrder() {
        const broker = this._brokerService.activeBroker as MT5Broker;
        const placeOrderData: MT5PlaceOrder = {
            Comment: this.config.comment || "",
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Type: this.config.type,
            Price: this.config.type !== OrderTypes.Market ? this.config.price : 0,
            SL: this.config.useSL ? this.config.sl : 0,
            TP: this.config.useTP ? this.config.tp : 0,
            FillPolicy: this.config.fillPolicy,
            ExpirationType: this.config.expirationType,
            ExpirationDate: this._getSetupDate()
        };

        // if (this.config.type === OrderTypes.Market) {
        //     placeOrderData.Price = placeOrderData.Side === OrderSide.Buy ? this.lastTick.ask : this.lastTick.bid;
        // }

        this.processingSubmit = true;
        broker.placeOrder(placeOrderData)
            .pipe(finalize(() => {
            }))
            .subscribe(value => {
                this.processingSubmit = false;
                if (value.result) {
                    this._alertService.success("Order sent");
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
