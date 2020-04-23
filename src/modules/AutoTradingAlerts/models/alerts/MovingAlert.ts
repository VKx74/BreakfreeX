import {AlertBase} from "../AlertBase";
import {EAlertType, EDataSourceType, EMovingAlertCondition} from "../Enums";
import {MovingAlertSettings} from "../AlertSettingsBase";
import {RealtimeDataSource} from "../dataSources/RealtimeDataSource";
import {FEAlertBase} from "../FEAlertBase";

export class MovingAlert extends FEAlertBase {
    private _startPrice: number = null;
    private _startTime: number = null;

    private _value: number = null;

    get value(): number {
        return this._value;
    }

    set value(value: number) {
        this._value = value;
    }

    private _time: number = null;

    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
    }

    condition: EMovingAlertCondition = EMovingAlertCondition.MovingUp;

    get alertType(): EAlertType {
        return EAlertType.MovingAlert;
    }

    constructor() {
        super();
    }

    stop() {
        this._startPrice = null;
        this._startTime = null;

        return super.stop();
    }

    protected _valueChanged() {
        if (this.dataSource.lastValue === null || this._value === null || this._time === null) {
            return;
        }

        if (this._startPrice === null || this._time === null) {
            this._startPrice = this.dataSource.lastValue;
            this._startTime = this.dataSource.time;
            return;
        }

        const timeDiff = this.dataSource.time - this._startTime / 1000 / 60; // time diff in minutes

        if (timeDiff > this._time) {
            this.stop();
            return;
        }

        const last = this.dataSource.lastValue;

        switch (this.condition) {
            case EMovingAlertCondition.MovingUp: {
                if (last - this._startPrice >= this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EMovingAlertCondition.MovingDown: {
                if (this._startPrice - last  >= this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EMovingAlertCondition.MovingUpPercentage: {
                const percentage = (last - this._startPrice) / this._startPrice * 100;
                if (percentage >= this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
            case EMovingAlertCondition.MovingDownPercentage: {
                const percentage = (this._startPrice - last) / last * 100;
                if (percentage >= this._value) {
                    this.raiseAlertTriggered();
                }
            } break;
        }
    }

    getSettings(): MovingAlertSettings {
        const settingsBase = super.getSettings() as MovingAlertSettings;
        settingsBase.Value = this.value;
        settingsBase.Time = this.time;
        return settingsBase;
    }

    applySettings(data: MovingAlertSettings) {
        super.applySettings(data);
        this.value = data.Value;
        this.time = data.Time;
    }

    getDescription(): string {
        if (!this.dataSource) {
            return '';
        }

        let source = this.dataSource.getDescription();
        
        return source + " " + this.getConditionTitle() + " on " + this.value;
    }

}

