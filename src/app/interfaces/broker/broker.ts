import {ActionResult, IBrokerUserInfo, OrderTypes} from "../../../modules/Trading/models/models";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {Observable, Subject} from "rxjs";
import {IInstrument} from "../../models/common/instrument";
import { EExchangeInstance } from '../exchange/exchange';

export enum EBrokerInstance {
    BitmexBroker = 'Bitmex',
    OandaBroker = "Oanda",
    MT5 = "MT5",
    MT4 = "MT4"
}

export interface IBrokerState<T = any> {
    brokerType: EBrokerInstance;
    account: string;
    server: string;
    state: T;
}

export interface IBroker {
    accessToken: string;
    // supportedMarkets: EMarketType[];
    instanceType: EBrokerInstance;
    // userInfo: IBrokerUserInfo;
    onSaveStateRequired: Subject<void>;
    // ExchangeInstance: EExchangeInstance;

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]>;

    isInstrumentAvailable(instrument: IInstrument, orderType: OrderTypes): boolean;

    init(initData: any): Observable<ActionResult>;
    dispose(): Observable<ActionResult>;
    saveState(): Observable<IBrokerState>;
    loadSate(state: IBrokerState): Observable<ActionResult>;
}

