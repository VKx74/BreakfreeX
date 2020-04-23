import {Component, Inject, Injector, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {AutoTradingAlertsTranslateService} from "../../localization/token";
import {IInstrument} from "@app/models/common/instrument";
import {InstrumentService} from "@app/services/instrument.service";
import {
    EAlertType,
    EChannelAlertCondition,
    EDataSourceType,
    EMovingAlertCondition,
    EPriceAlertCondition
} from "../../models/Enums";
import {AutoTradingAlertService} from "../../services/auto-trading-alert.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AudioService} from "@app/services/audio.service";
import {CancelOrderComponent} from "../cancel-order/cancel-order.component";
import {
    CryptoOrderConfiguratorModalComponent,
    ICryptoOrderFormConfig
} from "../../../Trading/components/crypto.components/crypto-order-configurator-modal/crypto-order-configurator-modal.component";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {RealtimeSourceSettings, IndicatorSourceSettings} from "../../models/AlertSourceSettingsBase";
import {
    AlertSettings,
    ChannelAlertSettings,
    MovingAlertSettings,
    PriceAlertSettings,
    IndicatorAlertSettings
} from "../../models/AlertSettingsBase";
import {TradeActionType, OrderSide, OrderTypes} from "../../../Trading/models/models";
import {BrokerService} from "@app/services/broker.service";
import {JsUtil} from "../../../../utils/jsUtil";
import {CancelTradeSettings, PlaceTradeSettings, TradeSettings} from "../../models/TradeSettingsBase";
import {AlertService} from "@alert/services/alert.service";
import {OrderConfig} from "../../../Trading/components/crypto.components/crypto-order-configurator/crypto-order-configurator.component";
import {AlertViewModel, TradingOrdersStatus} from './alert.view.model';
import {IndicatorSeriesDescription} from 'modules/AutoTradingAlerts/models/dataSources/IndicatorSeriesDescription';
import {Observable, of} from 'rxjs';
import {Modal} from "Shared";
import {AlertBase} from "../../models/AlertBase";
import {tap} from "rxjs/operators";

export interface IAlertDialogConfig {
    alert?: AlertBase;
    sourceSettings?: IndicatorSourceSettings;
    seriesSet?: IndicatorSeriesDescription[];
    instrument?: IInstrument;
}

@Component({
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class AlertDialogComponent extends Modal<IAlertDialogConfig> implements OnInit {
    priceLiteral = 'Price';
    activeInstrument: IInstrument;
    alertWidgetForm: FormGroup;
    configuredTrade?: TradeSettings;
    minDate = new Date;

    private _conditionTypes: Map<string, EAlertType>;
    private _conditionTitles: Array<string>;
    public IndicatorCrossingTitles: Array<IndicatorSeriesDescription> = new Array();
    public IndicatorCrossedTitles: Array<IndicatorSeriesDescription> = new Array();
    public MovingTypeWithPercent: boolean;
    private alertVM: AlertViewModel;
    controls: any;
    priceAlertControls: any;
    processingSubmit: boolean = false;

    static createArtificialSeries(title: string): IndicatorSeriesDescription {
        return {
            IndicatorName: '',
            SeriesName: '',
            SeriesIndex: 0,
            IndicatorParameters: [],
            Title: title,
        } as IndicatorSeriesDescription;
    }

    private initConditions(): void {
        this._conditionTypes = new Map<string, EAlertType>();

        Object.values(EPriceAlertCondition).forEach(element => {
            this._conditionTypes.set(element, EAlertType.PriceAlert);
        });

        Object.values(EChannelAlertCondition).forEach(element => {
            this._conditionTypes.set(element, EAlertType.ChannelAlert);
        });

        Object.values(EMovingAlertCondition).forEach(element => {
            this._conditionTypes.set(element, EAlertType.MovingAlert);
        });

        this._conditionTitles = Array.from(this.Conditions.keys());
    }

    get tradingOrdersStatusTitles(): TradingOrdersStatus[] {
        return [
            TradingOrdersStatus.noneTr,
            TradingOrdersStatus.placeOrderTr,
            TradingOrdersStatus.cancelOrderTr,
        ];
    }

    get alertsSound(): string[] {
        return this._audioService.sounds;
    }

    get ConditionTitle() {
        return this._conditionTitles;
    }

    get Conditions(): Map<string, EAlertType> {
        let ret = new Map<string, EAlertType>();

        Object.values(EPriceAlertCondition).forEach(element => {
            ret.set(element, EAlertType.PriceAlert);
        });

        Object.values(EChannelAlertCondition).forEach(element => {
            ret.set(element, EAlertType.ChannelAlert);
        });

        Object.values(EMovingAlertCondition).forEach(element => {
            ret.set(element, EAlertType.MovingAlert);
        });

        return ret;
    }

    indicatorsSeriesCaption = (indicatoSeries: IndicatorSeriesDescription) => {
        if (indicatoSeries.Title === this.priceLiteral)
            return this._translateService.get(`price`);
        else return of(indicatoSeries.Title);
    }

    conditionTitlesTranslate = (conditions: any) => this._translateService.get(`conditionTitles.${conditions}`);

    tradingOrdersStatus = (status: TradingOrdersStatus) => this._translateService.get(`tradingOrderStatus.${status}`);

    constructor(
        _injector: Injector,
        private _dialog: MatDialog,
        private _fb: FormBuilder,
        private _translateService: TranslateService,
        private _instrumentService: InstrumentService,
        private _applicationTypeService: ApplicationTypeService,
        private _autoTradingAlertService: AutoTradingAlertService,
        private _brokerService: BrokerService,
        private _alertService: AlertService,
        private _audioService: AudioService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        super(_injector);


        let alert = null;
        let sourceSettings = null;
        let seriesSet = null;
        if (data !== null) {
            alert = data.alert;
            sourceSettings = data.sourceSettings;
            seriesSet = data.serieses;
        }

        if (sourceSettings) {
            let instrument = sourceSettings.Symbol;
            this.IndicatorCrossingTitles.push(AlertDialogComponent.createArtificialSeries(instrument));
        } else if (alert && alert.dataSource) {
            if (alert.dataSource.dataSourceType === EDataSourceType.IndicatorDataSource) {
                this.IndicatorCrossingTitles.push(alert.dataSource.indicatorSeriesDescription);
            }
        }

        this.IndicatorCrossedTitles.push(AlertDialogComponent.createArtificialSeries(this.priceLiteral));

        if (seriesSet) {
            seriesSet.forEach((element: IndicatorSeriesDescription) => {
                this.IndicatorCrossingTitles.push(element);
                this.IndicatorCrossedTitles.push(element);
            });
        } else if (alert && alert.indicatorSeriesDescription) {
            if (alert.indicatorSeriesDescription.Title !== this.priceLiteral)
                this.IndicatorCrossedTitles.push(alert.indicatorSeriesDescription);
        }

        if (alert)
            this.configuredTrade = alert.configuredTrade;

        const selectedInstrument: IInstrument = this.data && this.data.instrument ? this.data.instrument : null;

        this.alertVM = new AlertViewModel(alert, sourceSettings, _instrumentService, this.IndicatorCrossedTitles[0], this.alertsSound[0], selectedInstrument);
    }

    updateMovingType(condition: EMovingAlertCondition): void {
        this.MovingTypeWithPercent = condition === EMovingAlertCondition.MovingDownPercentage ||
            condition === EMovingAlertCondition.MovingUpPercentage;
    }

    ngOnInit() {
        this.initConditions();
        this._initAlertForm_new(this.alertVM);
    }

    playSound() {
        this._audioService.playSound(this.controls.sound.controls.selectedSound.value);
    }

    cancelOrder() {
        let trade = this.configuredTrade;
        this._dialog.open(CancelOrderComponent, {
            data: {trade}
        }).afterClosed().subscribe(
            (value: string) => {
                if (value == null) {
                    this._resetTradingAction();
                    return;
                }

                let settings: CancelTradeSettings = {
                    OrderId: value,
                    TradeActionType: TradeActionType.Cancel
                };

                this.configuredTrade = settings;
            }
        );
    }

    combineTimeNew(date: any, time: any): number {
        let mdate = moment(date);
        let hours = moment(time, 'HH:mm A');
        let combine = mdate.set('hour', Number(hours.hour())).set('minute', Number(hours.minutes()));

        return moment(combine).valueOf();
    }

    placeOrder() {
        let trade = this.configuredTrade as PlaceTradeSettings;
        let orderConfig: OrderConfig = null;
        let instrument: IInstrument = null;

        if (trade && trade.TradeActionType === TradeActionType.Place) {
            this._instrumentService.getInstrumentsBySymbol(trade.Symbol)
                .subscribe((instruments: IInstrument[]) => {
                    if (instruments && instruments.length > 0)
                        instrument = instruments[0];
                });
            orderConfig = {
                instrument: instrument,
                side: trade.Side as OrderSide,
                amount: trade.Size,
                type: trade.Type as OrderTypes,
                price: trade.Price,
                stopPrice: trade.StopPrice
            };
        }

        this._dialog.open(this._getOrderConfigComponent(), {
            data: {
                tradeConfig: orderConfig,
                skipOrderPlacing: true
            } as ICryptoOrderFormConfig
        })
            .afterClosed()
            .subscribe((data: OrderConfig) => {
                if (data == null) { // canceled
                    this._resetTradingAction();
                    return;
                }

                let settings: PlaceTradeSettings = {
                    Side: data.side,
                    Size: data.amount,
                    Symbol: data.instrument.symbol,
                    Type: data.type,
                    StopPrice: data.stopPrice,
                    Price: data.price,
                    TradeActionType: TradeActionType.Place
                };

                this.configuredTrade = settings;
            });
    }

    setTradingAlertStatus() {
        let status = this.controls.tradingAction.value;
        if (status === TradingOrdersStatus.placeOrderTr) {
            this.placeOrder();
        } else if (status === TradingOrdersStatus.cancelOrderTr) {
            this.cancelOrder();
        }
    }

    onSubmitDialog() {
        const isEditMode = this.data.alert;
        const obs = isEditMode ? this.editAlert(this.data.alert.externalId) : this.createAlert();

        this.processingSubmit = true;
        obs.subscribe({
            next: () => {
                this.processingSubmit = false;
                this.close();
            },
            error: () => {
                this.processingSubmit = false;
            }
        });
    }

    private _getOrderConfigComponent(): any {
        return CryptoOrderConfiguratorModalComponent;
    }

    private _initAlertForm_new(alertVM: AlertViewModel): void {
        this.activeInstrument = alertVM.selectedInstrument;
        this.alertWidgetForm = this._fb.group({
                selectedIndicatorSeries: [{
                    value: alertVM.selectedIndicatorSeries,
                    disabled: !alertVM.isIndicatorDataSourceUsed
                }],
                selectedInstrument: [{
                    value: alertVM.selectedInstrument,
                    disabled: alertVM.isIndicatorDataSourceUsed
                }, [Validators.required]],
                selectedCondition: [alertVM.selectedCondition, Validators.required],

                priceAlert: this._fb.group({
                    indicatorCross: [alertVM.indicatorCross || this.IndicatorCrossedTitles[0]],
                    priceCross: [alertVM.priceCross, [Validators.required]]
                }),

                channelAlert: this._fb.group({
                    upperCross: [alertVM.upperCross, Validators.required],
                    lowerCross: [alertVM.lowerCross, Validators.required]
                }),

                movingAlert: this._fb.group({
                    priceDelta: [alertVM.priceDelta, Validators.required],
                    timeDelta: [alertVM.timeDelta, Validators.required],
                }),

                useExpiration: [alertVM.useExpiration, Validators.required],
                expiration: this._fb.group({
                    expirationDate: [alertVM.expirationDate, Validators.required],
                    expirationTime: [alertVM.expirationTime, Validators.required],
                }),

                showPopUp: [alertVM.showPopUp],

                playSound: [alertVM.playSound],
                sound: this._fb.group({
                    selectedSound: [alertVM.selectedSound || this.alertsSound[0], [Validators.required]],
                }),

                useSMS: [alertVM.useSMS],
                useEmail: [alertVM.useEmail],
                alertMessage: [alertVM.alertMessage],
                tradingAction: [alertVM.tradingAction, [Validators.required]]
            }
        );

        this.controls = this.alertWidgetForm.controls;
        this.priceAlertControls = this.controls.priceAlert.controls;

        const alertType = this._conditionTypes.get(alertVM.selectedCondition);

        if (alertType !== EAlertType.PriceAlert)
            this.controls.priceAlert.disable();
        if (alertType !== EAlertType.ChannelAlert)
            this.controls.channelAlert.disable();
        if (alertType !== EAlertType.MovingAlert)
            this.controls.movingAlert.disable();

        if (this.priceAlertControls.indicatorCross.value &&
            this.priceAlertControls.indicatorCross.value.Title !== this.priceLiteral)
            this.priceAlertControls.priceCross.disable();

        if (!alertVM.playSound)
            this.controls.sound.disable();
        if (!alertVM.useExpiration)
            this.controls.expiration.disable();

        this.controls.selectedCondition.valueChanges.subscribe((value: any) => {
            let alerttype = this._conditionTypes.get(value);
            this.controls.priceAlert.disable();
            this.controls.channelAlert.disable();
            this.controls.movingAlert.disable();

            if (alerttype === EAlertType.PriceAlert) {
                this.controls.priceAlert.enable();
                if (this.priceAlertControls.indicatorCross.value.Title !== this.priceLiteral)
                    this.priceAlertControls.priceCross.disable();
            } else if (alerttype === EAlertType.ChannelAlert) {
                this.controls.channelAlert.enable();
            } else if (alerttype === EAlertType.MovingAlert) {
                this.controls.movingAlert.enable();
            }
            this.updateMovingType(value);
        });

        this.priceAlertControls.indicatorCross.valueChanges.subscribe((value: any) => {
            if (this.controls.priceAlert.enabled)
                (value.Title === this.priceLiteral) ? this.priceAlertControls.priceCross.enable() : this.priceAlertControls.priceCross.disable();
        });

        this.controls.useExpiration.valueChanges.subscribe((checked: boolean) => {
            checked ? this.controls.expiration.enable() : this.controls.expiration.disable();
        });
        this.controls.playSound.valueChanges.subscribe(checked => {
            checked ? this.controls.sound.enable() : this.controls.sound.disable();
        });
        this.controls.selectedInstrument.valueChanges.subscribe(instrument => {
            this.activeInstrument = instrument;
        });
    }

    private _getSourceSettingsNew(): RealtimeSourceSettings {
        let selectedInstrument = this.alertWidgetForm.value.selectedInstrument;
        if (!selectedInstrument) {
            selectedInstrument = this.alertVM.selectedInstrument;
        }
        let sourceSettings: RealtimeSourceSettings = {
            DataSourceType: EDataSourceType.RealtimeDataSource,
            Symbol: selectedInstrument.symbol,
            Exchange: selectedInstrument.exchange,
            Datafeed: selectedInstrument.exchange,
            Type: selectedInstrument.type
        };

        if (this.alertVM.isIndicatorDataSourceUsed && this.controls.selectedIndicatorSeries) {
            if (this.controls.selectedIndicatorSeries.value.Title !== selectedInstrument.Symbol) {
                sourceSettings.DataSourceType = EDataSourceType.IndicatorDataSource;
                (sourceSettings as IndicatorSourceSettings).SeriesDescription = this.controls.selectedIndicatorSeries.value;
            }
        }

        return sourceSettings;
    }

    private _getAlertSettingsNew(): AlertSettings {
        let formValue = this.alertWidgetForm.value;
        let alertType = this._conditionTypes.get(formValue.selectedCondition);
        let settings: AlertSettings = {
            AlertName: JsUtil.generateAlertName(),
            AlertId: JsUtil.generateGUID(),
            AlertType: alertType,
            Condition: formValue.selectedCondition,
            UseExpiration: formValue.useExpiration,
            Expiration: formValue.useExpiration ? this.combineTimeNew(formValue.expiration.expirationDate, formValue.expiration.expirationTime) : 0,
            ShowPopup: formValue.showPopUp,
            PlaySound: formValue.playSound,
            SendSMS: formValue.useSMS,
            // NotificationPhoneNumber: formValue.useSMS ? formValue.phoneNumber : '',
            SendEmail: formValue.useEmail,
            // NotificationEmail: formValue.useEmail ? formValue.emailAddress : '',
            SoundId: formValue.sound ? formValue.sound.selectedSound : '',
            Comment: formValue.alertMessage,
            ConfiguredTrade: this.configuredTrade
        };

        if (formValue.priceAlert) {
            if (formValue.priceAlert.indicatorCross && formValue.priceAlert.indicatorCross.Title !== this.priceLiteral) {
                (settings as IndicatorAlertSettings).IndicatorSeriesDescription = formValue.priceAlert.indicatorCross;
                settings.AlertType = EAlertType.IndicatorAlert;
            } else
                (settings as PriceAlertSettings).Value = formValue.priceAlert.priceCross;
        } else if (formValue.channelAlert) {
            let channelAlertSettings = settings as ChannelAlertSettings;
            channelAlertSettings.Value1 = formValue.channelAlert.upperCross;
            channelAlertSettings.Value2 = formValue.channelAlert.lowerCross;
        } else if (formValue.movingAlert) {
            let movingAlertSettings = settings as MovingAlertSettings;
            movingAlertSettings.Value = formValue.movingAlert.priceDelta;
            movingAlertSettings.Time = formValue.movingAlert.timeDelta;
        }

        return settings;
    }

    public editAlert(id: string): Observable<any> {
        return this._autoTradingAlertService.updateAlert(id, this._getAlertSettingsNew(), this._getSourceSettingsNew())
            .pipe(
                tap({
                    next: () => {
                        this._alertService.success(this._translateService.get('alertUpdated'));
                    },
                    error: (error) => {
                        this._alertService.error(this._translateService.get('failedToEditAlert'));
                        console.error(error);
                    }
                })
            );
    }

    public createAlert(): Observable<any> {
        return this._autoTradingAlertService.createAlert(this._getAlertSettingsNew(), this._getSourceSettingsNew())
            .pipe(
                tap({
                    next: () => {
                        this._alertService.success(this._translateService.get('alertCreated'));
                    },
                    error: (error) => {
                        this._alertService.error(this._translateService.get('failedToCreateAlert'));
                        console.error(error);
                    }
                })
            );
    }

    private _resetTradingAction() {
        this.configuredTrade = null;
        (this.controls.tradingAction as FormControl).setValue(TradingOrdersStatus.noneTr);
    }
}
