import { IChartDataSet } from "modules/Admin/components/trading-performance-monitoring/chart-components/single-parameter-chart/sp-chart.component.";
import { MTAccountDTO } from "./TPMonitoringDTO";

export class MTAccData {
    constructor(mtAccountDTO: MTAccountDTO) {
        this.mtPlatform = mtAccountDTO.mtPlatform;
        this.name = mtAccountDTO.name;
        this.number = mtAccountDTO.number;
    }
    public identityId: string;
    public number: number;
    public name: string;
    public mtPlatform: string;
    public isSelected: boolean;
}

export class UserMTData {
    constructor(
        id: string,
        userName: string,
        email: string,
        mtAccountsDTO: Array<MTAccountDTO>) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.mtAccounts = new Array<MTAccData>();
        mtAccountsDTO.forEach(item => {
            let accData = new MTAccData(item);
            accData.identityId = this.id;
            this.mtAccounts.push(accData);
        });
    }
    public id: string;
    public userName: string;
    public email: string;
    public mtAccounts: Array<MTAccData>;
}

export enum Periods {
    Last7Days = 'Last 7 Days',
    Last30Days = 'Last 30 Days',
    Last90Days = 'Last 90 Days',
    LastYear = 'Last Year',
    AllTime = 'All Time'
}

export enum Grouping {
    Separate = 'Separate',
    Daily = 'Daily',
    Weekly = 'Weekly'
}

export class EnumHelper {
    public static getKeyString(period: Periods) {
        let index = Object.values(Periods).indexOf(period);
        return Object.keys(Periods)[index];
    }

    /*public static getKeyStringG<T>(period: T) {
        let index = Object.values(T).indexOf(period);
        return Object.keys(T)[index];
    }*/
}

export class ChartData {
    Period: Periods;
    Grouping: Grouping;
    DataSet: IChartDataSet;
}

export class ChartDataArgs {
    Period: Periods;
    Grouping: Grouping;
}

export enum ParamNames {
    None = "None",
    TimeFrame = 'Time Frame',
    MarketType = 'Market Type',
    SetupType = 'Setup Type'
}

export enum AlgoTimeFrames {
    All = "All",
    _15Min = "15 Min",
    _1Hour = "1 Hour",
    _4Hour = "4 Hour",
    _1Day = "1 Day",
}

export enum BFTTradeType {
    All = "All",
    BRC = "BRC",
    Swing = "Swing",
    EXT = "EXT"
}

export enum InstrumentType {
    All = "All",
    MajorForex = "MajorForex",
    MinorForex = "MinorForex",
    ExoticsForex = "ExoticsForex",
    Indices = "Indices",
    Commodities = "Commodities",
    Metals = "Metals",
    Bonds = "Bonds",
    Equities = "Equities"
}

export enum OrderViewBy {
    Count = "Count",
    USDAmount = "$"
}