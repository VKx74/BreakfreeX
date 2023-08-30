import { Component, Injector, Inject, ViewChild, Input } from '@angular/core';
import { ETrendIndexStrength } from '../trendIndex/trendIndex.component';

@Component({
    selector: 'trend-column',
    templateUrl: './trendColumn.component.html',
    styleUrls: ['./trendColumn.component.scss']
})
export class TrendColumnComponent {
    private _strength: ETrendIndexStrength;
    private _strengthValue: number;
    private _volatilityValue: number;
    private _trendState: number;

    @Input() public set Strength(value: ETrendIndexStrength) {
        this._strength = value;
    }

    @Input() public set StrengthValue(value: number) {
        this._strengthValue = value * 100;
    }

    @Input() public set VolatilityValue(value: number) {
        this._volatilityValue = value;
    }

    @Input() public set TrendState(value: number) {
        this._trendState = value;
    }

    public get Strength(): ETrendIndexStrength {
        return this._strength;
    }

    public get StrengthValue(): number {
        return this._strengthValue;
    }

    public get VolatilityValue(): number {
        return this._volatilityValue;
    }

    public get TrendState(): number {
        return this._trendState;
    }

    ETrendIndexStrength = ETrendIndexStrength;
    
    constructor() {
    }
}

