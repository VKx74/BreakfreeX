import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { ITradeTick } from "@app/models/common/tick";
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType, OrderTradeType, OrderPlacedFrom } from "../../../../models/models";
import { IInstrument } from "@app/models/common/instrument";
import { EExchange } from "@app/models/common/exchange";
import { Observable, Subject, Subscription } from "rxjs";
import { BrokerService } from "@app/services/broker.service";
import { debounceTime, finalize, takeUntil } from "rxjs/operators";
import { AlertService } from "@alert/services/alert.service";
import { memoize } from "@decorators/memoize";
import bind from "bind-decorator";
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTPlaceOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { MatDialog } from '@angular/material/dialog';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { TradingHelper } from '@app/services/mt/mt.helper';
import { OrderComponentSubmitHandler } from 'modules/Trading/components/trade-manager/order-configurator-modal/order-configurator-modal.component';
import { InfoNotificationComponent } from './notifications/info/info-notification.component';
import { SpreadNotificationComponent } from './notifications/spread/spread-notification.component';
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';
import { CalculatingChecklistStatuses, ChecklistItem, CorrelatedRiskValidator, GlobalTrendValidator, LevelsValidator, LeverageValidator, LocalTrendValidator, MTChecklistItemDescription, OrderValidationChecklist, PriceOffsetValidator, SpreadValidator, StoplossValidator } from 'modules/Trading/models/crypto/shared/order.validation';
import { SettingsStorageService } from '@app/services/settings-storage.servic';

const checklist: MTChecklistItemDescription[] = [
    // new LocalTrendValidator(),
    // new GlobalTrendValidator(),
    // new LevelsValidator(),
    new LeverageValidator(),
    new CorrelatedRiskValidator(),
    new SpreadValidator(),
    new StoplossValidator(),
    new PriceOffsetValidator()
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
            amount: 0.01,
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
    private _useTradeGuard: boolean = false;
    private _orderValidationChecklist: OrderValidationChecklist;

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

    get useTradeGuard(): boolean {
        return this._useTradeGuard;
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
        private _settingsStorageService: SettingsStorageService,
        private _brokerService: BrokerService) {
        this._config = MTOrderConfig.createMarket(this._brokerService.activeBroker.instanceType);

        _settingsStorageService.getSettings().subscribe((_) => {
            this._useTradeGuard = _.UseTradeGuard;
            this._loadChecklist();
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

    private _loadChecklist() {
        this._checklistSubject.pipe(
            debounceTime(500),
            takeUntil(componentDestroyed(this))
        ).subscribe(() => {
            this._calculateChecklist();
        });
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

    private _buildCalculateChecklistResults(data: OrderValidationChecklist) {
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

            if (!this._useTradeGuard) {
                this._placeOrder();
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
