import {Component, ViewChild} from '@angular/core';
import {BacktestResultOverviewComponent} from "../backtest-result-overview/backtest-result-overview.component";
import {BehaviorSubject, combineLatest, Observable, of, Subject} from "rxjs";
import {BacktestTranslateService} from "../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {Script} from "../../../Scripting/models/Script";
import {AppState} from "@app/store/reducer";
import {select, Store} from "@ngrx/store";
import {ScriptCloudRepositoryService} from "@scripting/services/script-cloud-repository.service";
import {
    BacktestParamsModalComponent, IBacktestParamsModalConfig,
    IBacktestParamsModalValues
} from "../backtest-params-modal/backtest-params-modal.component";
import {BacktestExecutor} from "../../services/backtest-executor";
import {HistoryRequestKind, IBacktestResultDTO, IRunBacktestRequestDTO} from "../../data/api.models";
import {IdentityService} from "@app/services/auth/identity.service";
import {HistoryHelperService} from "@app/helpers/history.helper.service";
import {BacktestEvent, BacktestEventype} from "../../data/backtestEvent";
import {map, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {loadScriptsStateSelector, scriptsSelector} from "@platform/store/selectors";
import {ProcessState} from "@app/helpers/ProcessState";
import {Actions, ofType} from "@ngrx/effects";
import * as fromScripts from '@platform/store/actions/scripts.actions';
import {concat} from "@decorators/concat";
import {BacktestApiService} from "../../services/backtest-api.service";
import {AlertService} from "@alert/services/alert.service";
import {ObservableUtils} from "../../../../utils/observable.utils";
import {ComponentIdentifier} from "@app/models/app-config";


@Component({
    selector: 'run-backtest',
    templateUrl: './run-backtest.component.html',
    styleUrls: ['./run-backtest.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: BacktestTranslateService
        }
    ]
})
export class RunBacktestComponent {
    @ViewChild(BacktestResultOverviewComponent, {static: false}) backtestOverview: BacktestResultOverviewComponent;

    scripts$: Observable<Script[]>;
    selectedScriptId$ = new BehaviorSubject<string>(null);
    selectedScript$: Observable<Script>;

    loadScriptsState$: Observable<ProcessState>;
    stopBacktest$ = new Subject();
    processing: boolean = false;
    currentBacktestId: string;

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    scriptOptionCaption = (script: Script) => of(script.name);

    constructor(private _store: Store<AppState>,
                private _actions: Actions,
                private _dialog: MatDialog,
                private _scriptsRepository: ScriptCloudRepositoryService,
                private _backtestExecutor: BacktestExecutor,
                private _backtestApiService: BacktestApiService,
                private _identityService: IdentityService,
                private _alertService: AlertService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this.scripts$ = this._store.pipe(
            select(scriptsSelector),
            takeUntil(componentDestroyed(this))
        );

        this.loadScriptsState$ = this._store.pipe(
            select(loadScriptsStateSelector),
            takeUntil(componentDestroyed(this))
        );

        this.selectedScript$ = combineLatest(
            this.scripts$,
            this.selectedScriptId$
        ).pipe(
            map(([scripts, selectedScriptId]: [Script[], string]) => {
                return scripts.find(s => s.name === selectedScriptId) || null;
            })
        );

        this.stopBacktest$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this.processing = false;
            });

        this._actions
            .pipe(
                ofType(fromScripts.ActionTypes.RenameScriptSuccess),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((action: fromScripts.RenameScriptSuccessAction) => {
                this.handleScriptRenamed(
                    action.payload.script.name,
                    action.payload.prevName
                );
            });

        this._actions
            .pipe(
                ofType(fromScripts.ActionTypes.DeleteScriptSuccess),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((action: fromScripts.DeleteScriptSuccessAction) => {
                this.handleScriptDeleted(action.payload.name);
            });

        this._store.dispatch(new fromScripts.LoadScriptsAction());
    }

    startBacktest() {
        this._dialog.open(BacktestParamsModalComponent, {
            data: {
                script: ObservableUtils.instant(this.selectedScript$)
            } as IBacktestParamsModalConfig
        })
            .afterClosed()
            .subscribe((values: IBacktestParamsModalValues) => {
                if (values) {

                    this._runBacktest({
                        userId: this._identityService.id,
                        scriptName: this.selectedScriptId$.value,
                        symbol: values.instrument.symbol,
                        exchange: values.instrument.exchange,
                        datafeed: values.instrument.exchange.toString(),
                        email: this._identityService.email,
                        phone: '',
                        historyParameters: {
                            kind: HistoryRequestKind.BarsBack,
                            granularity: HistoryHelperService.getGranularity(values.timeFrame),
                            barsCount: values.barsCount,
                            to: new Date().getTime() / 1000
                        },
                        wallets: values.wallets.map((wallet) => {
                            return {
                                currency: wallet.currency,
                                currentAmount: wallet.balance,
                                initialAmount: wallet.balance
                            };
                        }),
                        properties: values.properties
                    });
                }
            });
    }

    @concat()
    stopBacktest() {
        return this._backtestApiService.stopBacktest({
            runningId: this.currentBacktestId,
            userId: this._identityService.id
        })
            .subscribe(
                () => {
                    this.currentBacktestId = null;
                    this.stopBacktest$.next();
                },
                (e) => {
                    this._alertService.error(this._translateService.get('actionProcessedFailed'));
                    console.error('failed to stop backtest', e);
                }
            );
    }

    private _runBacktest(params: IRunBacktestRequestDTO) {
        this._backtestExecutor.startBacktest(params)
            .pipe(
                takeUntil(this.stopBacktest$),
                takeUntil(componentDestroyed(this))
            )
            .subscribe({
                next: (event: BacktestEvent) => {
                    if (event.type === BacktestEventype.started) {
                        this.processing = true;
                        this.currentBacktestId = (event.data as string);
                    }

                    if (event.type === BacktestEventype.failed) {
                        this.processing = false;
                        this._alertService.error(this._translateService.get('backtestCalculationFailed'));
                    }

                    if (event.type === BacktestEventype.finished) {
                        this._handleBacktestResult(event.data);
                        this.processing = false;
                    }
                },
                error: (e) => {
                    this._alertService.error('actionProcessedFailed');
                    console.error('failed to start backtest', e);
                }
            });
    }

    private _handleBacktestResult(result: IBacktestResultDTO) {
        this.backtestOverview.showResult(result);
    }

    handleScriptSelected(script: Script) {
        this.selectedScriptId$.next(script.name);
    }

    handleScriptRenamed(newName: string, prevName: string) {
        if (this.selectedScriptId$.value === prevName) {
            this.selectedScriptId$.next(newName);
        }
    }

    handleScriptDeleted(scriptName: string) {
        if (this.selectedScriptId$.value === scriptName) {
            this.selectedScriptId$.next(null);
        }
    }


    ngOnDestroy() {

    }
}
