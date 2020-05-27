import {Injectable} from "@angular/core";
import {
    IBacktestResultDTO,
    IRunBacktestRequestDTO,
    IRunBacktestResponseDTO,
    IRunningBacktestMetadata,
    IStopBacktestRequestDTO
} from "../data/api.models";
import {forkJoin, Observable, of} from "rxjs";
import {flatMap, map} from "rxjs/operators";
import {InstrumentService} from "@app/services/instrument.service";
import {IInstrument} from "@app/models/common/instrument";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {EExchange} from "@app/models/common/exchange";
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

@Injectable()
export class BacktestApiService {
    constructor(private _instrumentService: InstrumentService,
                private _http: HttpClient) {

    }

    getBacktestResult(id: string): Observable<IBacktestResultDTO> {
        return this._http.get<IBacktestResultDTO>(`${AppConfigService.config.apiUrls.scriptEngineREST}backtest/${id}`)
            .pipe(
                flatMap((result: IBacktestResultDTO) => {
                    return forkJoin(
                        of(result),
                        this._instrumentService.getInstrumentBySymbol(
                            result.instrument.symbol,
                            result.instrument.datafeed as EExchangeInstance,
                            result.instrument.exchange as EExchange
                        )
                    );
                }),
                map(([result, instrument]: [IBacktestResultDTO, IInstrument]) => {
                    result.instrument = instrument;
                    return result;
                })
            );

        // return forkJoin(
        //     of(BacktestResult),
        //     this._instrumentService.getInstruments()
        //         .pipe(
        //             map((instruments: IInstrument[]) => {
        //                 return instruments[2];
        //             })
        //         )
        // )
        //     .pipe(
        //         delay(1000),
        //         map(([result, instrument]: [IBacktestResultDTO, IInstrument]) => {
        //             result.instrument = instrument;
        //             return result;
        //         })
        //     );
    }

    getRunningBacktests(): Observable<IRunningBacktestMetadata[]> {
        return of(null);
    }

    startBacktest(params: IRunBacktestRequestDTO): Observable<IRunBacktestResponseDTO> {
        return this._http.post<IRunBacktestResponseDTO>(`${AppConfigService.config.apiUrls.scriptEngineREST}backtest/start`, params);
    }

    stopBacktest(params: IStopBacktestRequestDTO): Observable<any> {
        return this._http.post<IRunBacktestResponseDTO>(`${AppConfigService.config.apiUrls.scriptEngineREST}backtest/stop/${params.runningId}/${params.userId}`, null);
    }
}
