import { AutoTradingAlertConfigurationService } from 'modules/AutoTradingAlerts/services/auto-trading-alert-configuration.service';
import { IndicatorSeriesDescription, IndicatorParameter } from 'modules/AutoTradingAlerts/models/dataSources/IndicatorSeriesDescription';

export class IndicatorAlertHandler implements TradingChartDesigner.IIndicatorAlertsHandler {

    constructor(private _alertService: AutoTradingAlertConfigurationService) {

    }
    
    public canCreateAlertOnIndicator(indicator: TradingChartDesigner.Indicator, chart: TradingChartDesigner.Chart): boolean {
        return true;
    }    
    
    public createAlertOnIndicator(indicator: TradingChartDesigner.Indicator, chart: TradingChartDesigner.Chart): void {
        let symbol: string, exchange: string, series: IndicatorSeriesDescription[] = [], selectedSeries: IndicatorSeriesDescription;

        symbol = chart.instrument.symbol;
        exchange = chart.instrument.exchange;
        const indicators = chart.indicators;

        for (let i = 0; i < indicators.length; i++) {
            const ind = indicators[i];
            const plots = ind.plots;
            for (let j = 0; j < plots.length; j++) {
                const plot = plots[j];
                const props = this._getParametersItems(ind.refreshParamtersTitles());
                const uiProps: string[] = [];
                const seriesName = this._getNameDyDataRows(plot.dataRows);

                props.forEach(element => {
                    uiProps.push(element.Value.toString());
                });

                let title = `${ind.name}(${uiProps.join(', ')})`;
                if (plots.length > 1) {
                    title  = `${title}.${seriesName}`;
                }

                series.push({
                    IndicatorName: ind.name,
                    SeriesIndex: j,
                    SeriesName: seriesName,
                    IndicatorParameters: props,
                    Title: title
                });

                if (indicator === ind && !selectedSeries) {
                    selectedSeries = series[series.length - 1];
                }
            }
        }

        this._alertService.createSeriesAlert(symbol, exchange, series, selectedSeries);
    }

    private _getNameDyDataRows(dataRows: TradingChartDesigner.DataRows[]): string {
        for (let i = 0; i < dataRows.length; i++) {
            if (!dataRows[i].name.startsWith(".")) {
                return dataRows[i].name;
            }
        }   
    }

    private _getParametersItems(items: TradingChartDesigner.IIndicatorTitleParameterItem[]): IndicatorParameter[] {
        const res: IndicatorParameter[] = [];
        for (let i = 0; i < items.length; i++) {
            res.push({
                Name: items[i].parameterName,
                Value: items[i].value
            });
        }   

        return res;
    }
}
