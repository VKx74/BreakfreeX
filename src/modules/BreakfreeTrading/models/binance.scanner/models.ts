export interface ITickerStatistic {
    // Symbol
    S: string;

    // Update time
    UT: number;

    // Price change
    L1PC: number;
    L2PC: number;
    L3PC: number;
    L5PC: number;

    // Price volatility change
    L1PV: number;
    L2PV: number;
    L3PV: number;
    L5PV: number;

    // Buy Volume change
    L1BVC: number;
    L2BVC: number;
    L3BVC: number;
    L5BVC: number;

    // Sell Volume change
    L1SVC: number;
    L2SVC: number;
    L3SVC: number;
    L5SVC: number;

    // Trade Count change
    L1TC: number;
    L2TC: number;
    L3TC: number;
    L5TC: number;

    // Cumulative Buy Volume
    L1CumBV: number;
    L2CumBV: number;
    L3CumBV: number;
    L5CumBV: number;

    // Cumulative Sell Volume
    L1CumSV: number;
    L2CumSV: number;
    L3CumSV: number;
    L5CumSV: number;

    // Volume change
    L1VC: number;
    L2VC: number;
    L3VC: number;
    L5VC: number;

}


export interface ITickerStatisticMessage {
    Key: string;
    Value: ITickerStatistic;
}