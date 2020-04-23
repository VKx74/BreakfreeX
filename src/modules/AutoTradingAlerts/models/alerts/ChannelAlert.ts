import {EAlertType, EChannelAlertCondition} from "../Enums";
import {ChannelAlertSettings} from "../AlertSettingsBase";
import {FEAlertBase} from "../FEAlertBase";

export class ChannelAlert extends FEAlertBase {
    private _value1: number = null;

    get value1(): number {
        return this._value1;
    }

    set value1(value: number) {
        this._value1 = value;
    }

    private _value2: number = null;

    get value2(): number {
        return this._value2;
    }

    set value2(value: number) {
        this._value2 = value;
    }

    condition: EChannelAlertCondition = EChannelAlertCondition.EnteringChannel;

    get alertType(): EAlertType {
        return EAlertType.ChannelAlert;
    }

    constructor() {
        super();
    }

    protected _valueChanged() {
        if (this.dataSource.lastValue === null || this._value1 === null || this._value2 === null) {
            return;
        }

        if (this.condition !== EChannelAlertCondition.InsideChannel && this.condition !== EChannelAlertCondition.OutsideChannel) {
            if (this.dataSource.previouseValue === null) {
                return;
            }
        }

        const last = this.dataSource.lastValue;
        const prev = this.dataSource.previouseValue;

        switch (this.condition) {
            case EChannelAlertCondition.InsideChannel: {
                if (last > Math.min(this._value1, this._value2) && last < Math.max(this._value1, this._value2)) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EChannelAlertCondition.OutsideChannel: {
                if (last < Math.min(this._value1, this._value2) || last > Math.max(this._value1, this._value2)) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EChannelAlertCondition.EnteringChannel: {
                if (last > Math.min(this._value1, this._value2) && last < Math.max(this._value1, this._value2)) {
                    if (prev < Math.min(this._value1, this._value2) || prev > Math.max(this._value1, this._value2)) {
                        this.raiseAlertTriggered();
                    }
                }
            } break;
            case EChannelAlertCondition.ExitingChannel: {
                if (last < Math.min(this._value1, this._value2) || last > Math.max(this._value1, this._value2)) {
                    if (prev > Math.min(this._value1, this._value2) && prev < Math.max(this._value1, this._value2)) {
                        this.raiseAlertTriggered();
                    }
                }
            } break;
        }
    }

    getSettings(): ChannelAlertSettings {
        const settingsBase = super.getSettings() as ChannelAlertSettings;
        settingsBase.Value1 = this.value1;
        settingsBase.Value2 = this.value2;
        return settingsBase;
    }

    applySettings(data: ChannelAlertSettings) {
        super.applySettings(data);
        this.value1 = data.Value1;
        this.value2 = data.Value2;
    }

    getDescription(): string {
        if (!this.dataSource) {
            return '';
        }

        let source = this.dataSource.getDescription();

        return source + " " + this.getConditionTitle() + " [" + Math.min(this.value1, this.value2) + ":" + Math.max(this.value1, this.value2) + "]";
    }

}

