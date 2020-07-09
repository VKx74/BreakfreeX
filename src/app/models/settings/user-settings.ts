import { IInstrument } from '../common/instrument';

export interface IUserSettings {
    FeaturedInstruments?: IFeaturedInstruments[];
}

export interface IFeaturedInstruments {
    instrument: IInstrument;
    group: string;
}