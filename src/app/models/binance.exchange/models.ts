export namespace BinanceExchangeModels {
    export enum EExtendedInstrumentFilterType {
        PriceFilter = 'PRICE_FILTER'
    }

    export enum EOrderType {
        Limit = "LIMIT",
        LimitMaker = "LIMIT_MAKER",
        Market = "MARKET",
        StopLossLimit = "STOP_LOSS_LIMIT",
        TakeProfitLimit = "TAKE_PROFIT_LIMIT"
    }

    export class ExtendedInstrumentFilter {
        filterType: EExtendedInstrumentFilterType;
    }

    export class ExtendedInstrumentPriceFilter extends ExtendedInstrumentFilter {
        minPrice: number;
        maxPrice: number;
        tickSize: number;
    }

    export class GetExtendedInstrumentsResponseDTO {
        Data: {
            orderTypes: EOrderType[];
            filters: ExtendedInstrumentFilter[];
            symbol: string;
            status: string;
            baseAsset: string;
            baseAssetPrecision: number;
            quoteAsset: string;
            quotePrecision: number;
            icebergAllowed: boolean;
        }[];
    }

    export class LoginCredentials {
        ApiKey: string;
        Secret: string;
    }
}