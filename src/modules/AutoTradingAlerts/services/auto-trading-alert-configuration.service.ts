import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AlertBase } from '../models/AlertBase';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';
import { IndicatorSeriesDescription } from '../models/dataSources/IndicatorSeriesDescription';
import { IndicatorAlertSettings } from '../models/AlertSettingsBase';
import { JsUtil } from 'utils/jsUtil';
import { EAlertType, EPriceAlertCondition, EDataSourceType } from '../models/Enums';
import { IndicatorSourceSettings } from '../models/AlertSourceSettingsBase';
import { EExchange } from '@app/models/common/exchange';
import { EMarketType } from '@app/models/common/marketType';
import { AutoTradingAlertService } from './auto-trading-alert.service';

@Injectable()
export class AutoTradingAlertConfigurationService {

    constructor(private _dialog: MatDialog) {

    }

    createDefaultPriceAlert() {
        this._dialog.open(AlertDialogComponent, {
            data: {}
        });
    }

    createSeriesAlert(symbol: string, exchange: string, series: IndicatorSeriesDescription[], selectedSeries?: IndicatorSeriesDescription) {
        console.log(series);
        // const s: IndicatorAlertSettings = {
        //     AlertName: JsUtil.generateAlertName(),
        //     AlertId: JsUtil.generateGUID(),
        //     AlertType: EAlertType.IndicatorAlert,
        //     Condition: EPriceAlertCondition.Crossing,
        //     UseExpiration: false,
        //     Expiration: Date.now(),
        //     ShowPopup: true,
        //     PlaySound: true,
        //     SoundId: "sound1",
        //     Comment: "",
        //     IndicatorSeriesDescription: series[0]
        // };
        const d: IndicatorSourceSettings = {
            DataSourceType: EDataSourceType.IndicatorDataSource,
            Symbol: symbol,
            Exchange: exchange as EExchange,
            Datafeed: exchange,
            Type: EMarketType.Crypto,
            SeriesDescription: selectedSeries || series[0]
        };

        // this._autoTradingAlertService.createAlert(s, d)
        //     .subscribe(value => {
        //         console.log(value);
        //     }, error => {
        //         console.log(error);
        //     });


        this._dialog.open(AlertDialogComponent, {
            data: {
                sourceSettings: d,
                serieses: series
            }
        });
    }

    editAlert(alert: AlertBase) {
        this._dialog.open(AlertDialogComponent, {
            data: { alert: alert }
        });
    }
}
