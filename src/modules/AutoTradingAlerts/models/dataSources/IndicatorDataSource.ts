import { AlertDataSourceBase } from "../AlertDataSourceBase";
import { EDataSourceType } from "../Enums";
import { Error } from "tslint/lib/error";
import { IInstrument } from "../../../../app/models/common/instrument";
import { IndicatorSourceSettings } from "../AlertSourceSettingsBase";
import { EExchange } from "@app/models/common/exchange";
import { EMarketType } from "@app/models/common/marketType";
import { IndicatorSeriesDescription } from './IndicatorSeriesDescription';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

export class IndicatorDataSource extends AlertDataSourceBase {
    protected _indicatorSeriesDescription: IndicatorSeriesDescription;
    protected _symbol: string;
    protected _datafeed: EExchangeInstance;
    protected _exchange: EExchange;
    protected _type: EMarketType;
    protected _instrument: IInstrument;
    get instrument(): IInstrument {
        return this._instrument;
    }
    get relatedSymbol(): string {
        return this._symbol;
    }
    get relatedExchange(): string {
        return this._exchange;
    }
    get dataSourceType(): EDataSourceType {
        return EDataSourceType.IndicatorDataSource;
    }
    get indicatorSeriesDescription(): IndicatorSeriesDescription {
        return this._indicatorSeriesDescription;
    }
    public getSettings(): IndicatorSourceSettings {
        return {
            DataSourceType: this.dataSourceType,
            Symbol: this._symbol,
            Type: this._type,
            Exchange: this._exchange,
            Datafeed: this._datafeed,
            SeriesDescription: this.indicatorSeriesDescription
        };
    }
    public init(value: IndicatorSourceSettings) {
        if (this._symbol) {
            throw new Error('Data source already initialized');
        }
        this._symbol = value.Symbol;
        this._exchange = value.Exchange;
        this._type = value.Type;
        this._datafeed = value.Datafeed;
        this._indicatorSeriesDescription = value.SeriesDescription;
    }
    public subscribeToSourceChanged(subscription: () => void) {
    }
    public unsubscribeFromSourceChanged(subscription: () => void) {
    }
    public dispose() {
    }
    public getDescription(): string {
        return this.indicatorSeriesDescription.Title;
    }
}
