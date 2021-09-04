import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { AlgoService, IBFTATrend, IBFTScanInstrumentsResponse, IBFTScanInstrumentsResponseItem } from "@app/services/algo.service";
import { IdentityService } from "@app/services/auth/identity.service";
import { InstrumentService } from "@app/services/instrument.service";

export interface ISonarFeedCard {
    instrument: IInstrument;
    granularity: number;
    time: number;
    title: string;
}

@Component({
    selector: 'sonar-feed-wall',
    templateUrl: './sonar-feed-wall.component.html',
    styleUrls: ['./sonar-feed-wall.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedWallComponent implements OnInit {
    private _firstVisible: any = 0;
    private _lastVisible: any = 5;
    private _timer: any;
    private _refreshNeeded: boolean = false;
    private _items: IBFTScanInstrumentsResponseItem[] = [];

    public cards: ISonarFeedCard[] = [];
    public loading: boolean;

    constructor(protected _identityService: IdentityService,
        protected _alogService: AlgoService,
        protected _host: ElementRef,
        protected _instrumentService: InstrumentService,
        protected _cdr: ChangeDetectorRef) {
        this._scanMarket();
        this._timer = setInterval(() => {
            if (this._refreshNeeded) {
                this._refreshNeeded = false;
                this._cdr.detectChanges();
            }
        }, 1000);

    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    onScroll(event) {
        this._updateVisibleRecords(event.target);
    }

    isCardVisible(card: ISonarFeedCard) {
        const index = this.cards.indexOf(card);
        return index >= this._firstVisible && index <= this._lastVisible;
    }

    private _updateVisibleRecords(target: any) {
        const height = target.clientHeight;
        const cards = $(target).find(".card-container");
        if (!cards || !cards.length) {
            return;
        }

        const cardHeight = cards[0].clientHeight + cards[0].offsetTop;
        const scrolledTop = target.scrollTop;

        const firstVisibleItem = Math.trunc(scrolledTop / cardHeight);
        const lastVisibleItem = Math.trunc((scrolledTop + height) / cardHeight) + 1;

        this._firstVisible = firstVisibleItem;
        this._lastVisible = lastVisibleItem + 3;
    }

    private _scanMarket() {
        this.loading = true;
        this.cards = [];

        this._alogService.scanInstruments().subscribe((data: IBFTScanInstrumentsResponse) => {
            this._items = data.items;
            this._renderCards();
        }, (error) => {
        });
    }
    

    private _renderCards() {
        for (const i of this._items) {
            this._mapInstrumentAndAdd(i);
        }

        
        this.loading = false;
    }

    private _mapInstrumentAndAdd(setupItem: IBFTScanInstrumentsResponseItem) {
        this._instrumentService.getInstruments(null, setupItem.symbol).subscribe((data: IInstrument[]) => {
            if (!data || !data.length) {
                return;
            }

            let instrument = data[0];

            for (const i of data) {
                try {
                    if (i.exchange && i.exchange.toLowerCase() === setupItem.exchange.toLowerCase() && i.id.toLowerCase() === setupItem.symbol.toLowerCase()) {
                        instrument = i;
                    }
                } catch (e) {
                }
            }

            if (!instrument) {
                return;
            }

            this.cards.push({
                instrument: instrument,
                granularity: setupItem.timeframe,
                time: new Date().getTime() / 1000,
                title: this._getTitle(setupItem.timeframe, setupItem.symbol, setupItem.type, setupItem.trend === IBFTATrend.Up ? "Long" : "Short")
            });

            this._refreshNeeded = true;

        }, (error) => {

        });
    }

    private _getTitle(granularity: number, symbol: string, setup: string, side: string) {
        let timeFrame = "";
        let min = 60;
        let hour = min * 60;
        let day = hour * 24;

        if (granularity < hour) {
            timeFrame = `${granularity / min}M`;
        } else if (granularity < day) {
            timeFrame = `${granularity / hour}H`;
        } else {
            timeFrame = `${granularity / day}D`;
        }

        return `${timeFrame} ${symbol} ${setup} ${side}`;
    }


}