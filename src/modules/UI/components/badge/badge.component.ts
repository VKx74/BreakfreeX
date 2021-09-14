import {
    Component, Input
} from '@angular/core';
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';

enum Ranks {
    Newbie = "Newbie",
    Bronze = "Bronze",
    Silver = "Silver",
    Gold = "Gold",
    Platinum = "Platinum",
    Master = "Master",
    Legend = "Legend"
}

@Component({
    selector: 'my-badge',
    templateUrl: './badge.component.html',
    styleUrls: ['./badge.component.scss'],
})
export class MyBadgeComponent {
    public Ranks: any = Ranks;

    public get rank(): Ranks {
        return this._tradingProfileService.levelName as Ranks;
    }

    public get level(): number {
        return this._tradingProfileService.level;
    }

    constructor(private _tradingProfileService: TradingProfileService) {
    }
}

@Component({
    selector: 'badge',
    templateUrl: './badge.component.html',
    styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
    private _rank: any;
    private _level: number;

    public Ranks: any = Ranks;

    public get rank(): Ranks {
        return this._rank;
    }

    public get level(): number {
        return this._level;
    }

    @Input() public set rank(value: Ranks) {
        this._rank = value;
    }

    @Input() public set level(value: number) {
        this._level = value;
    }

    constructor() {
    }
}
