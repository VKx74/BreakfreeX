export interface IUserSettings {
    FeaturedInstruments?: IFeaturedInstruments[];
}

export interface IFeaturedInstruments {
    instrument: string;
    exchange: string;
    group: string;
}