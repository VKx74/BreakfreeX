import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { IMTTick, ITick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType, OrderTradeType, OrderPlacedFrom, RiskClass } from "../../../../models/models";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subject, Subscription } from "rxjs";
import { BrokerService } from "@app/services/broker.service";
import { debounceTime, finalize, takeUntil} from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTOrderValidationChecklist, MTPlaceOrder, RTDTrendStrength } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { MatDialog } from '@angular/material/dialog';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { MTHelper } from '@app/services/mt/mt.helper';

interface ChecklistItem {
    name: string;
    valid: boolean;
    value?: string;
    tooltip: string;
    minusScore: number;
}

interface ChecklistItemDescription {
    calculate: (data: MTOrderValidationChecklist, config?: MTOrderConfig) => ChecklistItem;
}

const checklist: ChecklistItemDescription[] = [
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let minusScore = data.LocalRTD ? 0 : 2;
            let tooltip = data.LocalRTD ?   "You are trading with local trend in your favour." : "You are trading against local trend.";
            if (data.LocalRTDTrendStrength) {
                if (data.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    minusScore = 3;
                } else if (data.LocalRTDTrendStrength === RTDTrendStrength.Average) {
                    minusScore = 2;
                } else {
                    minusScore = 1;
                }

                tooltip = data.LocalRTDTrendStrength + " " + tooltip;
            }
            return {
                name: "Local Trend",
                valid: data.LocalRTD,
                minusScore: data.LocalRTD ? 0 : minusScore,
                tooltip: tooltip
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let minusScore = data.GlobalRTD ? 0 : 4;
            let tooltip = data.LocalRTD ? "This is not smart. You are trading against global trend." : "You are trading with global trend in your favour.";
            if (data.GlobalRTDTrendStrength) {
                if (data.GlobalRTDTrendStrength === RTDTrendStrength.Strong) {
                    minusScore = 5;
                } else if (data.GlobalRTDTrendStrength === RTDTrendStrength.Average) {
                    minusScore = 4;
                } else if (data.GlobalRTDTrendStrength === RTDTrendStrength.Low) {
                    minusScore = 3;
                } else {
                    minusScore = 2;
                }

                tooltip = data.GlobalRTDTrendStrength + " " + tooltip;
            }
            return {
                name: "Global Trend",
                valid: data.GlobalRTD,
                minusScore: data.GlobalRTD ? 0 : minusScore,
                tooltip: tooltip
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            return {
                name: "Major levels",
                valid: data.Levels,
                minusScore: data.Levels ? 0 : 2,
                tooltip: data.Levels ? "There are no major levels to contradict trend within distance to your entry." : "CAREFUL! There are major levels close to contradicting your entry."
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let value = "";
            let valid = true;
            let minusScore = 0;
            let tooltip = "";
            if (data.RiskValue !== null && data.RiskValue !== undefined) {
                value = data.RiskValue.toFixed(2) + "%";

                const risk = MTHelper.convertValueToOrderRiskClass(data.RiskValue);
                if (risk === RiskClass.Extreme) {
                    minusScore = 5;
                    valid = false;
                } else if (risk === RiskClass.High) {
                    minusScore = 3;
                    valid = false;
                }

                tooltip = valid ? "Reasonable leverage used for this position. " :  "WARNING! You are overleveraging on this position, please reduce size or avoid trade.";
            }

            return {
                name: "Leverage",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: tooltip
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let value = "";
            let valid = true;
            let minusScore = 0;
            let tooltip = "";
            if (data.CorrelatedRiskValue !== null && data.CorrelatedRiskValue !== undefined) {
                value = data.CorrelatedRiskValue.toFixed(2) + "%";

                const risk = MTHelper.convertValueToAssetRiskClass(data.CorrelatedRiskValue);
                if (risk === RiskClass.Extreme) {
                    minusScore = 5;
                    valid = false;
                } else if (risk === RiskClass.High) {
                    minusScore = 3;
                    valid = false;
                }

                tooltip = valid ? "No major correlated risk found in your open positions. " :  "WARNING! We found high correlated risk for this trade with your current open positions. That means if you lose this trade, you will lose other trades at the same time, amplifying your risk and increasing your loss of capital. Cancel this trade.";

            }
            return {
                name: "Correlated Risk",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: tooltip
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let value = "";
            let valid = null;
            let minusScore = 0;
            if (data.SpreadRiskValue !== null && data.SpreadRiskValue !== undefined) {
                value = data.SpreadRiskValue.toFixed(2) + "%";
                valid = data.SpreadRiskValue < 0.1;

                if (data.CorrelatedRiskValue > 0.2) {
                    minusScore = 3;
                } else if (data.CorrelatedRiskValue > 0.15) {
                    minusScore = 2;
                } else if (data.CorrelatedRiskValue > 0.1) {
                    minusScore = 1;
                }
            }
            return {
                name: "Spread",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: valid ? "Acceptable spread." :  "Unreasonable spread found on this market with your broker. "
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            const isValid = !!config.sl;
            return {
                name: "Stoploss",
                valid: isValid,
                minusScore: isValid ? 0 : 2,
                tooltip: isValid ? "Acceptable stoploss set for order" :  "Warning! Unacceptable stoploss, you might as well just go to the Casino. Atleast this way you will have fun losing all your money."
            };
        }
    }
];

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
    // useSL: boolean; // Stop price
    // useTP: boolean; // Stop price
    comment?: string; // Stop price
    timeframe?: number;
    tradeType?: OrderTradeType;
    placedFrom?: OrderPlacedFrom;

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
    private _checklistSubject: Subject<void> = new Subject();
    private _recalculatePossible = true;
    private _recalculateTimeout: any;
    private _technicalComment: string;
    private _canChangeInstrument: boolean = true;

    @Input() submitHandler: MTOrderComponentSubmitHandler;
    @Output() onSubmitted = new EventEmitter<any>();
    @Output() onOrderPlaced = new EventEmitter<MTPlaceOrder>();
    @Output() onInstrumentSelected = new EventEmitter<string>();
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

    get technicalComment(): string {
        return this._technicalComment;
    }

    get technicalCommentLengthUsed(): number {
        return this._technicalComment ? this._technicalComment.length : 0;
    }

    get commentLengthUsed(): number {
        return this.config && this.config.comment ? this.config.comment.length : 0;
    }

    get maxCommentLength(): number {
        return 30;
    }

    get canChangeInstrument(): boolean {
        return this._canChangeInstrument;
    }

    minAmountValue: number = 0.01;
    minPriceValue: number = 0.000001;
    priceStep: number = 0.00001;
    amountStep: number = 0.01;
    decimals: number = 5;
    calculatingChecklist: boolean = false;

    checklistItems: ChecklistItem[] = [];
    orderScore: number = 10;

    lastTick: IMTTick = null;
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
        
        this._checklistSubject.pipe(
            debounceTime(500),
            takeUntil(componentDestroyed(this))
        ).subscribe(() => {
            this._calculateChecklist();
        });
    }

    ngOnInit() {
        this.allowedOrderTypes = [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];
        if (this.config.instrument) {
            this._selectInstrument(this.config.instrument, false);
            this._technicalComment = MTHelper.buildTechnicalComment(this.config.tradeType, this.config.timeframe);

            // tech comment exists if it is strategy setup
            // if (this._technicalComment) {
            //     this._canChangeInstrument = false;
            // }
        }
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

    isExpirationVisible() {
        return this.config.expirationType === OrderExpirationType.Specified;
    }

    handleInstrumentChange(instrument: IInstrument) {
        this._selectInstrument(instrument);
    }

    handleTypeSelected(type: OrderTypes) {
        this.config.type = type;
        this._raiseCalculateChecklist();

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

    valueChanged() {
        this._raiseCalculateChecklist();
    }

    calculateOrderStarts() {
        return Math.floor(this.orderScore / 2);
    }

    private _selectInstrument(instrument: IInstrument, resetPrice = true) {
        this.lastTick = null;
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

        // if (this._technicalComment) {
        //     this._technicalComment = "";
        // }

        this.config.instrument = instrument;
        const broker = this._brokerService.activeBroker as MTBroker;
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

            this.checklistItems = [];
            this.calculatingChecklist = true;
            this._recalculatePossible = true;

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

            this.onInstrumentSelected.emit(symbol);
        }
    }

    private _buildCalculateChecklistResults(data: MTOrderValidationChecklist) {
        this.checklistItems = [];
        this.orderScore = 10;

        if (!data) {
            return;
        }

        let recalculateNeeded = false;

        for (const i of checklist) {
            const res = i.calculate(data, this.config);
            if (res.valid === undefined || res.valid === null) {
                recalculateNeeded = true;
                continue;
            }
            this.orderScore -= res.minusScore;
            this.checklistItems.push(res);
        }

        if (recalculateNeeded && this._recalculatePossible) {
            this.calculatingChecklist = true;
            this._recalculatePossible = false;
            this._recalculateTimeout = setTimeout(() => {
                this._recalculateTimeout = null;
                this._raiseCalculateChecklist();
            }, 3000);
        }
    }

    private _calculateChecklist() {
        this.calculatingChecklist = true;
        if (!this.lastTick) {
            return;
        }

        const broker = this._brokerService.activeBroker as MTBroker;
        broker.calculateOrderChecklist({
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Price: this.config.type !== OrderTypes.Market ? this.config.price : null,
            SL: this.config.sl ? this.config.sl : null
        }).subscribe((res) => {
            this.calculatingChecklist = false;
            this._buildCalculateChecklistResults(res);
        }, (error) => {
            this.calculatingChecklist = false;
            this._buildCalculateChecklistResults(null);
        });
    }

    private _raiseCalculateChecklist() {
        if (!this.config.instrument) {
            return;
        }
        
        this.calculatingChecklist = true;
        this._checklistSubject.next();
    }

    submit() {
        if (this.submitHandler) {
            this.submitHandler(this.config);
            this.onSubmitted.emit();
        } else {
            if (this.orderScore < 7) {
                this._dialog.open(ConfirmModalComponent, {
                    data: {
                        title: 'Overleverage detected',
                        message: `You are already overleveraged. Reduce your position size or remove active orders. If you place this trade, you will be very overleveraged. Most Likely you will loss your entire account. Place order?`,
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
        let needLoad = false;
        if (!this.lastTick) {
            needLoad = true;
        }

        this.lastTick = tick;
        const price = this._config.side === OrderSide.Buy ? tick.ask : tick.bid;

        if (tick && !this._config.price) {
            this._config.price = price;
        }
        // if (tick && !this._config.sl) {
        //     this._config.sl = price;
        // }
        // if (tick && !this._config.tp) {
        //     this._config.tp = price;
        // }

        if (needLoad) {
            this._raiseCalculateChecklist();
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
        if (!this.config.instrument) {
            this._alertService.info("Select instrument");
            return;
        }
        
        const broker = this._brokerService.activeBroker as MTBroker;
        let comment = (this.technicalComment || "") +  (this.config.comment || "");
        const placeOrderData: MTPlaceOrder = {
            Comment: comment,
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Type: this.config.type,
            Price: this.config.type !== OrderTypes.Market ?  Number(this.config.price) : 0,
            SL: this.config.sl ?  Number(this.config.sl) : 0,
            TP: this.config.tp ?  Number(this.config.tp) : 0,
            FillPolicy: this.config.fillPolicy,
            ExpirationType: this.config.expirationType,
            ExpirationDate: this._getSetupDate(),
            PlacedFrom: this.config.placedFrom,
            Timeframe: this.config.timeframe,
            TradeType: this.config.tradeType
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
        this._raiseCalculateChecklist();
    }

    setSellMode() {
        this.config.side = OrderSide.Sell;
        this._raiseCalculateChecklist();
    }

    ngOnDestroy() {
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

        if (this._recalculateTimeout) {
            clearTimeout(this._recalculateTimeout);
        }
    }
}
