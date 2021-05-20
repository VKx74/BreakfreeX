import { Injectable } from "@angular/core";
import { IdentityService } from "../../../app/services/auth/identity.service";
import { ReplayModeSync } from "./replay-mode-sync.service";
@Injectable()
export class IndicatorRestrictionService {
    private _restrictedIndicators: string[] = [];
    private _demoInstrument: string = "eurusd";

    constructor(protected _identity: IdentityService) {
        if (this._identity.isAdmin) {
            return;
        }

        if (!this._identity.isAuthorizedCustomer) {
            this._restrictedIndicators.push(TradingChartDesigner.RTD.instanceTypeName);
            this._restrictedIndicators.push(TradingChartDesigner.BreakfreeTradingPro.instanceTypeName);
            this._restrictedIndicators.push(TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName);
        } else {
            if (!this._identity.isPro) {
                this._restrictedIndicators.push(TradingChartDesigner.BreakfreeTradingPro.instanceTypeName);
            } else {
                this._restrictedIndicators.push(TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName);
            }
        }
    }

    public getRestrictions(chart: TradingChartDesigner.Chart): string[] {
        const chartInstrument = chart.instrument.id.toLowerCase().replace("_", "");
        if (ReplayModeSync.IsChartReplay && !ReplayModeSync.IsChartReplayStarted && chartInstrument === this._demoInstrument) {
            return [TradingChartDesigner.BreakfreeTradingPro.instanceTypeName];
        }
        
        return this._restrictedIndicators;
    } 
    
    public canRunStrategyReplay(chart: TradingChartDesigner.Chart): boolean {
        const chartInstrument = chart.instrument.id.toLowerCase().replace("_", "");
        if (ReplayModeSync.IsChartReplay && !ReplayModeSync.IsChartReplayFinished && chartInstrument === this._demoInstrument) {
            return true;
        }

        return this.isAdmin();
    }
    
    public canRunXModeReplay(chart: TradingChartDesigner.Chart): boolean {
        return true;
    }

    public validate(chart: TradingChartDesigner.Chart, name: string): boolean {
        const chartInstrument = chart.instrument.id.toLowerCase().replace("_", "");
        if (ReplayModeSync.IsChartReplay && !ReplayModeSync.IsChartReplayStarted && chartInstrument === this._demoInstrument) {
            if (name === TradingChartDesigner.BreakfreeTradingDiscovery.instanceTypeName ||
                name === TradingChartDesigner.RTD.instanceTypeName) {
                return true;
            }
        }

        for (const restriction of this._restrictedIndicators) {
            if (restriction.toUpperCase() === name.toUpperCase()) {
                return false;
            }
        }
        
        return true;
    }

    private isAdmin() {
        return this._identity.isAdmin;
    }
}
