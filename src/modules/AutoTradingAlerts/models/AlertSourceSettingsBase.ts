import {EDataSourceType} from "./Enums";
import {EMarketType} from "@app/models/common/marketType";
import {EExchange} from "@app/models/common/exchange";
import { IndicatorSeriesDescription } from './dataSources/IndicatorSeriesDescription';

export class AlertSourceSettings {
    DataSourceType: EDataSourceType;
}

export class RealtimeSourceSettings extends AlertSourceSettings {
    Symbol: string;
    Datafeed: string;
    Exchange: EExchange;
    Type: EMarketType;
}

export class IndicatorSourceSettings extends RealtimeSourceSettings {
    SeriesDescription: IndicatorSeriesDescription;
}