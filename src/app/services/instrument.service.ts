import {forkJoin, Observable, of} from "rxjs";
import {catchError, map} from 'rxjs/operators';
import {Injectable} from "@angular/core";
import {IInstrument} from "../models/common/instrument";
import {EExchange} from "../models/common/exchange";
import {JsUtil} from "../../utils/jsUtil";
import {IHealthable} from "../interfaces/healthcheck/healthable";
import {ApplicationTypeService} from "./application-type.service";
import {ExchangeFactory} from "../factories/exchange.factory";
import {APP_TYPE_EXCHANGES} from "../enums/ApplicationType";
import {InstrumentServiceBase} from "@app/interfaces/exchange/instrument.service";

@Injectable()
export class InstrumentService implements IHealthable {
    private services: InstrumentServiceBase[] = [];

    public get isHealthy(): boolean {
        let _isHealthy = true;

        for (let i = 0; i < this.services.length; i++) {
            if (!this.services[i].isHealthy) {
                _isHealthy = false;
                break;
            }
        }

        return _isHealthy;
    }

    constructor(private exchangeFactory: ExchangeFactory,
                private applicationTypeService: ApplicationTypeService) {
        this._init();
    }

    private _init() {
        setTimeout(() => {
            let exchanges = APP_TYPE_EXCHANGES[this.applicationTypeService.applicationType];

            if (exchanges) {
                exchanges.forEach(value => {
                    this.exchangeFactory.tryCreateInstrumentServiceInstance(value).subscribe(result => {
                        if (result.serviceInstance && result.result) {
                            this.services.push(result.serviceInstance);
                        }
                    }, error => {
                        console.table(error);
                    });
                });
            }
        });
}

    getInstruments(exchange?: EExchange, search?: string): Observable<IInstrument[]> {
        const observables: Observable<IInstrument[]>[] = [] = exchange && exchange !== EExchange.any
            ? [this._getServiceByExchange(exchange).getInstruments(exchange, search)]
            : this.services.map(s => s.getInstruments(exchange, search));

        return forkJoin(observables).pipe(
            catchError(error => of([])),
            map((responses: IInstrument[][]) => {
                if (!responses || !responses.length) {
                    return [];
                }

                return JsUtil.flattenArray<IInstrument>(responses);
            })
        );
    }

    getInstrumentBySymbol(symbol: string, exchange: EExchange): Observable<IInstrument> {
        return this._getServiceByExchange(exchange).getInstruments(exchange, symbol)
            .pipe(
                map((instruments: IInstrument[]) => instruments.find(i => i.symbol === symbol))
            );
    }

    getInstrumentsBySymbol(symbol: string): Observable<IInstrument[]> {
        return forkJoin(this.services.map(s => s.getInstruments(undefined, symbol)))
            .pipe(
                catchError(() => of([])),
                map((responses: IInstrument[][]) => {
                    return JsUtil.flattenArray<IInstrument>(responses).filter(i => i.symbol === symbol);
                })
            );
    }

    private _getServiceByExchange(exchange: EExchange): InstrumentServiceBase {
        for (let i = 0; i < this.services.length; i++) {
            if (this.services[i].supportedExchanges.indexOf(exchange) !== -1) {
                return this.services[i];
            }
        }
        return this.services[0];
    }
}
