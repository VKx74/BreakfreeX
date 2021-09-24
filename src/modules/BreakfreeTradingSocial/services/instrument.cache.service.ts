import { Injectable } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { InstrumentService } from "@app/services/instrument.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

interface IInstrumentCache {
    instrument: IInstrument;
    time: number;
}

@Injectable()
export class InstrumentCacheService {
    constructor(protected _instrumentService: InstrumentService) {
        
    }

    getInstrument(symbol: string, exchange: string): Observable<IInstrument> {
        try {
            const existing = this._getFromStorage(symbol, exchange);
            if (existing) {
                return of(existing);
            }
        } catch (ex) {
            console.error(ex);
        }

        return this._instrumentService.getInstruments(null, symbol).pipe(map((data: IInstrument[]) => {
            if (!data || !data.length) {
                return;
            }

            let instrument = data[0];

            for (const i of data) {
                try {
                    if (i.exchange && i.exchange.toLowerCase() === exchange.toLowerCase() && i.id.toLowerCase() === symbol.toLowerCase()) {
                        instrument = i;
                    }
                } catch (e) {
                }
            }

            if (!instrument) {
                return;
            }

            try {
                this._setInStorage(symbol, exchange, instrument);
            } catch (ex) {
                console.error(ex);
            }

            return instrument;

        }));
    }

    private _getFromStorage(symbol: string, exchange: string): IInstrument {
        const key = this._getKey(symbol, exchange);
        const inStorage = localStorage.getItem(key);
        if (!inStorage) {
            return null;
        }
        const cacheObject = JSON.parse(inStorage) as IInstrumentCache;
        if (!cacheObject.instrument || !cacheObject.time) {
            localStorage.removeItem(key);
            return null;
        }

        const timeDiff = new Date().getTime() - cacheObject.time;
        const timeDiffInHours = timeDiff / 1000 / 60 / 60;

        if (timeDiffInHours > (24 * 5)) {
            localStorage.removeItem(key);
            return null;
        }

        return cacheObject.instrument;
    }
    
    private _setInStorage(symbol: string, exchange: string, instrument: IInstrument) {
        const key = this._getKey(symbol, exchange);
        const data: IInstrumentCache = {
            instrument: instrument,
            time: new Date().getTime()
        };
        localStorage.setItem(key, JSON.stringify(data));
    }

    private _getKey(symbol: string, exchange: string) {
        return `${symbol}_${exchange}`;
    }
}