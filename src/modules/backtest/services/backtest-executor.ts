import {Injectable} from "@angular/core";
import {IBacktestResultDTO, IRunBacktestRequestDTO, IRunBacktestResponseDTO} from "../data/api.models";
import {EMPTY, Observable, Subject} from "rxjs";
import {BacktestApiService} from "./backtest-api.service";
import {BacktestNotificationService} from "./backtest-notification.service";
import {BacktestEvent, BacktestEventype} from "../data/backtestEvent";
import {catchError, filter, switchMap, takeUntil} from "rxjs/operators";

@Injectable()
export class BacktestExecutor {
    constructor(private _apiService: BacktestApiService,
                private _backtestNotifications: BacktestNotificationService) {

    }

    startBacktest(params: IRunBacktestRequestDTO): Observable<BacktestEvent> {
        return new Observable<BacktestEvent>(subscriber => {
            const unsubscribe$ = new Subject<any>();
            const backtestUpdateListener = (runningId: string) => {
                this._backtestNotifications.backtestStopped
                    .pipe(takeUntil(unsubscribe$))
                    .subscribe((id: string) => {
                        if (id === runningId) {
                            subscriber.next({
                                type: BacktestEventype.stopped,
                                data: id
                            } as BacktestEvent);
                            subscriber.complete();
                        }
                    });

                this._backtestNotifications.onClose$
                    .pipe(takeUntil(unsubscribe$))
                    .subscribe(() => {
                        subscriber.next({
                            type: BacktestEventype.failed,
                            data: runningId
                        });
                    });

                this._backtestNotifications.backtestFinished
                    .pipe(
                        filter((id: string) => id === runningId),
                        switchMap((id: string) => {
                            return this._apiService.getBacktestResult(id)
                                .pipe(
                                    catchError((e) => {
                                        console.error('failed to load backtest result:', e);

                                        subscriber.next({
                                            type: BacktestEventype.failed,
                                            data: null
                                        } as BacktestEvent);
                                        subscriber.complete();

                                        return EMPTY;
                                    })
                                );
                        }),
                        takeUntil(unsubscribe$)
                    )
                    .subscribe((result: IBacktestResultDTO) => {
                        subscriber.next({
                            type: BacktestEventype.finished,
                            data: result
                        } as BacktestEvent);
                        subscriber.complete();
                    });
            };

            if (!this._backtestNotifications.isConnected) {
                subscriber.error();
                return;
            } else {
                this._apiService.startBacktest(params)
                    .subscribe({
                        next: (resp: IRunBacktestResponseDTO) => {
                            subscriber.next({
                                type: BacktestEventype.started,
                                data: resp.runningId
                            } as BacktestEvent);

                            backtestUpdateListener(resp.runningId);
                        },
                        error: (e) => {
                            subscriber.error(e);
                        }
                    });
            }

            return () => {
                unsubscribe$.next();
                unsubscribe$.complete();
            };
        });
    }
}
