import {Component, Injector, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import {IInstrument} from "@app/models/common/instrument";
import {FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {BacktestTranslateService} from "../../localization/token";
import {ITimeFrame} from "@app/models/common/timeFrame";
import {DataFeedBase} from "@chart/datafeed/DataFeedBase";
import {TimeFrameHelper} from "@app/helpers/timeFrame.helper";
import {positiveFloatValidator, positiveIntegerNumberValidator} from "Validators";
import {pairwise, startWith, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {JsUtil} from "../../../../utils/jsUtil";
import {Script} from "@scripting/models/Script";
import {IBacktestScriptProperties} from "../../data/api.models";
import {ScriptParamsComponent, ScriptParamsComponentMode} from "@scripting/components/script-params/script-params.component";

export interface IBacktestParamsModalValues {
    instrument: IInstrument;
    timeFrame: ITimeFrame;
    barsCount: number;
    wallets: {
        currency: string;
        balance: number;
    }[];
    properties?: IBacktestScriptProperties;
}

export interface IBacktestParamsModalConfig {
    script: Script;
}

const BaseInstrumentWalletFormGroupName = 'baseInstrument';
const DependInstrumentWalletFormGroupName = 'dependInstrument';
const DefaultWalletBalance = 10000;

@Component({
    selector: 'backtest-params-modal',
    templateUrl: './backtest-params-modal.component.html',
    styleUrls: ['./backtest-params-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: BacktestTranslateService
        }
    ]
})
export class BacktestParamsModalComponent extends Modal<IBacktestParamsModalConfig, IBacktestParamsModalValues> {
    allowedTimeframes: ITimeFrame[] = DataFeedBase.supportedTimeFrames;
    formGroup: FormGroup;
    walletsFormGroup: FormGroup;
    ScriptParamsComponentMode = ScriptParamsComponentMode;

    @ViewChild(ScriptParamsComponent, {static: false}) scriptParams: ScriptParamsComponent;

    get script(): Script {
        return this.data.script;
    }

    constructor(_injector: Injector,
                private _timeFrameHelper: TimeFrameHelper) {
        super(_injector);
    }

    ngOnInit() {
        this.walletsFormGroup = new FormGroup({});
        this.formGroup = new FormGroup({
            instrument: new FormControl(null, [Validators.required]),
            timeFrame: new FormControl(this.allowedTimeframes[0], [Validators.required]),
            barsCount: new FormControl(100, [
                Validators.required,
                Validators.min(1),
                Validators.max(1000),
                positiveIntegerNumberValidator()
            ]),
            wallets: this.walletsFormGroup
        });

        this.formGroup.controls['instrument'].valueChanges
            .pipe(
                startWith(null), // fix pairwise
                pairwise(),
                takeUntil(componentDestroyed(this))
            )
            .subscribe(([prevInstrument, instrument]) => {
                this.handleInstrumentSelected(instrument, prevInstrument);
            });
    }

    timeFrameCaption = (timeFrame: ITimeFrame) => {
        return this._timeFrameHelper.timeFrameToStr(timeFrame);
    }

    addWallet() {
        this.walletsFormGroup.addControl(JsUtil.generateGUID(), new FormGroup({
            'currency': new FormControl('', [Validators.required]),
            'balance': new FormControl(DefaultWalletBalance, this._getWalletBalanceControlValidators())
        }));
    }

    deleteWallet(walletFormGroupName: string) {
        this.walletsFormGroup.removeControl(walletFormGroupName);
    }

    handleInstrumentSelected(instrument: IInstrument, prevInstrument: IInstrument) {
        const walletsFormGroup = this.formGroup.controls['wallets'] as FormGroup;

        if (!prevInstrument) { // initial
            walletsFormGroup.addControl(DependInstrumentWalletFormGroupName, new FormGroup({
                'currency': new FormControl({
                    value: instrument.dependInstrument,
                    disabled: true
                }, [Validators.required]),
                'balance': new FormControl(DefaultWalletBalance, this._getWalletBalanceControlValidators())
            }));
            walletsFormGroup.addControl(BaseInstrumentWalletFormGroupName, new FormGroup({
                'currency': new FormControl({value: instrument.baseInstrument, disabled: true}, [Validators.required]),
                'balance': new FormControl(DefaultWalletBalance, this._getWalletBalanceControlValidators())
            }));
        } else {
            (walletsFormGroup.controls[BaseInstrumentWalletFormGroupName] as FormGroup).controls['currency'].setValue(instrument.baseInstrument);
            (walletsFormGroup.controls[DependInstrumentWalletFormGroupName] as FormGroup).controls['currency'].setValue(instrument.dependInstrument);
        }
    }

    getWalletsFormGroupNames(): string[] {
        return Object.keys(this.walletsFormGroup.controls).map((name: string) => name) as string[];
    }

    allowWalletFormGroupRemoving(formName: string): boolean {
        return formName !== BaseInstrumentWalletFormGroupName
            && formName !== DependInstrumentWalletFormGroupName;
    }

    submit() {
        const controls = this.formGroup.controls;
        const walletFormGroups = this.walletsFormGroup;

        this.close({
            instrument: controls['instrument'].value,
            timeFrame: controls['timeFrame'].value,
            barsCount: controls['barsCount'].value,
            wallets: Object.keys(walletFormGroups.controls).map((name: string) => {
                const walletForm = walletFormGroups.controls[name] as FormGroup;

                return {
                    currency: walletForm.controls['currency'].value,
                    balance: walletForm.controls['balance'].value
                };
            }),
            properties: this.scriptParams ? this.scriptParams.getFormValues() as IBacktestScriptProperties : {}
        } as IBacktestParamsModalValues);
    }

    private _getWalletBalanceControlValidators(): ValidatorFn[] {
        return [Validators.required, Validators.min(0.001), positiveFloatValidator()];
    }

    ngOnDestroy() {

    }
}
