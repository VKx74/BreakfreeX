import {Component, Input, OnInit} from '@angular/core';
import {TrendDirection, WatchlistInstrumentVM} from "../../models/models";

@Component({
    selector: 'watchlist-tile',
    templateUrl: './watchlist-tile.component.html',
    styleUrls: ['./watchlist-tile.component.scss']
})
export class WatchlistTileComponent implements OnInit {
    @Input() watchlistInstrumentVM: WatchlistInstrumentVM;
    @Input() isSelected: boolean;
    @Input() chartHistory;

    get TrendDirection() {
        return TrendDirection;
    }

    constructor() {
    }

    ngOnInit() {
    }
}
