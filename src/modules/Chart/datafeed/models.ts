export interface IQuote {
  Ask: number;
  AskSize: number;
  Bid: number;
  BidSize: number;
  Instrument: string;
  Price: number;
  Time: string;
  Volume: number;
}

export const RequestKind = {
  BARS: 'bars',
  MORE_BARS: 'moreBars',
};

export interface IRequest {
  id?: number;
  kind: string;
  chart?: any;
}

export interface IBarsRequest extends IRequest {
  count: number;
  endDate?: Date;
}
