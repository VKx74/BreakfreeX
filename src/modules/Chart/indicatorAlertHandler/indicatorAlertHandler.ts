import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';

export class IndicatorAlertHandler implements TradingChartDesigner.IIndicatorAlertsHandler {

    constructor(private _alertService: AlertsService) {

    }
    
    public canCreateAlertOnIndicator(indicator: TradingChartDesigner.Indicator, chart: TradingChartDesigner.Chart): boolean {
        return false;
    }    
    
    public createAlertOnIndicator(indicator: TradingChartDesigner.Indicator, chart: TradingChartDesigner.Chart): void {
       
    }

    private _getNameDyDataRows(dataRows: TradingChartDesigner.DataRows[]): string {
        for (let i = 0; i < dataRows.length; i++) {
            if (!dataRows[i].name.startsWith(".")) {
                return dataRows[i].name;
            }
        }   
    }
}
