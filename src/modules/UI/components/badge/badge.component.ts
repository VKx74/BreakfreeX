import {
    Component
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
    selector: 'badge',
    templateUrl: './badge.component.html',
    styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
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
