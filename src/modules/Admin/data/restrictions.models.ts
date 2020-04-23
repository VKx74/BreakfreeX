export interface BaseMarketRestriction {
    tag: string;
    symbol: string;
}

export interface IMarketRestriction extends BaseMarketRestriction {
   id: string;
}

export interface CreateMarketRestriction extends BaseMarketRestriction {
}

export interface EditMarketRestriction extends BaseMarketRestriction {
}

export interface BaseCurrencyRestriction {
    tag: string;
    currency: string;
}

export interface ICurrencyRestriction extends BaseCurrencyRestriction {
   id: string;
}

export interface CreateCurrencyRestriction extends BaseCurrencyRestriction {
}

export interface EditCurrencyRestriction extends BaseCurrencyRestriction {
}