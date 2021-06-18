import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { ITradeTick, ITick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType, OrderTradeType, OrderPlacedFrom, RiskClass } from "../../../../models/models";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subject, Subscription } from "rxjs";
import { BrokerService } from "@app/services/broker.service";
import { debounceTime, finalize, takeUntil } from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTOrderValidationChecklist, MTPlaceOrder, RTDTrendStrength } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { MatDialog } from '@angular/material/dialog';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { TradingHelper } from '@app/services/mt/mt.helper';
import { TimeSpan } from '@app/helpers/timeFrame.helper';
import { OrderComponentSubmitHandler } from 'modules/Trading/components/trade-manager/order-configurator-modal/order-configurator-modal.component';
import { InfoNotificationComponent } from './notifications/info/info-notification.component';
import { SpreadNotificationComponent } from './notifications/spread/spread-notification.component';
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';

const CalculatingChecklistStatuses = [
    "Checking entry...",
    "Checking leverage...",
    "Checking spread...",
    "Checking price offset...",
    "Checking local trend...",
    "Checking global trend...",
    "Checking correlated risk...",
    "Checking stop loss...",
    "Calculating rate..."
];

enum ChecklistItemType {
    LocalRTD,
    GlobalRTD,
    Levels,
    Leverage,
    CorrelatedRisk,
    Spread,
    Stoploss,
    PriceOffset
}

interface ChecklistItem {
    name: string;
    valid: boolean;
    value?: string;
    tooltip: string;
    minusScore: number;
    type: ChecklistItemType;
}

interface ChecklistItemDescription {
    calculate: (data: MTOrderValidationChecklist, config?: MTOrderConfig) => ChecklistItem;
}

const checklist: ChecklistItemDescription[] = [
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let acceptableTrend = data.LocalRTD;
            let minusScore = 0;
            let tooltip = acceptableTrend ? "You are trading with local trend in your favor." : "You are trading against local trend.";
            let timeframe = config.timeframe;
            let hour = TimeSpan.MILLISECONDS_IN_HOUR / 1000;

            if (!acceptableTrend) {
                if (timeframe) {
                    if (timeframe <= hour) {
                        if (data.LocalRTDTrendStrength === RTDTrendStrength.Weak) {
                            acceptableTrend = true;
                            tooltip = `You are trading against an acceptable ${data.LocalRTDTrendStrength} local trend.`;
                        } else {
                            tooltip = `You are trading against an unacceptable ${data.LocalRTDTrendStrength} local trend.`;
                            minusScore = data.LocalRTDTrendStrength === RTDTrendStrength.Strong ? 3 : 2;
                        }
                    } else if (timeframe <= hour * 4) {
                        if (data.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                            tooltip = `You are trading against an unacceptable ${data.LocalRTDTrendStrength} local trend.`;
                            minusScore = 2;
                        } else {
                            tooltip = `You are trading against an acceptable ${data.LocalRTDTrendStrength} local trend.`;
                            acceptableTrend = true;
                        }
                    } else {
                        tooltip = `You are trading against an acceptable ${data.LocalRTDTrendStrength} local trend.`;
                        acceptableTrend = true;
                    }
                } else if (data.LocalRTDTrendStrength === RTDTrendStrength.Strong) {
                    tooltip = `You are trading against an unacceptable ${data.LocalRTDTrendStrength} local trend.`;
                    minusScore = 2;
                }
            }

            return {
                name: "Local Trend",
                valid: acceptableTrend,
                minusScore: acceptableTrend ? 0 : minusScore,
                tooltip: tooltip,
                type: ChecklistItemType.LocalRTD
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let minusScore = data.GlobalRTD ? 0 : 4;
            let tooltip = data.GlobalRTD ? "You are trading with the global trend in your favor. Keep doing this." : "WARNING! You are entering a trade that goes against the global trend. It's very possible this trade could be a winning trade, however you will discover over time that trading against the trend is the sole reason you never become profitable.";
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
            }
            return {
                name: "Global Trend",
                valid: data.GlobalRTD,
                minusScore: data.GlobalRTD ? 0 : minusScore,
                tooltip: tooltip,
                type: ChecklistItemType.GlobalRTD
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let tooltip = data.Levels ? "Good entry, you are buying into support." : "Warning! You are buying into resistance. You are most likely chasing the market, and while this may be fun and profitable for a short time, you will lose all your money in the long run.";
            if (config.side === OrderSide.Sell) {
                tooltip = data.Levels ? "Good entry, you are selling into resistance." : "Warning! You are selling into support. You are most likely chasing the market, and while this may be fun and profitable for a short time, you will lose all your money in the long run.";
            }

            return {
                name: "Trade Entry",
                valid: data.Levels,
                minusScore: data.Levels ? 0 : 2,
                tooltip: tooltip,
                type: ChecklistItemType.Levels
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let value = "";
            let valid = true;
            let minusScore = 0;
            let tooltip = "";
            if (data.PositionRiskValue !== null && data.PositionRiskValue !== undefined) {
                value = data.PositionRiskValue.toFixed(2) + "%";

                const risk = TradingHelper.convertValueToOrderRiskClass(data.PositionRiskValue);
                if (risk === RiskClass.Extreme) {
                    minusScore = 5;
                    valid = false;
                } else if (risk === RiskClass.High) {
                    minusScore = 3;
                    valid = false;
                }

                tooltip = valid ? "You are using adequate leverage sized for this position. " : "WARNING! You are about to enter an overleveraged trade. This is the main reason simple humans continue to lose in trading because they love to gamble.";
            }

            return {
                name: "Leverage",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: tooltip,
                type: ChecklistItemType.Leverage
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

                const risk = TradingHelper.convertValueToAssetRiskClass(data.CorrelatedRiskValue);
                if (risk === RiskClass.Extreme) {
                    minusScore = 5;
                    valid = false;
                } else if (risk === RiskClass.High) {
                    minusScore = 3;
                    valid = false;
                }

                tooltip = valid ? "You have no major correlated risk in your open/pending orders." : "WARNING! If you take this trade, you will be overexposing and taking a too much-correlated risk. This means you will lose or win a much higher amount than usual and likely lead to losing your account in the long run. Avoid this trade and look to other markets.";

            }
            return {
                name: "Correlated Risk",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: tooltip,
                type: ChecklistItemType.CorrelatedRisk
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
            }
            return {
                name: "Spread",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: valid ? "Your broker has acceptable spread on this market." : "Warning! Your broker is offering you a bad spread on this market. Be very careful as this can lead to a total loss of your trading account on the wrong markets.",
                type: ChecklistItemType.Spread
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            const isValid = !!config.sl;

            if (data.isSLReversed) {
                return {
                    name: "Stoploss",
                    valid: false,
                    minusScore: 10,
                    tooltip: "Your stoploss is on the wrong side of this trade, please pay attention.",
                    type: ChecklistItemType.Stoploss
                };
            }

            if (data.isSLToClose) {
                return {
                    name: "Stoploss",
                    valid: false,
                    minusScore: 2,
                    tooltip: "This stoploss has a high risk of being stopped out with the current volatility of this market. Please rethink this stoploss.",
                    type: ChecklistItemType.Stoploss
                };
            }

            if (data.isSLToFare) {
                return {
                    name: "Stoploss",
                    valid: false,
                    minusScore: 2,
                    tooltip: "Stoploss unreasonable far from the entry price.",
                    type: ChecklistItemType.Stoploss
                };
            }

            return {
                name: "Stoploss",
                valid: isValid,
                minusScore: isValid ? 0 : 3,
                tooltip: isValid ? "You have set a reasonable stoploss for the trade. A basic but very important discipline for successful trading, when it comes to humans." : "Warning! You are missing stoploss for this trade. Trading without stoploss is risky business and a classic trait of the average losing human trader. ",
                type: ChecklistItemType.Stoploss
            };
        }
    },
    {
        calculate: (data: MTOrderValidationChecklist, config: MTOrderConfig): ChecklistItem => {
            let value = "";
            let valid = null;
            let minusScore = 0;
            if (data.FeedBrokerSpread !== null && data.FeedBrokerSpread !== undefined) {
                value = (data.FeedBrokerSpread * 100).toFixed(0) + " BPS";
                valid = data.FeedBrokerSpread < 0.03;
            }
            return {
                name: "Price offset",
                valid: valid,
                value: value,
                minusScore: valid ? 0 : minusScore,
                tooltip: valid ? "The navigator datafeed and the connected broker feed for this market are aligned within an acceptable price range." : "Warning! The navigator datafeed and the connected broker feed for this market are not aligned within an acceptable price range. Price offset required.",
                type: ChecklistItemType.PriceOffset
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
    comment?: string; // Stop price
    timeframe?: number;
    lastPrice?: number;
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
    private _statusChangeInterval: any;
    private _checklistTimeout: any;
    private _technicalComment: string;
    private _canChangeInstrument: boolean = true;
    private _destroyed: boolean = false;
    private _wrongInstrumentShown: boolean = false;
    private _orderValidationChecklist: MTOrderValidationChecklist;

    @Input() submitHandler: OrderComponentSubmitHandler;
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
    calculatingChecklistStatus: string = CalculatingChecklistStatuses[0];

    checklistItems: ChecklistItem[] = [];
    orderScore: number = 10;

    lastTick: ITradeTick = null;
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
        private _localStorageService: LocalStorageService,
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
        this._orderValidationChecklist = null;
        this.allowedOrderTypes = [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];
        if (this.config.instrument) {
            this._selectInstrument(this.config.instrument, false);
            this._technicalComment = TradingHelper.buildTechnicalComment(this.config.tradeType, this.config.timeframe);
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
            [OrderTypes.StopLimit]: 'tradeManager.orderType.stopLimit'
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
        return this.orderScore;
    }

    private _selectInstrument(instrument: IInstrument, resetPrice = true) {
        this.lastTick = null;
        if (this.marketSubscription) {
            this.marketSubscription.unsubscribe();
        }

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

    private _setCalculatingChecklistStatus(status: boolean) {
        this.calculatingChecklist = status;
        if (status) {
            if (this._statusChangeInterval) {
                return;
            }

            this.calculatingChecklistStatus = CalculatingChecklistStatuses[0];
            this._statusChangeInterval = setInterval(() => {
                let index = CalculatingChecklistStatuses.indexOf(this.calculatingChecklistStatus) + 1;
                if (!CalculatingChecklistStatuses[index]) {
                    return;
                }
                this.calculatingChecklistStatus = CalculatingChecklistStatuses[index];
            }, 2000);
        } else {
            if (this._statusChangeInterval) {
                clearInterval(this._statusChangeInterval);
                this._statusChangeInterval = null;
            }
        }
    }

    private _buildCalculateChecklistResults(data: MTOrderValidationChecklist) {
        if (this._destroyed) {
            return;
        }
        
        this._orderValidationChecklist = data;

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

        if (this.orderScore < 0) {
            this.orderScore = 0;
        }

        if (recalculateNeeded && this._recalculatePossible) {
            this._setCalculatingChecklistStatus(true);
            this._recalculatePossible = false;
            this._recalculateTimeout = setTimeout(() => {
                this._recalculateTimeout = null;
                this._raiseCalculateChecklist();
            }, 3000);
        } else {
            this._validateIsSymbolCorrect();
            // if (this.config.timeframe) {
            //     this._checklistTimeout = setTimeout(() => {
            //         this._checklistSubject.next();
            //     }, 5000);
            // }
        }
    }

    private _calculateChecklist() {
        this._setCalculatingChecklistStatus(true);

        if (!this.lastTick) {
            return;
        }

        if (this._checklistTimeout) {
            clearTimeout(this._checklistTimeout);
        }

        const broker = this._brokerService.activeBroker as MTBroker;
        broker.calculateOrderChecklist({
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Price: this.config.type !== OrderTypes.Market ? this.config.price : null,
            SL: this.config.sl ? this.config.sl : null,
            Timeframe: this.config.timeframe,
            LastPrice: this.config.lastPrice
        }).subscribe((res) => {
            this._setCalculatingChecklistStatus(false);
            this._buildCalculateChecklistResults(res);
        }, (error) => {
            this._setCalculatingChecklistStatus(false);
            this._buildCalculateChecklistResults(null);
        });
    }

    private _raiseCalculateChecklist() {
        if (!this.config.instrument) {
            return;
        }

        this._setCalculatingChecklistStatus(true);
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
                        message: `Warning! You are about to enter a terrible trade. You might be lucky to win this trade, but you will never be successful in the long run like this. Place trade?`,
                        onConfirm: () => {
                            this._validateIsSymbolOffset();
                        }
                    }
                });
            } else {
                this._validateIsSymbolOffset();
            }
        }
    }

    private _setTick(tick: ITradeTick) {
        let needLoad = false;
        if (!this.lastTick) {
            needLoad = true;
        }

        this.lastTick = tick;
        const price = this._config.side === OrderSide.Buy ? tick.ask : tick.bid;

        if (tick && !this._config.price) {
            this._config.price = price;
        }

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
        let comment = (this.technicalComment || "") + (this.config.comment || "");
        const placeOrderData: MTPlaceOrder = {
            Comment: comment,
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Type: this.config.type,
            Price: this.config.type !== OrderTypes.Market ? Number(this.config.price) : 0,
            SL: this.config.sl ? Number(this.config.sl) : 0,
            TP: this.config.tp ? Number(this.config.tp) : 0,
            FillPolicy: this.config.fillPolicy,
            ExpirationType: this.config.expirationType,
            ExpirationDate: this._getSetupDate(),
            PlacedFrom: this.config.placedFrom,
            Timeframe: this.config.timeframe,
            TradeType: this.config.tradeType
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

        if (this._checklistTimeout) {
            clearTimeout(this._checklistTimeout);
        }

        this._destroyed = true;
    }

    private _validateIsSymbolCorrect() {
        if (this._destroyed || this._wrongInstrumentShown) {
            return;
        }

        this._wrongInstrumentShown = true;

        if (this._orderValidationChecklist.FeedBrokerSpread > 3) {
            this._dialog.open(InfoNotificationComponent, {
                data: {
                    title: "Warning",
                    data: "We have detected a large difference between our datafeed and your mapped broker instrument. Please make sure it's the correct instrument."
                }
            });
        }
    }

    private _validateIsSymbolOffset() {
        const price = this.config.type !== OrderTypes.Market ? Number(this.config.price) : 0;
        const sl = this.config.sl ? Number(this.config.sl) : 0;
        const tp = this.config.tp ? Number(this.config.tp) : 0;
        const spread = Math.roundToDecimals(this._orderValidationChecklist.FeedBrokerSpreadValue, this.decimals);

        if (this._orderValidationChecklist.FeedBrokerSpread && spread &&
            this._orderValidationChecklist.FeedBrokerSpread > 0.03 && (price || sl || tp)) {

            const autoOffsetDecision = this._localStorageService.get(LocalStorageService.IsSpreadAutoProcessing);
            if (autoOffsetDecision === true || autoOffsetDecision === false) {
                if (autoOffsetDecision === true) {
                    this._adjustOffset();
                    this._placeOrder();
                } else {
                    this._placeOrder();
                }
            } else {
                this._dialog.open(SpreadNotificationComponent, {
                    data: {
                        spread: (this._orderValidationChecklist.FeedBrokerSpread * 100).toFixed(0)
                    }
                }).afterClosed().subscribe((res) => {
                    if (res === undefined || res === null) {
                        return;
                    }
                    if (res) {
                        this._adjustOffset();
                    }
                    this._placeOrder();
                });
            }
        } else {
            this._placeOrder();
        }
    }

    private _adjustOffset() {
        const spread = Math.roundToDecimals(this._orderValidationChecklist.FeedBrokerSpreadValue * 0.9, this.decimals);
        if (!spread || Number.isNaN(spread)) {
            return;
        }

        if (this.config.type !== OrderTypes.Market && this.config.price) {
            this.config.price += spread;
        }
        if (this.config.sl) {
            this.config.sl += spread;
        }
        if (this.config.tp) {
            this.config.tp += spread;
        }
    }

}
