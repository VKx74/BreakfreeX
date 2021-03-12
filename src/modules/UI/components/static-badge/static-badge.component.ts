import {
    Component, Input
} from '@angular/core';

enum Ranks {
    Newbie = "newbie",
    Bronze = "bronze",
    Silver = "silver",
    Gold = "gold",
    Platinum = "platinum",
    Master = "master",
    Legend = "legend"
}

@Component({
    selector: 'static-badge',
    templateUrl: './static-badge.component.html',
    styleUrls: ['./static-badge.component.scss'],
})
export class StaticBadgeComponent {
    @Input() ranksName: string = '';

    public Ranks: any = Ranks;

    public get rank(): string {
        return this.ranksName ? this.ranksName.toLowerCase() : "";
    }

    constructor() {
    }
}
