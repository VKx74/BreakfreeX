import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../localization/token";
import {
    OrderConfig,
    OrderConfiguratorSubmitHandler
} from "../crypto.components/crypto-order-configurator/crypto-order-configurator.component";
import {IPlaceOrderAction, OrderSide, OrderTypes} from "../../models/models";
import {Observable, Subscription} from "rxjs";
import {ITick} from "@app/models/common/tick";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IInstrument} from "@app/models/common/instrument";
import {EExchange} from "@app/models/common/exchange";
import {RealtimeService} from "@app/services/realtime.service";
import {AlertService} from "@alert/services/alert.service";
import {BrokerService} from "@app/services/broker.service";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {JsUtil} from "../../../../utils/jsUtil";
import {debounceTime, distinctUntilChanged, finalize, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {floatNumberRangeValidator} from "Validators";
import bind from "bind-decorator";
import {memoize} from "@decorators/memoize";
import {ICryptoPlaceOrderAction} from "../../models/crypto/crypto.models";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {ESide} from "@app/models/common/side";

@Component({
    selector: 'order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
    ]
})
export class OrderComponent {
    // @Input() orderType: OrderTypes;
    // @Input() tradeConfig;
    @Output() orderCreated = new EventEmitter<IPlaceOrderAction>();
    @Input()
    set config(value: OrderConfig) {
        this._config = value;
    }
    get config(): OrderConfig {
        return this._config;
    }
    @Input() submitHandler: OrderConfiguratorSubmitHandler;

    minAmountValue: number = 0.0001;
    minPriceValue: number = 0.0001;

    private _config: OrderConfig = OrderConfig.create();
    private marketSubscription: Subscription;
    lastTick: ITick;
    buyPrice: number;
    sellPrice: number;
    FEE_COEFFICIENT = 0.5;
    form: FormGroup;
    baseCurrency: string = '';
    dependCurrency: string = '';
    fee = 0.00;
    total = 0.00;
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

    get activeWallet() {
        const broker = this._brokerService.activeBroker as CryptoBroker;

        if (broker) {
            return broker.activeWallet;
        }
    }

    constructor(private _fb: FormBuilder,
                private _realtimeService: RealtimeService,
                private _alertService: AlertService,
                private _translateService: TranslateService,
                private _brokerService: BrokerService) {
    }

    ngOnInit() {
        const broker: CryptoBroker = this._brokerService.activeBroker as CryptoBroker;

        this.allowedOrderTypes = broker
            ? JsUtil.stringEnumToArray<OrderTypes>(OrderTypes).filter((t) => broker.supportedOrderTypes.indexOf(t) !== -1)
            : [];
        this.form = this._buildForm(this.config, this.allowedOrderTypes);

        this.form
            .valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged(),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(() => {
                this.updateFooterInfo();
            });

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

    updateFooterInfo() {
        this.total = this.getTotal();
        this.fee = this.getFee();
    }

    getFee(): number {
        const amount = this.form.controls['amount'].value;
        return this.FEE_COEFFICIENT * amount;
    }

    getTotal(): number {
        const amount = this.form.controls['amount'].value;
        switch (this.orderType) {
            case OrderTypes.Market:
                if (!this.lastTick) {
                    return 0;
                }
                return amount / this.lastTick.price;
            case OrderTypes.Limit:
            case OrderTypes.StopLimit:
                const price = this.form.controls['limitPrice'].value;
                if (Number(price) === 0) {
                    return 0;
                }
                return amount / price;
            case OrderTypes.Stop:
                const stopPrice = this.form.controls['stopPrice'].value;
                if (Number(stopPrice) === 0) {
                    return 0;
                }
                return amount / stopPrice;
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
            [OrderTypes.Market]: 'orderType.market',
            [OrderTypes.Limit]: 'orderType.limit',
            [OrderTypes.Stop]: 'orderType.stop',
            [OrderTypes.StopLimit]: 'orderType.stopLimit'
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
        this.sellPrice = null;
        this.buyPrice = null;
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
            this.updateFooterInfo();
            this.marketSubscription = this._realtimeService.subscribeToTicks(instrument, (tick: ITick) => {
                this.lastTick = tick;
                this._updatePrices();
                this.updateFooterInfo();
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

    private _updatePrices() {
        if (this.lastTick.side === ESide.buy) {
            this.buyPrice = this.lastTick.price;
        } else if (this.lastTick.side === ESide.sell) {
            this.sellPrice = this.lastTick.price;
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
        } else {
            this._placeOrder(config);
        }
    }

    private _placeOrder(config: OrderConfig) {
        let broker = this._brokerService.activeBroker;

        if (!broker) {
            return;
        }

        let placeOrderData: ICryptoPlaceOrderAction = {
            symbol: config.instrument.symbol,
            side: config.side,
            size: config.amount,
            type: config.type,
            // Price: config.price,
            // StopPrice: config.stopPrice
        };

        if (broker instanceof CryptoBroker) {
            broker = broker as CryptoBroker;
            placeOrderData = {
                ...placeOrderData,
                price: config.price,
                stopPrice: config.stopPrice
            };
        } else if (broker instanceof OandaBrokerService) {
            broker = broker as OandaBrokerService;
            placeOrderData = {
                ...placeOrderData,
                price: config.price || config.stopPrice
            };
        }

        this.processingSubmit = true;
        // TODO: Create interface
        (broker as any).placeOrder(placeOrderData)
            .pipe(finalize(() => {
                this.processingSubmit = false;
            }))
            .subscribe(value => {
                if (value.result) {
                    this._alertService.success(this._translateService.get('tradeManager.orderPlaced'));
                    this.orderCreated.emit(value.data);
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
        this.submit();
    }

    setSellMode() {
        this.orderSide = OrderSide.Sell;
        this.submit();
    }

    ngOnDestroy() {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
    }
}
