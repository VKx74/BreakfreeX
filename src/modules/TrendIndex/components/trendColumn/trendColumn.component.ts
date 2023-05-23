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

    @Input() public set Strength(value: ETrendIndexStrength) {
        this._strength = value;
    }

    @Input() public set StrengthValue(value: number) {
        this._strengthValue = value * 100;
    }

    public get Strength(): ETrendIndexStrength {
        return this._strength;
    }

    public get StrengthValue(): number {
        return this._strengthValue;
    }

    ETrendIndexStrength = ETrendIndexStrength;
    
    constructor() {
    }
}

