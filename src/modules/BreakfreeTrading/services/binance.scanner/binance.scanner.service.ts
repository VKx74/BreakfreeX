import {Injectable} from "@angular/core";
import { BinanceScannerWsService } from "./binance.scanner.ws.service";
import { ITickerStatistic, ITickerStatisticMessage } from "modules/BreakfreeTrading/models/binance.scanner/models";
import { Subject } from "rxjs";

@Injectable()
export class BinanceScannerService {

    private _statistics: { [symbol: string]: ITickerStatistic; } = {};
    private _onUpdate = new Subject<void>();

    public get statistics(): { [symbol: string]: ITickerStatistic; } {
        return this._statistics;
    }

    public get onUpdate(): Subject<void> {
        return this._onUpdate;
    }

    constructor(protected ws: BinanceScannerWsService) {
        const onMessageSubscription = this.ws.onMessage.subscribe((value: any) => {
            this._processMessage(value);
        });
    }

    open() {
        this.ws.open().subscribe();
    }
    
    close() {
        this.ws.close();
    }

    private _processMessage(data: ITickerStatisticMessage[]) {
        this._statistics = {};
        for (const i of data) {
            this._statistics[i.Key] = i.Value;
        }
        this._onUpdate.next();
    }
}
