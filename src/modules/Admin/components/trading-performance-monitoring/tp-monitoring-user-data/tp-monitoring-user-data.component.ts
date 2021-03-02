import { Component, Input, OnInit } from "@angular/core";
import { ChartData, ChartDataArgs, Grouping, MTAccData, Periods } from "modules/Admin/data/tp-monitoring/TPMonitoringData";
import { MTAccountPerformanceData, UserBalanceResponse, UserOrdersResponse } from "modules/Admin/data/tp-monitoring/TPMonitoringDTO";
import { TPMonitoringService } from "modules/Admin/services/tp-monitoring.service";
import { TPChartSettings } from "../chart-components/single-parameter-chart/sp-chart.component.";
import { NumberDataSet } from "../tp-monitoring-general-data/tp-monitoring-general-data.component";

@Component({
    selector: 'tp-monitoring-user-data',
    templateUrl: 'tp-monitoring-user-data.component.html',
    styleUrls: ['tp-monitoring-user-data.component.scss']
})
export class TPMonitoringUserDataComponent implements OnInit {
    constructor(private _tpMonitoringService: TPMonitoringService) {
    }   

    UserAccounts: Array<MTAccData>;
    public showSpinner: boolean;
    selectedMTAccount: MTAccData;
    public showUsersCharts: boolean;

    BalanceChartSettings: TPChartSettings = new TPChartSettings();
    TradesChartSettings: TPChartSettings = new TPChartSettings();

    BalanceChartData: ChartData = new ChartData();
    TradesChartData: ChartData = new ChartData();

    AccountData: MTAccountPerformanceData = new MTAccountPerformanceData();

    @Input() set Accounts(accounts: Array<MTAccData>) {
        this.reset();
        this.UserAccounts = accounts;
    }
    
    ngOnInit(): void {
        this.BalanceChartSettings.chartHeader = 'Balance History';
        this.BalanceChartSettings.chartType = 'line';
        this.BalanceChartSettings.showPeriodOption = true;
        this.BalanceChartSettings.updateOnPeriodChange = true;
        this.BalanceChartSettings.ratio = 2;

        this.TradesChartSettings.chartHeader = 'Trades History';
        this.TradesChartSettings.chartType = 'bar';
        this.TradesChartSettings.showGroupOption = true;
        this.TradesChartSettings.showPeriodOption = true;
        this.BalanceChartSettings.ratio = 2;

        this.BalanceChartData.Grouping = Grouping.Separate;
        this.BalanceChartData.Period = Periods.AllTime;
    }

    public onSelectMTAccount(mtAccount: MTAccData): void {
        this.showUsersCharts = false;
        if (this.selectedMTAccount != null) {
            this.selectedMTAccount.isSelected = false;
        }
        this.selectedMTAccount = mtAccount;
        this.selectedMTAccount.isSelected = true;
        this.LoadTradingHistory();
    }

    private reset(): void {
        this.BalanceChartData = new ChartData();
        this.TradesChartData = new ChartData();
        this.AccountData = new MTAccountPerformanceData();
    }

    updateBalanceChart(args: ChartDataArgs) {
        this.loadBalanceHistory(args.Period);
    }

    updateTradesChart(args: ChartDataArgs) {
        this.loadTradesHistory(args.Period, args.Grouping);
    }

    private loadBalanceHistory(period: Periods) {
        this._tpMonitoringService.getUserBalanceHistory(this.selectedMTAccount.identityId, this.selectedMTAccount.number,
            this.selectedMTAccount.mtPlatform, period).subscribe(
                (result: UserBalanceResponse) => {
                    let balanceChartData = new ChartData();
                    balanceChartData.DataSet = new NumberDataSet(result.balanceHistory, true);
                    balanceChartData.Period = result.period;
                    this.BalanceChartData = balanceChartData;
                });
    }

    private loadTradesHistory(period: Periods, group: Grouping) {
        this.showUsersCharts = true;
        this._tpMonitoringService.getUserOrdersHistory(this.selectedMTAccount.identityId, this.selectedMTAccount.number,
            this.selectedMTAccount.mtPlatform, period, group).subscribe(
                (result: UserOrdersResponse) => {
                    let tradesChartData = new ChartData();
                    tradesChartData.DataSet = new NumberDataSet(result.ordersHistory, true);
                    tradesChartData.Period = result.period;
                    tradesChartData.Grouping = result.grouping;
                    this.TradesChartData = tradesChartData;
                });
    }

    private LoadTradingHistory(): void {
        this.loadUserAccPerformanceData();
        this.loadBalanceHistory(Periods.Last7Days);
        this.loadTradesHistory(Periods.Last7Days, Grouping.Daily);
    }

    private loadUserAccPerformanceData(): void {
        this.showSpinner = true;
        this._tpMonitoringService.getUserAccountPerformanceData(this.selectedMTAccount.identityId, this.selectedMTAccount.number,
            this.selectedMTAccount.mtPlatform).subscribe(
                (result: MTAccountPerformanceData) => {
                    this.AccountData = result;
                    this.showSpinner = false;
                });
    }
}