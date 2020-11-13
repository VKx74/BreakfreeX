import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { IMTTick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType } from "../../../../models/models";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subscription } from "rxjs";
import { BrokerService } from "@app/services/broker.service";
import { finalize} from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTPlaceOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { ConfirmModalComponent } from 'UI';
import { MatDialog } from '@angular/material/dialog';

export class MTOrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    fillPolicy?: OrderFillPolicy;
    expirationType?: OrderExpirationType;
    expirationDate?: number;
    price?: number; // Limit price
    sl?: number; // Stop price
    tp?: number; // Stop price
    useSL: boolean; // Stop price
    useTP: boolean; // Stop price
    comment?: string; // Stop price

    static createLimit(brokerType: EBrokerInstance): MTOrderConfig {
        const order = this.create();
        order.type = OrderTypes.Limit;
        if (brokerType === EBrokerInstance.MT5) {
            order.fillPolicy = OrderFillPolicy.FF;
        }

        return order;
    }

    static createMarket(brokerType: EBrokerInstance): MTOrderConfig {
        const order = this.create();
        order.type = OrderTypes.Market;
        if (brokerType === EBrokerInstance.MT5) {
            order.fillPolicy = OrderFillPolicy.IOC;
        }

        return order;
    }

    private static create(): MTOrderConfig {
        return {
            instrument: null,
            side: OrderSide.Buy,
            amount: 0.1,
            type: OrderTypes.Market,
            useSL: false,
            useTP: false,
            expirationType: OrderExpirationType.GTC,
            fillPolicy: OrderFillPolicy.IOC
        };
    }
}

export type MTOrderComponentSubmitHandler = (config: MTOrderConfig) => void;
export type MTOrderSubmitHandler = (config: MTPlaceOrder) => void;

@Component({
    selector: 'mt-order-configurator',
    templateUrl: './mt-order-configurator.component.html',
    styleUrls: ['./mt-order-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
    ]
})
export class MTOrderConfiguratorComponent implements OnInit {
    private _config: MTOrderConfig;
    private _oneDayPlus = new Date(new Date().getTime() + (1000 * 24 * 60 * 60));
    private _selectedTime: string = `${this._oneDayPlus.getUTCHours()}:${this._oneDayPlus.getUTCMinutes()}`;
    private _selectedDate: Date = this._oneDayPlus;
    private marketSubscription: Subscription;
    private _maxRisk: number = 5;
    private _normaRisk: number = 5;
    public risk: number = 0;

    @ViewChild("riskArrow", {static: false}) riskArrow: ElementRef;
    @ViewChild("riskGraph", {static: false}) riskGraph: ElementRef;

    @Input()
    set config(value: MTOrderConfig) {
        if (value) {
            this._config = value;

            if (this._config.expirationDate) {
                this._selectedDate = new Date(this._config.expirationDate);
                this._selectedTime = `${this._selectedDate.getUTCHours()}:${this._selectedDate.getUTCMinutes()}`;
            }
        }
    }
    
    get config(): MTOrderConfig {
        return this._config;
    }

    @Input() submitHandler: MTOrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();
    @Output() onOrderPlaced = new EventEmitter<MTPlaceOrder>();

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

    lastTick: IMTTick;
    allowedOrderTypes: OrderTypes[] = [];
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
        this._config = MTOrderConfig.createMarket(this._brokerService.activeBroker.instanceType);
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
        } else {
            this._selectInstrument(this.config.instrument, false);
        }
    }

    ngAfterViewInit() {
        this._setRiskArrowPosition();
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

    showRisk() {
        return true;
    }

    private _selectInstrument(instrument: IInstrument, resetPrice = true) {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

        this.config.instrument = instrument;
        const broker = this._brokerService.activeBroker as MTBroker;
        const symbol = instrument.symbol;

        this._calculateRisk();
        this.amountStep = broker.instrumentAmountStep(symbol);
        this.minAmountValue = broker.instrumentMinAmount(symbol);
        this.priceStep = broker.instrumentTickSize(symbol);
        this.minPriceValue = broker.instrumentTickSize(symbol);
        this.decimals = broker.instrumentDecimals(symbol);

        if (instrument) {
            if (resetPrice) {
                this._config.price = 0;
            }

            broker.getPrice(symbol).subscribe((tick: IMTTick) => {
                if (!tick || tick.symbol !== this.config.instrument.symbol) {
                    return;
                }
                
                this._setTick(tick);
            });

            this.marketSubscription = broker.subscribeToTicks(symbol, (tick: IMTTick) => {
                if (tick.symbol !== this.config.instrument.symbol) {
                    return;
                }

                this._setTick(tick);
            });
        }
    }

    private _setRiskArrowPosition() {
        if (!this.riskArrow || !this.riskGraph) {
            return;
        }

        const padding = 0;
        const width = this.riskGraph.nativeElement.clientWidth - 4;

        let riskPercentage = this.risk / this._maxRisk;
        if (riskPercentage < 0) {
            riskPercentage = 0;
        }
        if (riskPercentage > 1) {
            riskPercentage = 1;
        }

        const margin = Math.round(width * riskPercentage) - padding;

        this.riskArrow.nativeElement.style["margin-left"] = `${margin}px`;
        this.riskArrow.nativeElement.style["fill"] = this.risk < this._normaRisk ? "#5eaf80" : "#dc3445";
    }

    private _calculateRisk() {
        const broker = this._brokerService.activeBroker as MTBroker;
        this.risk = broker.getRelatedPositionsRisk(this.config.instrument.symbol, this.config.side) / broker.accountInfo.Balance * 100;
        if (this.risk < 0) {
            this.risk = 0;
        }
        this._setRiskArrowPosition();
    }

    submit() {
        if (this.submitHandler) {
            this.submitHandler(this.config);
            this.onSubmitted.emit();
        } else {
            if (this.risk > this._maxRisk) {
                this._dialog.open(ConfirmModalComponent, {
                    data: {
                        title: 'Risk alert',
                        message: `You have already exceeded reasonable risk limitations with current open positions. Adding a position on ${this.config.instrument.symbol} will only increase current risk and lead to overleverage. Are you sure you wish to increase risk beyond ${this.risk.toFixed(2)}% ?`,
                        onConfirm: () => {
                            this._placeOrder();
                        }
                    }
                });
            } else {
                this._placeOrder();
            }
        }
    }

    private _setTick(tick: IMTTick) {
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
        const broker = this._brokerService.activeBroker as MTBroker;
        const placeOrderData: MTPlaceOrder = {
            Comment: this.config.comment || "",
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Type: this.config.type,
            Price: this.config.type !== OrderTypes.Market ?  Number(this.config.price) : 0,
            SL: this.config.useSL ?  Number(this.config.sl) : 0,
            TP: this.config.useTP ?  Number(this.config.tp) : 0,
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
        this._calculateRisk();
    }

    setSellMode() {
        this.config.side = OrderSide.Sell;
        this._calculateRisk();
    }

    ngOnDestroy() {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }
    }
}
