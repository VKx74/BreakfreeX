import {AlertBase} from "../AlertBase";
import {EAlertType, EDataSourceType, EPriceAlertCondition} from "../Enums";
import {PriceAlertSettings} from "../AlertSettingsBase";
import {RealtimeDataSource} from "../dataSources/RealtimeDataSource";
import {AlertSourceSettings} from "../AlertSourceSettingsBase";
import {FEAlertBase} from "../FEAlertBase";

export class PriceAlert extends FEAlertBase {
    private _value: number = null;

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
    }

    condition: EPriceAlertCondition = EPriceAlertCondition.Crossing;

    get alertType(): EAlertType {
        return EAlertType.PriceAlert;
    }

    constructor() {
        super();
    }

    protected _valueChanged() {
        if (this.dataSource.lastValue === null || this._value === null) {
            return;
        }

        if (this.condition !== EPriceAlertCondition.GreaterThan && this.condition !== EPriceAlertCondition.LessThan) {
            if (this.dataSource.previouseValue === null) {
                return;
            }
        }

        switch (this.condition) {
            case EPriceAlertCondition.Crossing: {
                if (this.dataSource.lastValue > this._value && this.dataSource.previouseValue < this._value) {
                    this.raiseAlertTriggered();
                } else if (this.dataSource.lastValue < this._value && this.dataSource.previouseValue > this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EPriceAlertCondition.CrossingUp: {
                if (this.dataSource.lastValue > this._value && this.dataSource.previouseValue < this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EPriceAlertCondition.CrossingDown: {
                if (this.dataSource.lastValue < this._value && this.dataSource.previouseValue > this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EPriceAlertCondition.GreaterThan: {
                if (this.dataSource.lastValue > this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EPriceAlertCondition.LessThan: {
                if (this.dataSource.lastValue < this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
        }
    }

    getSettings(): PriceAlertSettings {
        const settingsBase = super.getSettings() as PriceAlertSettings;
        settingsBase.Value = this.value;
        return settingsBase;
    }

    applySettings(data: PriceAlertSettings) {
        super.applySettings(data);
        this.value = data.Value;
    }

    getDescription(): string {
        if (!this.dataSource) {
            return '';
        }

        let source = this.dataSource.getDescription();
        return source + " " + this.getConditionTitle() + " " + this.value;
    }

}

