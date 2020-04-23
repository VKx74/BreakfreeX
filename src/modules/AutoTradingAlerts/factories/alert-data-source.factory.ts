import {Injectable, Injector} from "@angular/core";
import {Observable, of, throwError} from "rxjs";
import {AlertDataSourceBase} from "../models/AlertDataSourceBase";
import {EDataSourceType} from "../models/Enums";
import {RealtimeDataSource} from "../models/dataSources/RealtimeDataSource";
import {RealtimeService} from "@app/services/realtime.service";
import {AlertSourceSettings} from "../models/AlertSourceSettingsBase";
import {InstrumentService} from "@app/services/instrument.service";
import { IndicatorDataSource } from '../models/dataSources/IndicatorDataSource';

@Injectable()
export class AlertDataSourceFactory {
    constructor(private _injector: Injector) {
    }

    tryCreateInstance(settings: AlertSourceSettings): Observable<AlertDataSourceBase> {
        let ds: AlertDataSourceBase = this._getInstance(settings);

        if (ds) {
            try {
                ds.init(settings);
                return of(ds);
            } catch (e) {
                throwError(e.message);
            }
        } else {
            throwError('Failed to createNew data source');
        }
    }

    private _getInstance(settings: AlertSourceSettings): AlertDataSourceBase {
        switch (settings.DataSourceType) {
            case EDataSourceType.RealtimeDataSource:
                const realtimeService: RealtimeService = this._injector.get(RealtimeService);
                const instrumentService: InstrumentService = this._injector.get(InstrumentService);
                return new RealtimeDataSource(realtimeService, instrumentService);
            case EDataSourceType.IndicatorDataSource:
                return new IndicatorDataSource();
            default:
                return null;
        }
    }
}
