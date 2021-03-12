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