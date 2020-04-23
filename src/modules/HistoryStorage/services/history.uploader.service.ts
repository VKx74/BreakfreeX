import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HistoryStorageDTO} from "../models/history.storage.dto";
import {HistoryService} from "../../../app/services/history.service";
import {HistoryStorageService} from "./history.storage.service";
import {IHistoryRequest} from "../../../app/models/common/historyRequest";

@Injectable()
export class HistoryUploaderService {
    constructor(private _historyService: HistoryService, private _historyStorageService: HistoryStorageService) {
    }

    public uploadHistory(historyRequest: IHistoryRequest, description: string, name: string): Observable<HistoryStorageDTO> {
        return new Observable<HistoryStorageDTO>(subscriber => {
            this._historyService.getHistory(historyRequest).subscribe(value => {
                if (!value || !value.data || !value.data.length) {
                    subscriber.error('Can`t store empty history');
                    subscriber.complete();
                    return;
                }

                const instrument = historyRequest.instrument;

                this._historyStorageService.uploadHistory({
                    symbol: instrument.symbol,
                    exchange: instrument.exchange,
                    bars: value.data,
                    description: description,
                    name: name
                }).subscribe(storage => {
                    subscriber.next(storage);
                    subscriber.complete();
                }, () => {
                    subscriber.error('Failed to store data in storage');
                    subscriber.complete();
                });
            }, () => {
                subscriber.error('Failed to load history from feed');
                subscriber.complete();
            });
        });
    }
}
