import {Injectable} from "@angular/core";
import {RealtimeService} from "./realtime.service";
import {HistoryService} from "./history.service";
import {InstrumentService} from "./instrument.service";
import {IHealthable} from "../interfaces/healthcheck/healthable";

@Injectable()
export class HealthCheckService {
    private _services: IHealthable[] = [];
    public get isHealthy(): boolean {
        for (let i = 0; i < this._services.length; i++) {
           if (!this._services[i].isHealthy) {
               return false;
           }
        }

        return true;
    }

    constructor(private _instrumentService: InstrumentService,
                private _realtimeService: RealtimeService,
                private _historyService: HistoryService) {

        this._services.push(this._historyService);
        this._services.push(this._realtimeService);
        this._services.push(this._instrumentService);
    }
}