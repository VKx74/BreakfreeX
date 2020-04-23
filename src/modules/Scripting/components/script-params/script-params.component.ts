import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {CalculateProperty, Script, ScriptProperty, StartBehaviorProperty} from "@scripting/models/Script";
import {startWith} from "rxjs/operators";
import {ScriptsTranslateService} from "@scripting/localization/token";
import {floatNumberValidator, integerNumberValidator} from "Validators";

export enum ScriptPropertType {
    Int32 = 'Int32',
    Decimal = 'Decimal',
    Boolean = 'Boolean',
    String = 'String',
    Float = 'Float',
    Double = 'Double',
    Char = 'Char',
}

export enum ScriptParamsComponentMode {
    AutoTrading,
    Backtest
}


export interface IScriptProperty {
    [key: string]: string | number | boolean;
}

export enum ScriptCalculationsType {
    OnBarClose = "OnBarClose",
    OnEachTick = "OnEachTick"
}

export enum ScriptStartBehaviorType {
    Immediately = "ImmediatelySubmit",
    WaitForBar = "WaitForBarUpdate",
}

@Component({
    selector: 'script-params',
    templateUrl: './script-params.component.html',
    styleUrls: ['./script-params.component.scss'],
    exportAs: 'scriptParams',
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class ScriptParamsComponent implements OnInit {
    @Input() script: Script;
    @Input() mode: ScriptParamsComponentMode = ScriptParamsComponentMode.AutoTrading;
    @Output() formChanged = new EventEmitter<FormGroup>();
    CalculateProperty = CalculateProperty;
    StartBehaviorProperty = StartBehaviorProperty;

    form: FormGroup;
    ScriptParamsComponentMode = ScriptParamsComponentMode;

    calculateParamOptions: ScriptCalculationsType[] = [ScriptCalculationsType.OnBarClose, ScriptCalculationsType.OnEachTick];
    startBehaviorParamsOptions: ScriptStartBehaviorType[] = [ScriptStartBehaviorType.Immediately, ScriptStartBehaviorType.WaitForBar];

    get isValid() {
        return this.form.valid;
    }

    get value() {
        return this.form.value;
    }

    constructor(private _translateService: TranslateService) {
    }

    ngOnInit() {
        this.form = this.createPropertiesForm();

        this.form.valueChanges
            .pipe(
                startWith(this.form)
            )
            .subscribe(() => this.formChanged.emit(this.form));
    }

    createPropertiesForm() {
        const form = new FormGroup({});

        if (this.mode === ScriptParamsComponentMode.AutoTrading) {
            form.addControl(CalculateProperty, new FormControl(this.calculateParamOptions[0]));
            form.addControl(StartBehaviorProperty, new FormControl(this.startBehaviorParamsOptions[0]));
        }

        return this.script.properties
            .reduce((acc: FormGroup, property) => {
                acc.addControl(
                    property.name,
                    new FormControl(
                        this.getPropertyDefaultValue(property),
                        [Validators.required, ...this.getPropertyValidators(property)]
                    )
                );

                return acc;
            }, form);
    }

    getPropertyDefaultValue(property: ScriptProperty) {
        if (property.defaultValue && property.defaultValue.toString()) {
            return property.defaultValue;
        }

        switch (property.type) {
            case ScriptPropertType.Decimal:
            case ScriptPropertType.Float:
            case ScriptPropertType.Double:
            case ScriptPropertType.Int32:
                return 0;
            case ScriptPropertType.Boolean:
                return false;
            case ScriptPropertType.Char:
            case ScriptPropertType.String:
                return 's';
            default:
                return null;
        }
    }

    submit() {
    }

    getPropertyValidators(property: ScriptProperty): ValidatorFn[] {
        switch (property.type) {
            case ScriptPropertType.Decimal:
            case ScriptPropertType.Float:
            case ScriptPropertType.Double:
                return [floatNumberValidator()];
            case ScriptPropertType.Int32:
                return [integerNumberValidator()];
            case ScriptPropertType.Char:
                return [Validators.minLength(1), Validators.maxLength(1)];
            case ScriptPropertType.String:
                return [Validators.minLength(1), Validators.maxLength(50)];
            default:
                return [() => null];
        }
    }
    
    startBehaviorParamOptionCaption = (option: ScriptStartBehaviorType) => {
        if (option === ScriptStartBehaviorType.Immediately) {
            return this._translateService.get('runAutomatedTrading.immediately');
        } else if (option === ScriptStartBehaviorType.WaitForBar) {
            return this._translateService.get('runAutomatedTrading.waitForBar');
        }
    }

    calculateParamOptionCaption = (option: ScriptCalculationsType) => {
        if (option === ScriptCalculationsType.OnEachTick) {
            return this._translateService.get('runAutomatedTrading.onEachTick');
        } else if (option === ScriptCalculationsType.OnBarClose) {
            return this._translateService.get('runAutomatedTrading.onBarClose');
        }
    }

    getFormValues() {
        return this.form.value;
    }
}
