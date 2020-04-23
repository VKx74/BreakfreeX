import {AlertBase} from "../AlertBase";
import {EAlertType, EPriceAlertCondition} from "../Enums";
import {IndicatorSeriesDescription} from '../dataSources/IndicatorSeriesDescription';
import {IndicatorAlertSettings} from '../AlertSettingsBase';

export class IndicatorAlert extends AlertBase {

    protected _indicatorSeriesDescription: IndicatorSeriesDescription;

    public condition: EPriceAlertCondition;

    get alertType(): EAlertType {
        return EAlertType.IndicatorAlert;
    }

    get indicatorSeriesDescription(): IndicatorSeriesDescription {
        return this._indicatorSeriesDescription;
    }
    
    get canRunOnFrontend(): boolean {
        return false;
    }

    constructor() {
        super();
    }

    getSettings(): IndicatorAlertSettings {
        const settingsBase = super.getSettings() as IndicatorAlertSettings;
        settingsBase.IndicatorSeriesDescription = this.indicatorSeriesDescription;
        return settingsBase;
    }

    applySettings(data: IndicatorAlertSettings) {
        super.applySettings(data);
        this._indicatorSeriesDescription = data.IndicatorSeriesDescription;
    }

    getDescription(): string {
        if (!this.dataSource) {
            return '';
        }

        let source = this.dataSource.getDescription();
        let series = this.indicatorSeriesDescription.Title;
        return source + " " + this.getConditionTitle() + " " + series;
    }

}

