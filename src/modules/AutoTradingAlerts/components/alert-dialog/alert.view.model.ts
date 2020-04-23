import { AlertBase } from 'modules/AutoTradingAlerts/models/AlertBase';
import { EPriceAlertCondition, EChannelAlertCondition, EMovingAlertCondition, EAlertType, EDataSourceType } from 'modules/AutoTradingAlerts/models/Enums';
import { ChannelAlertSettings, PriceAlertSettings, MovingAlertSettings, IndicatorAlertSettings, AlertSettings } from 'modules/AutoTradingAlerts/models/AlertSettingsBase';
import { InstrumentService } from '@app/services/instrument.service';
import { EExchange } from '@app/models/common/exchange';
import { IInstrument } from '@app/models/common/instrument';
import { TradeSettings } from 'modules/AutoTradingAlerts/models/TradeSettingsBase';
import { TradeActionType } from 'modules/Trading/models/models';
import { IndicatorDataSource } from 'modules/AutoTradingAlerts/models/dataSources/IndicatorDataSource';
import { IndicatorSeriesDescription } from 'modules/AutoTradingAlerts/models/dataSources/IndicatorSeriesDescription';
import { AlertSourceSettings, IndicatorSourceSettings, RealtimeSourceSettings } from 'modules/AutoTradingAlerts/models/AlertSourceSettingsBase';
import { RealtimeDataSource } from 'modules/AutoTradingAlerts/models/dataSources/RealtimeDataSource';

export enum TradingOrdersStatus {
    placeOrderTr = 'PlaceOrder',
    cancelOrderTr = 'CancelOrder',
    noneTr = 'None'
}

export class AlertViewModel {
    constructor(
        private alert: AlertBase,
        // private targetSeries: IndicatorSeriesDescription,
        private alertSourceSettings: AlertSourceSettings,
        private instrumentService: InstrumentService,
        private defaultCrossed: IndicatorSeriesDescription,
        private defaultSound: string,
        private _selectedInstrument?: IInstrument
    ) {
        if (_selectedInstrument) {
            this.selectedInstrument = _selectedInstrument;
        }
        if (alert !== null && alert !== undefined) {
            let realTimeDataSource = alert.dataSource as RealtimeDataSource;
            instrumentService.getInstrumentBySymbol(realTimeDataSource.relatedSymbol, realTimeDataSource.relatedExchange as EExchange)
                .subscribe(instrument => {
                    if (instrument)
                        this.selectedInstrument = instrument;
                });

            let indicatorDataSource = alert.dataSource as IndicatorDataSource;
            if (indicatorDataSource.dataSourceType === EDataSourceType.IndicatorDataSource) {
                this.isIndicatorDataSourceUsed = true;
                this.selectedIndicatorSeries = indicatorDataSource.indicatorSeriesDescription;                
            }            

            let alertSettings = alert.getSettings();
            this.selectedCondition = alertSettings.Condition;

            if (alertSettings.AlertType === EAlertType.PriceAlert) {
                this.priceCross = (alertSettings as PriceAlertSettings).Value;
                this.indicatorCross = defaultCrossed;
            } else if (alertSettings.AlertType === EAlertType.ChannelAlert) {
                this.upperCross = (alertSettings as ChannelAlertSettings).Value1;
                this.lowerCross = (alertSettings as ChannelAlertSettings).Value2;
            } else if (alertSettings.AlertType === EAlertType.MovingAlert) {
                this.priceDelta = (alertSettings as MovingAlertSettings).Value;
                this.timeDelta = (alertSettings as MovingAlertSettings).Time;
            } else if (alertSettings.AlertType === EAlertType.IndicatorAlert) {
                let series = (alertSettings as IndicatorAlertSettings).IndicatorSeriesDescription;
                if (series.Title === defaultCrossed.Title)
                    this.indicatorCross = defaultCrossed;
                else
                    this.indicatorCross = series;
            }

            this.useExpiration = alertSettings.UseExpiration;
            this.expirationDate = new Date(alertSettings.Expiration).toISOString();
            this.expirationTime = moment(alertSettings.Expiration).format('LT');
            this.showPopUp = alertSettings.ShowPopup;
            this.playSound = alertSettings.PlaySound;
            this.selectedSound = alertSettings.SoundId;

            this.useSMS = alertSettings.SendSMS;
            // !(typeof alertSettings.NotificationPhoneNumber === 'undefined' || alertSettings.NotificationPhoneNumber === null || alertSettings.NotificationPhoneNumber === '');
            // this.phoneNumber = alertSettings.NotificationPhoneNumber;
            this.useEmail = alertSettings.SendEmail;
            // !(typeof alertSettings.NotificationEmail === 'undefined' || alertSettings.NotificationEmail === null || alertSettings.NotificationEmail === '');
            // this.emailAddress = alertSettings.NotificationEmail;
            this.alertMessage = alertSettings.Comment;

            if (alertSettings.ConfiguredTrade) {
                if (alertSettings.ConfiguredTrade.TradeActionType === TradeActionType.Place)
                    this.tradingAction = TradingOrdersStatus.placeOrderTr;
                else if (alertSettings.ConfiguredTrade.TradeActionType === TradeActionType.Cancel)
                    this.tradingAction = TradingOrdersStatus.cancelOrderTr;
            } else {
                this.tradingAction = TradingOrdersStatus.noneTr;
            }
        } else {
            if (alertSourceSettings) {
                let realTimeDataSource = alertSourceSettings as RealtimeSourceSettings;
                instrumentService.getInstrumentBySymbol(realTimeDataSource.Symbol, realTimeDataSource.Exchange as EExchange)
                    .subscribe(instrument => {
                        if (instrument)
                            this.selectedInstrument = instrument;
                    });
                let indicatorSourceSettings = alertSourceSettings as IndicatorSourceSettings;
                if (indicatorSourceSettings.DataSourceType === EDataSourceType.IndicatorDataSource) {
                    this.isIndicatorDataSourceUsed = true;
                    this.selectedIndicatorSeries = indicatorSourceSettings.SeriesDescription;
                }
            }
            this.indicatorCross = defaultCrossed;
            this.expirationDate = new Date().toISOString();
            this.expirationTime = moment(new Date()).format('LT');
            this.selectedSound = defaultSound;
        }

        if (this.selectedInstrument === null)
            instrumentService.getInstruments(EExchange.any).subscribe(values => {
                if (values && values.length)
                    this.selectedInstrument = values[0];
            });
    }

    isIndicatorDataSourceUsed: boolean = false;
    selectedInstrument: IInstrument = null;
    selectedIndicatorSeries: IndicatorSeriesDescription = null;
    indicatorCross: IndicatorSeriesDescription = null;
    selectedCondition: EPriceAlertCondition | EChannelAlertCondition | EMovingAlertCondition = EPriceAlertCondition.Crossing;
    priceCross: number = 0;
    upperCross: number = 0;
    lowerCross: number = 0;
    priceDelta: number = 0;
    timeDelta: number = 0;

    useExpiration: boolean = false;
    expirationDate: string = '';
    expirationTime: string = '';

    showPopUp: boolean = false;
    playSound: boolean = false;
    selectedSound: string = '';

    useSMS: boolean = false;
    phoneNumber: string = '';
    useEmail: boolean = false;
    emailAddress: string = '';

    alertMessage: string = '';
    tradingAction: TradingOrdersStatus = TradingOrdersStatus.noneTr;

    IndicatorCrossingTitles: Array<IndicatorSeriesDescription> = new Array();
    IndicatorCrossedTitles: Array<IndicatorSeriesDescription> = new Array();

    static createArtificialSeries(title: string): IndicatorSeriesDescription {
        return {
            IndicatorName: '',
            SeriesName: '',
            SeriesIndex: 0,
            IndicatorParameters: [],
            Title: title,
        } as IndicatorSeriesDescription;
    }
}
