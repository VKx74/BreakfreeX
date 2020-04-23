import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../localization/token";
import { ITick } from "@app/models/common/tick";
import { OrderSide, OrderTypes } from "../../../models/models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subscription } from "rxjs";
import { RealtimeService } from "@app/services/realtime.service";
import { BrokerService } from "@app/services/broker.service";
import { distinctUntilChanged, finalize, takeUntil } from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { componentDestroyed } from "@w11k/ngx-componentdestroyed";
import { JsUtil } from "../../../../../utils/jsUtil";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { floatNumberRangeValidator } from "Validators";
import { OandaBrokerService } from '@app/services/oanda.exchange/oanda.broker.service';
import { IForexPlaceOrderAction } from 'modules/Trading/models/forex/forex.models';

export class OrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    price?: number; // Limit price
    stopPrice?: number; // Stop price

    static create(): OrderConfig {
        return {
            instrument: null,
            side: OrderSide.Buy,
            amount: 0.00,
            type: null,
            price: 0.00,
            stopPrice: 0.00
        };
    }
}

export type OrderComponentSubmitHandler = (config: OrderConfig) => void;

@Component({
    selector: 'forex-order-configurator',
    templateUrl: './forex-order-configurator.component.html',
    styleUrls: ['./forex-order-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
    ]
})
export class ForexOrderConfiguratorComponent implements OnInit {
    @Input()
    set config(value: OrderConfig) {
        this._config = value;
    }
    get config(): OrderConfig {        
        return this._config;
    }
    @Input() submitHandler: OrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();

    minAmountValue: number = 0.0001;
    minPriceValue: number = 0.0001;

    private _config: OrderConfig = OrderConfig.create();
    private marketSubscription: Subscription;
    lastTick: ITick;
    form: FormGroup;
    baseCurrency: string = '';
    dependCurrency: string = '';
    allowedOrderTypes: OrderTypes[] = [];
    processingSubmit: boolean;

    get inputQtyCurrency(): string {
        return this.baseCurrency;
    }

    get inputStopCurrency(): string {
        return this.baseCurrency;
    }

    get inputLimitCurrency(): string {
        return this.baseCurrency;
    }

    get orderRusultCurrency(): string {
        return this.dependCurrency;
    }

    get instrument(): IInstrument {
        return this.form.controls['symbol'].value as IInstrument;
    }

    set instrument(value: IInstrument) {
        this.form.controls['symbol'].setValue(value);
    }

    get orderType(): OrderTypes {
        return this.form.controls['type'].value;
    }

    get orderSide(): OrderSide {
        return this.form.controls['side'].value;
    }

    set orderSide(value: OrderSide) {
        this.form.controls['side'].setValue(value);
    }


    get instrumentSearchCallback(): (e?: EExchange, s?: string) => Observable<IInstrument[]> {
        return (e, s) => {
            return this._brokerService.getInstruments(e, s);
        };
    }

    constructor(private _fb: FormBuilder,
        private _realtimeService: RealtimeService,
        private _alertService: AlertService,
        private _translateService: TranslateService,
        private _brokerService: BrokerService) {
    }

    ngOnInit() {
        const broker: OandaBrokerService = this._brokerService.activeBroker as OandaBrokerService;

        this.allowedOrderTypes = broker
            ? JsUtil.stringEnumToArray<OrderTypes>(OrderTypes).filter((t) => broker.supportedOrderTypes.indexOf(t) !== -1)
            : [];
            
        this.form = this._buildForm(this.config, this.allowedOrderTypes);


        this.form.controls['type']
            .valueChanges
            .pipe(
                distinctUntilChanged(),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((type: OrderTypes) => {
                this._handleOrderTypeChanged(type);
            });


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

    private _buildForm(orderConfig: OrderConfig, allowedOrderTypes: OrderTypes[]): FormGroup {
        const orderType = orderConfig.type != null ? orderConfig.type : allowedOrderTypes[0];

        return this._fb.group({
            side: orderConfig.side,
            symbol: [orderConfig.instrument, [Validators.required]],
            type: [orderType, [Validators.required]],
            amount: [orderConfig.amount, [Validators.required, floatNumberRangeValidator({ min: this.minAmountValue })]],

            limitPrice: [{
                value: orderConfig.price,
                disabled: !this._useLimitPrice(orderType)
            }, [Validators.required, floatNumberRangeValidator({ min: this.minPriceValue })]],

            stopPrice: [{
                value: orderConfig.stopPrice,
                disabled: !this._useStopPrice(orderType)
            }, [Validators.required, floatNumberRangeValidator({ min: this.minPriceValue })]]
        });
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
        return this.orderSide === OrderSide.Buy;
    }

    isLimitVisible() {
        return this._useLimitPrice(this.orderType);
    }

    isStopPriceVisible() {
        return this._useStopPrice(this.orderType);
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    private _selectInstrument(instrument: IInstrument) {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

        this.instrument = instrument;

        if (instrument) {
            this.baseCurrency = instrument.baseInstrument;
            this.dependCurrency = instrument.dependInstrument;
            this.lastTick = this._realtimeService.getLastTick(instrument);
            this.marketSubscription = this._realtimeService.subscribeToTicks(instrument, (tick: ITick) => {
                this.lastTick = tick;
            });
        } else {
            this.baseCurrency = '';
            this.dependCurrency = '';
        }
    }

    private _handleOrderTypeChanged(type: OrderTypes) {
        const controls = this.form.controls;
        const limitControl = controls['limitPrice'];
        const stopControl = controls['stopPrice'];

        if (this._useLimitPrice(type)) {
            limitControl.enable();
        } else {
            limitControl.disable();
        }

        if (this._useStopPrice(type)) {
            stopControl.enable();
        } else {
            stopControl.disable();
        }
    }

    private _useLimitPrice(orderType: OrderTypes): boolean {
        return orderType === OrderTypes.Limit || orderType === OrderTypes.StopLimit;
    }

    private _useStopPrice(orderType: OrderTypes): boolean {
        return orderType === OrderTypes.Stop || orderType === OrderTypes.StopLimit;
    }


    submit() {
        const config: OrderConfig = this._getFormValues();

        if (this.submitHandler) {
            this.submitHandler(config);
            this.onSubmitted.emit();
        } else {
            this._placeOrder(config);
        }
    }

    private _placeOrder(config: OrderConfig) {
        const broker = this._brokerService.activeBroker as OandaBrokerService;
        const placeOrderData: IForexPlaceOrderAction = {
            symbol: config.instrument.symbol,
            side: config.side,
            size: config.amount,
            type: config.type,
            price: config.price || config.stopPrice
        };

        this.processingSubmit = true;
        broker.placeOrder(placeOrderData)
            .pipe(finalize(() => {
                this.processingSubmit = false;
                this.onSubmitted.emit();
            }))
            .subscribe(value => {
                if (value.result) {
                    this._alertService.success(this._translateService.get('tradeManager.orderPlaced'));
                } else {
                    this._alertService.error(value.msg);
                }
            }, error => {
                this._alertService.error(error.message);
            });
    }

    private _getFormValues(): OrderConfig {
        const controls = this.form.controls;
        const side = controls['side'].value as OrderSide;
        const type = controls['type'].value as OrderTypes;

        const config: OrderConfig = {
            instrument: controls['symbol'].value as IInstrument,
            side: side,
            amount: Number(controls['amount'].value),
            type: controls['type'].value as OrderTypes,
            price: type === OrderTypes.Limit || type === OrderTypes.StopLimit ? Number(controls['limitPrice'].value) : null,
            stopPrice: (type === OrderTypes.Stop || type === OrderTypes.StopLimit)
                ? Number(controls['stopPrice'].value)
                : null
        };

        return config;
    }

    setBuyMode() {
        this.orderSide = OrderSide.Buy;
    }

    setSellMode() {
        this.orderSide = OrderSide.Sell;
    }

    ngOnDestroy() {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
    }
}
