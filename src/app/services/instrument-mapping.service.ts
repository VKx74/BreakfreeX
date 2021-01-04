import { Injectable } from "@angular/core";

@Injectable()
export class InstrumentMappingService {
    private _mapping: { [datafeedSymbol: string]: string } = {};

    constructor() {
        // this._mapping["NZDCHF"] = "EURAUD"
    }

    tryMapInstrumentToBrokerFormat(symbol: string): string {
        for (const i in this._mapping) {
            const s1 = this._normalizeInstrument(i);
            const s2 = this._normalizeInstrument(symbol);
            if (s1 === s2) {
                return this._mapping[i];
            }
        }
    }

    tryMapInstrumentToDatafeedFormat(symbol: string): string {
        for (const i in this._mapping) {
            const s1 = this._normalizeInstrument(this._mapping[i]);
            const s2 = this._normalizeInstrument(symbol);
            if (s1 === s2) {
                return i;
            }
        }
    }



    protected _normalizeInstrument(symbol: string): string {
        return symbol.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
    }
}
