import {ActionResult, IBrokerUserInfo, OrderTypes} from "../../../modules/Trading/models/models";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {Observable, Subject} from "rxjs";
import {IInstrument} from "../../models/common/instrument";

export enum EBrokerInstance {
    ZenithBroker = 'Zenith',
    BitmexBroker = 'Bitmex',
    OKExBroker = 'OKEx',
    BinanceBroker = "Binance",
    OandaBroker = "Oanda",
}

export interface IBrokerState<T = any> {
    brokerType: EBrokerInstance;
    state: T;
}

export interface IBroker {
    accessToken: string;
    supportedExchanges: EExchange[];
    supportedMarkets: EMarketType[];
    instanceType: EBrokerInstance;
    userInfo: IBrokerUserInfo;
    onSaveStateRequired: Subject<void>;

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]>;

    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean;

    init(initData: any): Observable<ActionResult>;
    dispose(): Observable<ActionResult>;
    saveState(): Observable<IBrokerState>;
    loadSate(state: IBrokerState): Observable<ActionResult>;
}

