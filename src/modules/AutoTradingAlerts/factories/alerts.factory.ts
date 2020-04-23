import {Injectable, Injector} from "@angular/core";
import {Observable, of} from "rxjs";
import {EAlertType} from "../models/Enums";
import {AlertBase} from "../models/AlertBase";
import {AlertSettings} from "../models/AlertSettingsBase";
import {PriceAlert} from "../models/alerts/PriceAlert";
import {AlertDataSourceFactory} from "./alert-data-source.factory";
import {AlertSourceSettings} from "../models/AlertSourceSettingsBase";
import {ChannelAlert} from "../models/alerts/ChannelAlert";
import {MovingAlert} from "../models/alerts/MovingAlert";
import { IndicatorAlert } from '../models/alerts/IndicatorAlert';

@Injectable()
export class AlertsFactory {
    constructor(private _injector: Injector, private _dataSourceFactory: AlertDataSourceFactory) {
    }

    tryCreateInstance(settings: AlertSettings, dataSourceSettings: AlertSourceSettings): Observable<AlertBase> {
        return new Observable<AlertBase>(subscriber => {
            this._dataSourceFactory.tryCreateInstance(dataSourceSettings).subscribe(value => {
                const dataSource = value;
                let alert: AlertBase = this._getInstance(settings.AlertType);

                if (alert) {
                    try {
                        alert.dataSource = dataSource;
                        alert.applySettings(settings);
                        subscriber.next(alert);
                        subscriber.complete();
                    } catch (e) {
                        subscriber.error(e.message);
                        subscriber.complete();
                    }
                } else {
                    subscriber.error('Failed to create alert');
                    subscriber.complete();
                }
            }, error => {
                subscriber.error(error);
                subscriber.complete();
            });
        });
    }

    private _getInstance(type: EAlertType): AlertBase {
        switch (type) {
            case EAlertType.PriceAlert:
                return new PriceAlert();
            case EAlertType.ChannelAlert:
                return new ChannelAlert();
            case EAlertType.MovingAlert:
                return new MovingAlert();
            case EAlertType.IndicatorAlert:
                return new IndicatorAlert();
            default:
                return null;
        }
    }
}
