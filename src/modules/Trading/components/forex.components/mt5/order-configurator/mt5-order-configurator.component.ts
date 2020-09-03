import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { ITick } from "@app/models/common/tick";
import { OrderSide, OrderTypes } from "../../../../models/models";
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

export class MT5OrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
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
            useTP: false
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
    private marketSubscription: Subscription;

    @Input()
    set config(value: MT5OrderConfig) {
        if (value) {
            this._config = value;
        }
    }
    get config(): MT5OrderConfig {
        return this._config;
    }

    @Input() submitHandler: MT5OrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();

    minAmountValue: number = 0.0001;
    minPriceValue: number = 0.0001;
    priceStep: number = 0.00001;
    amountStep: number = 0.00001;
    lastTick: ITick;
    allowedOrderTypes: OrderTypes[] = [];
    processingSubmit: boolean;

    get instrumentSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {
            return this._brokerService.getInstruments(e, s);
        };
    }

    constructor(private _realtimeService: RealtimeService,
        private _alertService: AlertService,
        private _translateService: TranslateService,
        private _brokerService: BrokerService) {
    }

    ngOnInit() {
        const broker: OandaBrokerService = this._brokerService.activeBroker as OandaBrokerService;

        this.allowedOrderTypes = broker
            ? JsUtil.stringEnumToArray<OrderTypes>(OrderTypes).filter((t) => broker.supportedOrderTypes.indexOf(t) !== -1)
            : [];


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

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    handleTypeSelected(type: OrderTypes) {
        this.config.type = type;
    }

    private _selectInstrument(instrument: IInstrument) {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
        console.log(instrument);

        this.config.instrument = instrument;

        if (instrument) {
            this.lastTick = this._realtimeService.getLastTick(instrument);
            this.marketSubscription = this._realtimeService.subscribeToTicks(instrument, (tick: ITick) => {
                this.lastTick = tick;

                if (tick && !this._config.price) {
                    this._config.price = tick.price;
                }
                if (tick && !this._config.sl) {
                    this._config.sl = tick.price;
                }
                if (tick && !this._config.tp) {
                    this._config.tp = tick.price;
                }
            });
        }
    }

    private _handleOrderTypeChanged(type: OrderTypes) {
        // const controls = this.form.controls;
        // const limitControl = controls['limitPrice'];
        // const stopControl = controls['stopPrice'];

        // if (this._useLimitPrice(type)) {
        //     limitControl.enable();
        // } else {
        //     limitControl.disable();
        // }

        // if (this._useStopPrice(type)) {
        //     stopControl.enable();
        // } else {
        //     stopControl.disable();
        // }
    }

    submit() {
        if (this.submitHandler) {
            this.submitHandler(this.config);
            this.onSubmitted.emit();
        } else {
            this._placeOrder(this.config);
        }
    }

    private _placeOrder(config: MT5OrderConfig) {
        // const broker = this._brokerService.activeBroker as OandaBrokerService;
        // const placeOrderData: IForexPlaceOrderAction = {
        //     // symbol: config.instrument.symbol,
        //     symbol: config.instrument.id,
        //     side: config.side,
        //     size: config.amount,
        //     type: config.type,
        //     price: config.price || config.stopPrice
        // };

        // this.processingSubmit = true;
        // broker.placeOrder(placeOrderData)
        //     .pipe(finalize(() => {
        //         this.processingSubmit = false;
        //         this.onSubmitted.emit();
        //     }))
        //     .subscribe(value => {
        //         if (value.result) {
        //             this._alertService.success(this._translateService.get('tradeManager.orderPlaced'));
        //         } else {
        //             this._alertService.error(value.msg);
        //         }
        //     }, error => {
        //         this._alertService.error(error.message);
        //     });
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
