import { Component, OnInit } from "@angular/core";
import { ChartData } from "modules/Admin/data/tp-monitoring/TPMonitoringData";
import { AlgoTradingData, DistributionData, GeneralData, TraderData, TradeSimpleData, TradingData } from "modules/Admin/data/tp-monitoring/TPMonitoringDTO";
import { TPMonitoringService } from "modules/Admin/services/tp-monitoring.service";
import { AST_This } from "terser";
import { IChartDataSet, TPChartSettings } from "../chart-components/single-parameter-chart/sp-chart.component.";

export class ChartDescriptor {
    constructor(settings: TPChartSettings, data: ChartData) {
        this.Settings = settings;
        this.Data = data;
    }

    public Settings: TPChartSettings;
    public Data: ChartData;
}

export class NumberDataSet implements IChartDataSet {
    private _dataSet: { [key: number]: number };
    private _isTwoColored: boolean;

    constructor(dataSet: { [key: number]: number }, isTwoColored: boolean = false) {
        this._dataSet = dataSet;
        this._isTwoColored = isTwoColored;
    }
    getPointColor(): string {
        let color = 'gray';
        if (this._isTwoColored) {
            let keys = Object.keys(this._dataSet);
            if (keys.length > 0) {
                let firstVal = this._dataSet[keys[0]];
                let lastVal = this._dataSet[keys[keys.length - 1]];
                if (firstVal > lastVal)
                    color = 'red';
                else
                    color = 'green';
            }
        }
        return color;
    }

    getColors(): string[] {
        let res = new Array<string>();
        let keys = Object.keys(this._dataSet);
        keys.forEach((key) => {
            if (this._isTwoColored) {
                if (this._dataSet[key] < 0)
                    res.push('red');
                else
                    res.push('green');
            } else
                res.push('blue');
        });
        return res;
    }

    getLabels(): string[] {
        return Object.keys(this._dataSet);
    }

    getKeys(): string[] {
        return Object.keys(this._dataSet);
    }

    getValues(): number[] {
        let res = new Array<number>();
        let keys = Object.keys(this._dataSet);
        keys.forEach((key) => {
            res.push(this._dataSet[key]);
        });
        return res;
    }
    getToolTips(): string[][] {
        let res = new Array<Array<string>>();
        Object.keys(this._dataSet).forEach((key) => {
            let arr = new Array<string>();
            let dateUnix = parseInt(key, 10);
            if (dateUnix) {
                let date = new Date(dateUnix * 1000);
                let dt = date.toLocaleDateString();
                arr.push(`${dt}: ${this._dataSet[key]}`);
            } else
                arr.push(`${key}: ${this._dataSet[key]}`);
            res.push(arr);
        });
        return res;
    }
}

export class StringDataSet implements IChartDataSet {
    private _color: string;
    private _total: number;
    private _showPercents: boolean;
    private _dataSet: { [key: string]: number };
    constructor(dataSet: { [key: string]: number }, color: string = null, showPercents: boolean = true) {

        this._color = color;
        this._showPercents = showPercents;
        if (dataSet) {
            this._dataSet = dataSet;
            if (this._showPercents) {
                this._total = 0;
                let keys = Object.keys(this._dataSet);
                keys.forEach((key) => {
                    this._total += this._dataSet[key];
                });
            }
        }
    }

    getPointColor(): string {
        return 'gray';
    }

    getColors(): string[] {
        let res = new Array<string>();
        let keys = Object.keys(this._dataSet);
        keys.forEach((key) => {
            if (this._color)
                res.push(this._color);
            else
                res.push(this._generateRandomColor());
        });
        return res;
    }
    getToolTips(): string[][] {
        let res = new Array<Array<string>>();
        Object.keys(this._dataSet).forEach((key) => {
            let arr = new Array<string>();
            if (this._showPercents) {
                let prercent = Math.roundToDecimals(this._dataSet[key] / this._total * 100, 2);
                arr.push(`${key}: ${this._dataSet[key]} (${prercent}%)`);
            } else {
                arr.push(`${key}: ${this._dataSet[key]}`);
            }
            res.push(arr);
        });
        return res;
    }

    getLabels(): string[] {
        return Object.keys(this._dataSet);
    }

    getKeys(): string[] {
        return Object.keys(this._dataSet);
    }

    getValues(): number[] {
        let res = new Array<number>();
        let keys = Object.keys(this._dataSet);
        keys.forEach((key) => {
            res.push(this._dataSet[key]);
        });
        return res;
    }

    private _generateRandomColor(): string {
        let min = 0;
        let max = 255;
        let red = Math.floor(Math.random() * (max - min + 1));
        let green = Math.floor(Math.random() * (max - min + 1));
        let blue = Math.floor(Math.random() * (max - min + 1));
        return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    }
}

export class TraderDataSet implements IChartDataSet {
    private _dataSet: Array<TraderData>;
    constructor(dataSet: Array<TraderData>) {
        this._dataSet = dataSet;
    }

    getPointColor(): string {
        return 'gray';
    }

    getColors(): string[] {
        let res = new Array<string>();
        this._dataSet.forEach((item) => {
            res.push('blue');
        });
        return res;
    }
    getToolTips(): string[][] {
        let res = new Array<Array<string>>();
        this._dataSet.forEach((item) => {
            let itemRes = new Array<string>();
            itemRes.push(item.userName);
            itemRes.push(item.brokerName);
            itemRes.push(`Profit: ${item.totalProfit}$`);
            res.push(itemRes);
        });
        return res;
    }
    getLabels(): string[] {
        let res = new Array<string>();
        this._dataSet.forEach((item) => {
            /*let label = `${item.userName}/n`+
            `${item.brokerName}</br>`+
            `Profit:${item.totalProfit}`;*/
            res.push('');
        });
        return res;
    }
    getKeys(): string[] {
        return this.getLabels();
    }
    getValues(): number[] {
        let res = new Array<number>();
        this._dataSet.forEach((item) => {
            res.push(item.totalProfit);
        });
        return res;
    }
}

export class TradeDataSet implements IChartDataSet {
    private _dataSet: Array<TradeSimpleData>;
    constructor(dataSet: Array<TradeSimpleData>) {
        this._dataSet = dataSet;
    }

    getPointColor(): string {
        return 'gray';
    }

    getColors(): string[] {
        let res = new Array<string>();
        this._dataSet.forEach((item) => {
            res.push('blue');
        });
        return res;
    }
    getLabels(): string[] {
        let res = new Array<string>();
        this._dataSet.forEach((item) => {
            res.push('');
        });
        return res;
    }
    getKeys(): string[] {
        return this.getLabels();
    }
    getValues(): number[] {
        let res = new Array<number>();
        this._dataSet.forEach((item) => {
            res.push(item.profit);
        });
        return res;
    }
    getToolTips(): string[][] {
        let res = new Array<Array<string>>();
        this._dataSet.forEach((item) => {
            let itemRes = new Array<string>();
            itemRes.push(item.userName);
            itemRes.push(`Ticket: ${item.ticket}`);
            itemRes.push(`Symbol: ${item.symbol}`);
            itemRes.push(`Lots: ${item.lots}`);
            itemRes.push(`Profit: ${item.profit}$`);
            res.push(itemRes);
        });
        return res;
    }

}

@Component({
    selector: 'tp-monitoring-general-data',
    templateUrl: 'tp-monitoring-general-data.component.html',
    styleUrls: ['tp-monitoring-general-data.component.scss']
})
export class TPMonitoringGeneralDataComponent implements OnInit {

    constructor(private _tpMonitoringService: TPMonitoringService) { }

    AllCharts: Array<ChartDescriptor> = new Array<ChartDescriptor>();

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loadDistributionData();
        this.loadTradingData();
        this.loadAlgoTradingData();
        this.loadTradedVolume();
    }

    private loadDistributionData(): void {
        this._tpMonitoringService.getDistributionData()
            .subscribe((data: DistributionData) => {
                if (data) {
                    let arr = new Array<ChartDescriptor>();
                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Account's Currencies", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.accountCurrencies) as IChartDataSet }
                    ));
                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Account Types", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.accountTypes) as IChartDataSet }
                    ));
                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Brokers", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.brokers) as IChartDataSet }
                    ));
                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Countries(MT5)", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.countries) as IChartDataSet }
                    ));

                    this.AllCharts.forEach((item: ChartDescriptor) => {
                        arr.push(item);
                    });
                    this.AllCharts = new Array<ChartDescriptor>();
                    this.AllCharts = arr;
                }
            });
    }

    private loadTradingData(): void {
        this._tpMonitoringService.getTradingData()
            .subscribe((data: TradingData) => {
                if (data) {
                    let arr = new Array<ChartDescriptor>();

                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Top Winners (Real)", chartType: "bar", ratio: 1.2 },
                        <ChartData>{ DataSet: new TraderDataSet(data.topWinners) as IChartDataSet }
                    ));

                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Top Losers (Real)", chartType: "bar", ratio: 1.2 },
                        <ChartData>{ DataSet: new TraderDataSet(data.topLosers) as IChartDataSet }
                    ));

                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Best Trades (Real)", chartType: "bar", ratio: 1.2 },
                        <ChartData>{ DataSet: new TradeDataSet(data.bestTrades) as IChartDataSet }
                    ));

                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Worst Trades (Real)", chartType: "bar", ratio: 1.2 },
                        <ChartData>{ DataSet: new TradeDataSet(data.worstTrades) as IChartDataSet }
                    ));

                    this.AllCharts.forEach((item: ChartDescriptor) => {
                        arr.push(item);
                    });
                    this.AllCharts = new Array<ChartDescriptor>();
                    this.AllCharts = arr;
                }
            });
    }

    private loadAlgoTradingData(): void {
        this._tpMonitoringService.getAlgoTradingData()
            .subscribe((data: AlgoTradingData) => {
                if (data) {
                    let arr = new Array<ChartDescriptor>();
                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Algo trades types (Demo&Real)", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.algoTradesByType) as IChartDataSet }
                    ));

                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Algo trades timeframes(Demo&Real)", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.algoTradesByTF) as IChartDataSet }
                    ));

                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Algo trades result(Demo&Real)", chartType: "doughnut", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(data.algoTradesByResult) as IChartDataSet }
                    ));

                    this.AllCharts.forEach((item: ChartDescriptor) => {
                        arr.push(item);
                    });
                    this.AllCharts = new Array<ChartDescriptor>();
                    this.AllCharts = arr;
                }
            });
    }

    private loadTradedVolume(): void {
        this._tpMonitoringService.getTradedVolume()
            .subscribe((data: { [key: number]: number }) => {
                if (data) {                    
                    let strData: { [key: string]: number } = {};
                    let keys = Object.keys(data);
                    keys.forEach((key) => {
                        let dateUnix = parseInt(key, 10);
                        let date = new Date(dateUnix * 1000);
                        let dt = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                        strData[dt] = data[key];
                    });

                    let arr = new Array<ChartDescriptor>();
                    arr.push(new ChartDescriptor(
                        <TPChartSettings>{ chartHeader: "Traded volume(Real, $M)", chartType: "bar", ratio: 1.2 },
                        <ChartData>{ DataSet: new StringDataSet(strData, 'blue', false) as IChartDataSet }
                    ));
                    this.AllCharts.forEach((item: ChartDescriptor) => {
                        arr.push(item);
                    });
                    this.AllCharts = new Array<ChartDescriptor>();
                    this.AllCharts = arr;
                }
            });
    }
}