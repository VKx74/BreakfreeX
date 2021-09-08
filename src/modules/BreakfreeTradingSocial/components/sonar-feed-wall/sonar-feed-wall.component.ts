import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { IBFTATrend } from "@app/services/algo.service";
import { IdentityService } from "@app/services/auth/identity.service";
import { InstrumentService } from "@app/services/instrument.service";
import { Actions, LinkingAction } from "@linking/models";
import { SonarFeedItem } from "modules/BreakfreeTradingSocial/models/sonar.feed.models";
import { SonarFeedService } from "modules/BreakfreeTradingSocial/services/sonar.feed.service";
import { Subscription } from "rxjs";
import { SonarFeedCardVM } from "../sonar-feed-card/sonar-feed-card.component";

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
    private _loadCount: number = 20;
    private _firstVisible: number = 0;
    private _lastVisible: number = 5;
    private _timer: any;
    private _canLoadMore: boolean = true;
    private _loadingMore: boolean = false;
    private _refreshNeeded: boolean = false;
    private _itemChangedSubscription: Subscription;
    private _items: SonarFeedItem[] = [];

    @Output() onOpenChart = new EventEmitter<LinkingAction>();

    public cards: SonarFeedCardVM[] = [];
    public loading: boolean;
    public initialized: boolean;

    constructor(protected _identityService: IdentityService,
        protected _sonarFeedService: SonarFeedService,
        protected _host: ElementRef,
        protected _instrumentService: InstrumentService,
        protected _cdr: ChangeDetectorRef) {
        this._initData();
        this._timer = setInterval(() => {
            if (this._refreshNeeded) {
                this._refreshNeeded = false;
                this._cdr.detectChanges();
            }
        }, 1000);

        this._itemChangedSubscription = this._sonarFeedService.onItemChanged.subscribe((_: SonarFeedItem) => {
            this.updateItem(_);
        });
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

        if (this._itemChangedSubscription) {
            this._itemChangedSubscription.unsubscribe();
            this._itemChangedSubscription = null;
        }
    }

    onScroll(event) {
        this._updateVisibleRecords(event.target);
    }

    isCardVisible(card: SonarFeedCardVM) {
        const index = this.cards.indexOf(card);
        return index >= this._firstVisible && index <= this._lastVisible;
    }

    updateItem(item: SonarFeedItem) {
        const itemIndex = this._items.findIndex(_ => _.id === item.id);
        if (itemIndex !== -1) {
            this._items[itemIndex] = item;
        } 
        
        const cardIndex = this.cards.findIndex(_ => _.id === item.id);
        if (cardIndex !== -1) {
            this._updateVM(this.cards[cardIndex], item);
        }

        this._cdr.detectChanges();
    }

    viewOnChart(card: SonarFeedCardVM) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrumentAndTimeframe,
            data: {
                instrument: card.instrument,
                timeframe: card.granularity,
                replayDate: new Date(card.time * 1000)
            }
        };
        this.onOpenChart.next(linkAction);
    }

    like(card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.likeItem(card.id).subscribe(() => {
            this.loading = false;
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    dislike(card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.dislikeItem(card.id).subscribe(() => {
            this.loading = false;
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
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
        this._lastVisible = lastVisibleItem + 2;

        if (this._items && this._lastVisible >= this._items.length && this._canLoadMore && !this._loadingMore) {
            this._loadMore();
        }
    }

    private _initData() {
        this.loading = true;
        this._sonarFeedService.getItems(0, this._loadCount).subscribe((data: SonarFeedItem[]) => {
            this._renderCards(data);
            this.initialized = true;
            this.loading = false;
        }, (error) => {
        });
    }

    private _loadMore() {
        this._loadingMore = true;
        this._sonarFeedService.getItems(this._items.length, this._loadCount).subscribe((data: SonarFeedItem[]) => {
            this._renderCards(data);
            this._loadingMore = false;

            if (data.length < this._loadCount) {
                this._canLoadMore = false;
            }
        }, (error) => {
            this._loadingMore = false;
        });
    }


    private _renderCards(items: SonarFeedItem[]) {
        for (const i of items) {
            const existing = this._items.find(_ => _.id === i.id);
            if (!existing) {
                this._items.push(i);
                this._mapInstrumentAndAdd(i);
            }
        }
    }

    private _mapInstrumentAndAdd(setupItem: SonarFeedItem) {
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

            this.cards.push(this._convertToVM(setupItem, instrument));

            this._refreshNeeded = true;

        }, (error) => {

        });
    }

    private _convertToVM(item: SonarFeedItem, instrument: IInstrument): SonarFeedCardVM {
        return {
            id: item.id,
            dislikeCount: item.dislikesCount,
            likeCount: item.likesCount,
            granularity: item.granularity,
            hasMyDislike: item.hasUserDislike,
            hasMyLike: item.hasUserLike,
            instrument: instrument,
            time: item.time,
            title: this._getTitle(item.granularity, item.symbol, item.type, item.side === IBFTATrend.Up ? "Long" : "Short")
        };
    }
    
    private _updateVM(vm: SonarFeedCardVM, item: SonarFeedItem) {
        // const vm = this.cards[cardIndex];
        vm.dislikeCount = item.dislikesCount;
        vm.likeCount = item.likesCount;
        vm.hasMyDislike = item.hasUserDislike;
        vm.hasMyLike = item.hasUserLike;
        // this.cards[cardIndex] = vm;
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