import { IInstrument } from '../common/instrument';

export interface IUserSettings {
    FeaturedInstruments?: IFeaturedInstruments[];
    UseTradeGuard?: boolean;
    ActiveTradingFeedback?: boolean;
}

export interface IFeaturedInstruments {
    instrument: IInstrument;
    group: string;
}