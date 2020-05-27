import {Observable, Subject, of} from "rxjs";
import {IInstrument} from "../../models/common/instrument";
import {IHealthable} from "../healthcheck/healthable";
import {EExchange} from "../../models/common/exchange";
import {EMarketType} from "../../models/common/marketType";
import {map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import { EExchangeInstance } from './exchange';

export abstract class InstrumentServiceBase implements IHealthable {
    protected _cachedSymbols: IInstrument[] = [];
    protected _request: Observable<IInstrument[]>;
    protected _subject: Subject<IInstrument[]>;
    protected _endpoint: string;
    protected _isHealthy: boolean = true;
    protected _supportedMarkets: EMarketType[] = [];

    abstract get ExchangeInstance(): EExchangeInstance;

    get supportedMarkets(): EMarketType[] {
        return this._supportedMarkets;
    }

    get isHealthy(): boolean {
        return this._isHealthy;
    }

    constructor(protected _http: HttpClient) {

    }

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        if (this._cachedSymbols && this._cachedSymbols.length) {
            return of(this._filterResponse(exchange, search));
        }

        if (!this.isHealthy) {
            return of([]);
        }

        if (!this._request) {
            this._subject = new Subject<IInstrument[]>();
            this._request = this._requestInstruments().pipe(map(response => this.mapResponse(response, exchange, search)));

            this._request.subscribe(value => {
                this._subject.next(value);
                this._subject.complete();
                this._request = null;
            }, error => {
                console.log('Failed to load symbol from ' + this._http);
                console.log(error);
                this._isHealthy = false;
                this._subject.next([]);
                this._subject.complete();
                this._request = null;
            });
        }

        return this._subject;
    }

    protected _requestInstruments(): Observable<any[]> {
        return this._http.get<any[]>(this._endpoint);
    }

    protected abstract mapResponse(response, exchange?: EExchange, search?: string): IInstrument[];

    protected _filterResponse(exchange?: EExchange, search?: string): IInstrument[] {
        const res: IInstrument[] = [];
        if ((!exchange || exchange === EExchange.any) && !search) {
            return this._cachedSymbols;
        }

        for (let i = 0; i <  this._cachedSymbols.length; i++) {
            const instrument = this._cachedSymbols[i];

            if (exchange && exchange !== EExchange.any && instrument.exchange !== exchange) {
                continue;
            }

            if (search) {
                search = search.toUpperCase();
                let symbol = instrument.symbol.toUpperCase();
                let company = instrument.company.toUpperCase();

                if (symbol.indexOf(search) === -1 && company.indexOf(search) === -1) {
                    continue;
                }

                res.push(instrument);
            } else {
                res.push(instrument);
            }
        }

        return res;
    }

    protected _getPricePrecision(tickSize: number): number {
        let precision = Number(tickSize.toString().split('e-')[1]);

        if (Number.isNaN(precision)) {
            precision = tickSize.toString().split('').reverse().indexOf('.');
        }

        return (precision === -1) ? 2 : precision;
    }
}
