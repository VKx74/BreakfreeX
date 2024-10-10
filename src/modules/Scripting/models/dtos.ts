/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Breakfree, https://breakfree.cc
    Downloading, installing or otherwise using this software or source code shall be made only under Breakfree License agreement. If you do not granted Breakfree License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

export class ScriptDTO {
    id: string;
    name: string;
    description: string;
    code: string;
    created: number;
    updated: number;
}

export class CreateScriptDTO {
    name: string;
    description: string;
    code: string;
}

export class UpdateScriptDTO {
    id: string;
    name: string;
    description: string;
    code: string;
}

export class CompileScriptDTO {
    script: string;
}

export interface ScriptResultScript {
    id: string;
    name: string;
    code: string;
}

export interface ScriptResultHistoricalData {
    id: string;
    instrument: string;
    from: number;
    to: number;
    barsCount: number;
    interval: number;
    periodicity: string;
}

export interface ScriptResultSummary {
    averageEfficiency: number;
    averageTradeNetProfit: number;
    averageTradeNetProfitLosers: number;
    averageTradeNetProfitWinners: number;
    grossLoss: number;
    grossLossLong: number;
    grossLossShort: number;
    grossProfit: number;
    grossProfitLong: number;
    grossProfitShort: number;
    largestLost: number;
    largestLostPercent: number;
    largestProfit: number;
    largestProfitPercent: number;
    maxDrawDown: number;
    maxRunUp: number;
    profitFactor: number;
    profitFactorLong: number;
    profitFactorShort: number;
    totalNetProfit: number;
    totalNetProfitLong: number;
    totalNetProfitShort: number;
    trades: number;
    tradesLosers: number;
    tradesWinners: number;
}

export interface ScriptResultDTO {
    id: string;
    runningId: string;
    script: ScriptResultScript;
    historicalData: ScriptResultHistoricalData;
    summary: ScriptResultSummary;
    created: number;
    finished: number;
}

export interface DetailedScriptResultDTO extends ScriptResultDTO {
    trades: ScriptResultTradeDTO[];
}

export interface ScriptResultTradeDTO {
    number: number;
    side: number;
    tradeType: string;
    timestamp: number;
    signal: string;
    price: number;
    quantity: number;
    profit: number;
    profitPct: number;
    runUp: number;
    drawDown: number;
    efficiency: number;
    runUpEff: number;
    drawDownEff: number;
    grossPl: number;
}

export interface DeleteScriptResultRequestDTO {
    ResultId: string;
    ScriptId: string;
}

export interface ScriptResultReportDTO {
    gain: number;
    netProfit: number;
    period: string;
    profitable: number;
    profitFactor: number;
    trades: number;
    date: number;
}