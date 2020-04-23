import {Component, Injector, ViewChild} from '@angular/core';
import {IInstrument} from "../../../../app/models/common/instrument";
import {AlertService} from "../../../Alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {ScriptsTranslateService} from "../../localization/token";
import {Modal} from "Shared";
import {Script} from "../../models/Script";
import {IPeriodicity} from "@app/models/common/periodicity";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {IScriptProperty, ScriptParamsComponent} from "@scripting/components/script-params/script-params.component";

export interface RunAutotradingComponentConfig {
    script: Script;
}

export interface RunAutoTradingComponentValues {
    instrument: IInstrument;
    interval: number;
    periodicity: IPeriodicity;
    barsCount: number;
    properties: IScriptProperty;
}

export enum AutoTradingComponentTab {
    General,
    Params
}

@Component({
    selector: 'run-autotrading',
    templateUrl: './run-autotrading.component.html',
    styleUrls: ['./run-autotrading.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        },
    ]
})
export class RunAutotradingComponent extends Modal<RunAutotradingComponentConfig, RunAutoTradingComponentValues> {
    formGroup: FormGroup;
    @ViewChild(ScriptParamsComponent, {static: false}) scriptParams: ScriptParamsComponent;

    constructor(private _alertService: AlertService,
                private  _translateService: TranslateService,
                injector: Injector) {
        super(injector);
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            instrument: new FormControl(null, [Validators.required]),
            periodicity: new FormControl(IPeriodicity.minute),
            interval: new FormControl(1),
            barsCount: new FormControl(100, [Validators.required, Validators.min(10), Validators.max(1000)])
        });
    }

    submit() {
        const controls = this.formGroup.controls;

        this.close({
            instrument: controls['instrument'].value,
            interval: controls['interval'].value,
            periodicity: controls['periodicity'].value,
            barsCount: controls['barsCount'].value,
            properties: this.scriptParams.getFormValues()
        } as RunAutoTradingComponentValues);
    }
}
