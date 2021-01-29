import { Component, OnInit } from "@angular/core";
import { BrokerService } from "@app/services/broker.service";
import { MTBroker } from "@app/services/mt/mt.broker";
import { Period, TradingPerformanceService, UserTradingPerformAdditionalData, UserTradingPerformanceData } from "modules/BreakfreeTrading/services/tradingPerformance.service";
import { ChartWrapperSettings } from "./model/ChartWrapperSettings";

export class PeriodDescriptor {    
    constructor(id: Period, name: string) {
        this.id = id;
        this.name = name;
    }
    public id: Period;
    public name: string;
    public isSelected: boolean;
}

@Component({
    selector: 'user-trading-performance',
    templateUrl: 'tradingPerformance.component.html',
    styleUrls: ['tradingPerformance.component.scss']
})
export class TradingPerformanceComponent implements OnInit {
    // TTesst:ChartWrapperSettings = new ChartWrapperSettings(0, 'Cumulative PnL(%)','line');    
    ChartsSettingsSet: Array<ChartWrapperSettings>;
    ChartDataSet: Array<{[key: number]: number}> = new Array<{[key: number]: number}>();
    periodSelectors: Array<PeriodDescriptor> = new Array<PeriodDescriptor>();
    selectedPeriod: PeriodDescriptor;

    public showSpinner: boolean = false;
    EstBalance: number;    
    AccCurency: string;
    EstBalanceUSD: string;
    DailyPnLVal: string;
    DailyPnLsign: number;
    DailyPnLValPercent: string;
    MonthlyPnLVal: string;
    MonthlyPnLsign: number;
    MonthlyPnLValPercent: string;

    constructor(private _tradingPerformanceService: TradingPerformanceService,
        private _brokerService: BrokerService) {
            this.ChartDataSet.push({0: 0});
            this.ChartDataSet.push({0: 0});
            this.ChartDataSet.push({0: 0});
            this.ChartsSettingsSet = new Array<ChartWrapperSettings>();
            this.ChartsSettingsSet.push(new ChartWrapperSettings(0, 'Cumulative PnL', 'line', '%'));
            this.ChartsSettingsSet.push(new ChartWrapperSettings(1, 'Daily PnL', 'bar', 'UAH'));
            this.ChartsSettingsSet.push(new ChartWrapperSettings(2, 'Balance', 'line', 'UAH'));            
            
            this.periodSelectors.push(new PeriodDescriptor(Period.Last7Days, "Last 7 days"));
            this.periodSelectors.push(new PeriodDescriptor(Period.Last30Days, "Last 30 days"));
            this.periodSelectors.push(new PeriodDescriptor(Period.Last90Days, "Last 90 days"));
        }
    
    public selectPeriod(periodDescriptor: PeriodDescriptor) {
        if (this.selectedPeriod != null) {
            this.selectedPeriod.isSelected = false;
        }
        periodDescriptor.isSelected = true;
        this.selectedPeriod = periodDescriptor;
        this.loadData(this.selectedPeriod.id);
    }

    ngOnInit(): void {        
        this.selectPeriod(this.periodSelectors[0]);        
    }    

    public get isBrokerConnected(): boolean {
        return this._brokerService.activeBroker instanceof MTBroker;
    }

    private loadData(period: Period) {
        let activeBroker = this._brokerService.getActiveBroker();
        if (activeBroker) {
            this.showSpinner = true;
            this._tradingPerformanceService.getTradingPerformance(activeBroker.account, activeBroker.brokerType, period)
            .subscribe((result: UserTradingPerformanceData) => {
                this.ChartDataSet[0] = result.cumulativePnL;
                this.ChartDataSet[1] = result.dailyPnL;
                this.ChartDataSet[2] = result.balanceHistory;
                this.AccCurency = result.accCurency;
                this.ChartsSettingsSet[1].unit = this.AccCurency;
                this.ChartsSettingsSet[2].unit = this.AccCurency;
                
                this.showSpinner = false;                
                console.log("RResult:");
                console.log(result);
            }, (error: any) => {         
                this.showSpinner = false;       
                console.log("Error:");
                console.log(error);
            });
            if (!this.DailyPnLVal) {
                this._tradingPerformanceService.getTradingPerformanceAdditionalParams(activeBroker.account, activeBroker.brokerType)
                .subscribe((result: UserTradingPerformAdditionalData) => {
                    this.updateParameters(result);
                    }, (error: any) => {});
            }
        }
    }

    private updateParameters(tradingPerformanceData: UserTradingPerformAdditionalData): void {
        this.EstBalance = tradingPerformanceData.estBalance;
        this.AccCurency = tradingPerformanceData.accCurency;
        // this.EstBalanceUSD = `${this.AccCurency} = $${tradingPerformanceData.estBalanceUSD}`; !!!
        this.EstBalanceUSD = `${this.AccCurency}`;
        
        let dailyPnLsign = '';
        if (tradingPerformanceData.dailyPnLVal > 0) {
            dailyPnLsign = '+';
            this.DailyPnLsign = 1;
        } else if (tradingPerformanceData.dailyPnLVal < 0) {
            dailyPnLsign = '-';   
            this.DailyPnLsign = -1;     
        }
        this.DailyPnLVal = `${dailyPnLsign}$${Math.abs(tradingPerformanceData.dailyPnLVal)}`;
        this.DailyPnLValPercent = `${dailyPnLsign}${Math.abs(tradingPerformanceData.dailyPnLValPercent)}%`;

        let monthlyPnLsign = '';
        if (tradingPerformanceData.monthlyPnLVal > 0) {
            monthlyPnLsign = '+';
            this.MonthlyPnLsign = 1;
        } else if (tradingPerformanceData.monthlyPnLVal < 0) {
            monthlyPnLsign = '-';        
            this.MonthlyPnLsign = -1;
        }
        this.MonthlyPnLVal = `${monthlyPnLsign}$${Math.abs(tradingPerformanceData.monthlyPnLVal)}`;
        this.MonthlyPnLValPercent = `${monthlyPnLsign}${Math.abs(tradingPerformanceData.monthlyPnLValPercent)}%`;
    }
}