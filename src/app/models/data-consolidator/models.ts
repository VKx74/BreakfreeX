export interface DataConsolidatorSettings {
    internalId: string;
    timestamp: number;
    l2Depth: number;
    tickHistory: number;
    symbols: DataConsolidatorInstrument[];
}

export interface DataConsolidatorInstrument {
    name: string;
    description: string;
    baseInstrument: string;
    dependInstrument: string;
    enabled: boolean;
    tickSize: number;
    sources: DataConsolidatorInstrumentSource[];
}

export interface DataConsolidatorInstrumentSource {
    name: string;
    exchange: string;
}

export enum EDataConsolidatorExchange {
    None = "None",
    Coinbase = "Coinbase",
    Bitmex = "Bitmex",
    OKEx = "OKEx",
}