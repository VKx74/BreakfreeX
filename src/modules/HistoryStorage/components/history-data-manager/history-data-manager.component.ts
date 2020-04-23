import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {HistoryStorageBar, HistoryStorageDataDTO, HistoryStorageDTO} from "../../models/history.storage.dto";
import {HistoryStorageService} from "../../services/history.storage.service";
import {AlertService} from "@alert/services/alert.service";
import {MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {ConfirmModalComponent} from "UI";
import {ProcessState} from "@app/helpers/ProcessState";
import {BehaviorSubject, EMPTY, forkJoin, Observable} from "rxjs";
import {HistoryStorageTranslateService} from "../../localization/token";
import {LoadDatafeedHistoryComponent} from "../load-datafeed-history/load-datafeed-history.component";
import {tap, catchError, filter, switchMap} from "rxjs/operators";
import {TimeFrameHelper} from "@app/helpers/timeFrame.helper";
import {IPeriodicity} from "@app/models/common/periodicity";
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
    selector: 'history-data-manager',
    templateUrl: './history-data-manager.component.html',
    styleUrls: ['./history-data-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: HistoryStorageTranslateService
        }
    ]
})
export class HistoryDataManagerComponent implements OnInit {
    @ViewChild('historyDataChart', {static: true}) public canvasElement: ElementRef;

    bars: HistoryStorageBar[] = [];
    records: HistoryStorageDTO[] = [];
    selectedRecord$ = new BehaviorSubject<HistoryStorageDTO>(null);

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get selectedRecord(): HistoryStorageDTO {
        return this.selectedRecord$.getValue();
    }


    historyDataChart;
    canvas: any;
    ctx: any;
    private readonly _translationKey: string = 'historyDataManager';

    loadRecordsProcessState = new ProcessState();
    private _loadRecordsAttemptCount = 0;


    constructor(private _historyStorageService: HistoryStorageService,
                private _alertService: AlertService,
                private _dialog: MatDialog,
                private _timeFrameHelper: TimeFrameHelper,
                private  _translateService: TranslateService) {
    }

    ngOnInit() {
        this._createHistoryDataChart();
        this._loadRecords();

        this.selectedRecord$
            .pipe(
                tap(() => this.bars = []),
                filter(r => r != null),
                switchMap((record: HistoryStorageDTO) => {
                    return this._historyStorageService.getStorageData(record.id)
                        .pipe(
                            catchError((e) => {
                                console.error(e);
                                this._alertService.warning(this._translateService.get(`${this._translationKey}.failedLoadSnapshot`));
                                return EMPTY;
                            })
                        );
                })
            )
            .subscribe({
                next: (storageData: HistoryStorageDataDTO) => {
                    this.bars = storageData.data;
                    this._setDataToChart(this.bars);
                }
            });
    }

    handleRefresh() {
        this._loadRecords();
    }

    handleDeleteRecord(record: HistoryStorageDTO) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`${this._translationKey}.removeSnapshot`),
                onConfirm: () => {
                    this._deleteRecord(record.id)
                        .subscribe({
                            next: () => {
                                const selectedRecord = this.selectedRecord$.getValue();

                                this.records = this.records.filter(r => r.id !== record.id);

                                if (selectedRecord && record.id === selectedRecord.id) {
                                    this.selectedRecord$.next(null);
                                }
                            },
                            error: (e) => {
                                console.error(e);
                                this._alertService.error(this._translateService.get(`${this._translationKey}.failedRemoveSnapshot`));
                            }
                        });
                }
            }
        } as any)
            .afterClosed();
    }

    handleDeleteAllRecords() {
        if (this.records.length === 0) {
            return;
        }

        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`${this._translationKey}.removeAllSnapshots`),
                onConfirm: () => {
                    this._deleteRecords(this.records.map(r => r.id))
                        .subscribe({
                            next: () => {
                                this.records = [];
                                this.selectedRecord$.next(null);
                            },
                            error: (e) => {
                                console.error(e);
                            }
                        });
                }
            }
        } as any)
            .afterClosed();
    }

    handleLoadDatafeedHistory() {
        this._dialog.open(LoadDatafeedHistoryComponent)
            .afterClosed()
            .subscribe((storage: HistoryStorageDTO) => {
                if (storage) {
                    this.records.push(storage);
                }
            });
    }

    handleSelectRecord(record: HistoryStorageDTO) {
        if (this.selectedRecord && record.id === this.selectedRecord.id) {
            return;
        }

        this.selectedRecord$.next(record);
    }

    getRecordTimeFrameStr(interval: number, periodicity: IPeriodicity): Observable<string> {
        return this._timeFrameHelper.timeFrameToStr({
            interval: interval,
            periodicity: periodicity
        });
    }

    private _loadRecords() {
        const attemptCount = ++this._loadRecordsAttemptCount;

        this.loadRecordsProcessState.setPending();
        this._loadHistoryRecords()
            .subscribe({
                next: (records: HistoryStorageDTO[]) => {
                    console.log(attemptCount, this._loadRecordsAttemptCount);

                    if (attemptCount === this._loadRecordsAttemptCount) {
                        this.loadRecordsProcessState.setSucceeded();
                        this.records = records;
                    }
                },
                error: (e) => {
                    if (attemptCount === this._loadRecordsAttemptCount) {
                        console.error(e);
                        this.loadRecordsProcessState.setFailed();
                    }
                }
            });
    }

    private _loadHistoryRecords(): Observable<HistoryStorageDTO[]> {
        return this._historyStorageService.getStorages();
    }

    private _setDataToChart(bars: HistoryStorageBar[]) {
        this.historyDataChart.data.datasets[0].data = [];
        this.historyDataChart.data.labels = [];

        for (const bar of bars) {
            this.historyDataChart.data.datasets[0].data.push(bar.close);
            this.historyDataChart.data.labels.push(bar.timeStamp);
        }

        this.historyDataChart.update();
    }

    private _deleteRecord(id: string): Observable<any> {
        return this._historyStorageService.deleteStorage(id);
    }

    private _deleteRecords(ids: string[]): Observable<any> {
        return forkJoin(ids.map((id) => this._deleteRecord(id)));
    }

    private _createHistoryDataChart() {
        this.canvas = this.canvasElement.nativeElement;
        this.ctx = this.canvas.getContext('2d');
        this.historyDataChart = new Chart(this.ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Total',
                    borderColor: "#295b86",
                    backgroundColor: "rgba(50, 144, 250, 0.5",
                    lineTension: 0,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    data: []
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 30,
                        bottom: 0
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0, // general animation time
                },
                hover: {
                    animationDuration: 0, // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            display: false,
                        },
                    }],
                    yAxes: [{
                        position: 'right',
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {}
                    }]
                },
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false,
                    displayColors: false,
                }
            },
        });
    }

    ngOnDestroy() {

    }
}
