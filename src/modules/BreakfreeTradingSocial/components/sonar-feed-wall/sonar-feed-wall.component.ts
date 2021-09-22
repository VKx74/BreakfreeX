import { AlertService } from "@alert/services/alert.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AppRoutes } from "@app/app.routes";
import { IInstrument } from "@app/models/common/instrument";
import { IBFTATrend } from "@app/services/algo.service";
import { IdentityService, SubscriptionType } from "@app/services/auth/identity.service";
import { EMarketSpecific } from "@app/models/common/marketSpecific";
import { ForexTypeHelper } from "@app/services/instrument.type.helper/forex.types.helper";
import { Actions, LinkingAction } from "@linking/models";
import { SocialFeedCommentAddedNotification, SocialFeedCommentEditedNotification, SocialFeedCommentReactionNotification, SocialFeedCommentRemovedNotification, SocialFeedPostReactionNotification, SonarFeedComment, SonarFeedItem, SonarFeedItemCommentLikeResponse, SonarFeedItemLikeResponse } from "modules/BreakfreeTradingSocial/models/sonar.feed.models";
import { InstrumentCacheService } from "modules/BreakfreeTradingSocial/services/instrument.cache.service";
import { SocialFeedModelConverter } from "modules/BreakfreeTradingSocial/services/models.convertter";
import { ESonarFeedMarketTypes, ESonarFeedSetupTypes, ISonarSetupFilters, SonarFeedService } from "modules/BreakfreeTradingSocial/services/sonar.feed.service";
import { ConfirmModalComponent } from "modules/UI/components";
import { Subscription } from "rxjs";
import { JsUtil } from "utils/jsUtil";
import { IReplayData } from "../sonar-feed-card/sonar-feed-card.component";
import { TradingProfileService } from "modules/BreakfreeTrading/services/tradingProfile.service";

export interface SonarFeedCommentVM {
    id: any;
    text: string;
    userName: string;
    userAvatarId: string;
    userLevel: string;
    levelName: string;
    likesCount: number;
    dislikesCount: number;
    hasUserLike: boolean;
    hasUserDislike: boolean;
    comments: SonarFeedCommentVM[];
    isOwnComment: boolean;
    isRootComment: boolean;
    time: number;
}

export interface SonarFeedCardVM {
    id: any;
    instrument: IInstrument;
    granularity: number;
    time: number;
    title: string;
    timeFrame: string;
    symbol: string;
    setup: string;
    side: string;
    hasMyLike: boolean;
    hasMyDislike: boolean;
    likeCount: number;
    dislikeCount: number;
    commentsTotal: number;
    sortIndex: number;
    isFavorite: boolean;
    comments: SonarFeedCommentVM[];
}

export interface ISonarFeedCard {
    instrument: IInstrument;
    granularity: number;
    time: number;
    title: string;
}

enum TimeFrames {
    Min15 = "15 Min",
    Hour1 = "1 Hour",
    Hour4 = "4 Hour",
    Day = "Daily",
}

enum TradeTypes {
    Ext = "Extension",
    BRC = "Break Retest & Continuation",
    Swing = "Swing"
}

enum SonarFeedMarketTypes {
    MajorForex = "Major Forex",
    ForexMinors = "Forex Minors",
    ForexExotic = "Forex Exotic",
    Metals = "Metals",
    Indices = "Indices",
    Equities = "Equities",
    Crypto = "Crypto",
    Commodities = "Commodities",
    Bonds = "Bonds"
}

@Component({
    selector: 'sonar-feed-wall',
    templateUrl: './sonar-feed-wall.component.html',
    styleUrls: ['./sonar-feed-wall.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedWallComponent implements OnInit {
    private _loadCount: number = 30;
    private _firstVisible: number = 0;
    private _lastVisible: number = 5;
    private _timer: any;
    private _canLoadMore: boolean = true;
    private _loadingMore: boolean = false;
    private _refreshNeeded: boolean = false;
    private _commentReactionSubscription: Subscription;
    private _postReactionSubscription: Subscription;
    private _commentAddedSubscription: Subscription;
    private _commentEditedSubscription: Subscription;
    private _commentRemovedSubscription: Subscription;
    private _itemAddedSubscription: Subscription;
    private _missionsInitializedSubscription: Subscription;
    private _cardId: any;
    private _scrollTop: number = 0;
    private _selectedCard: SonarFeedCardVM;
    private _isNewUpdatesExists: boolean;
    private _filterChanged: boolean = false;
    private _filteringParameters: ISonarSetupFilters;
    private _lastId: any;

    @ViewChild('scroll', { static: true }) scroll: ElementRef;

    @Output() onOpenChart = new EventEmitter<LinkingAction>();

    @Output() stateChanged = new EventEmitter<ISonarSetupFilters>();

    @Input() isSingleCard: boolean = false;

    @Input() state: ISonarSetupFilters;

    @Input() set cardId(value: any) {
        this._cardId = value;
    }

    public cards: SonarFeedCardVM[] = [];
    public loading: boolean;
    public initialized: boolean;

    public allowedTimeFrames: TimeFrames[] = [TimeFrames.Min15, TimeFrames.Hour1, TimeFrames.Hour4, TimeFrames.Day];
    public selectedTimeFrames: TimeFrames[];
    public prevSelectedTimeFrames: TimeFrames[];

    public allowedTradeTypes: TradeTypes[] = [TradeTypes.BRC, TradeTypes.Ext, TradeTypes.Swing];
    public selectedTradeTypes: TradeTypes[];
    public prevSelectedTradeTypes: TradeTypes[];

    public allowedMarketTypes: SonarFeedMarketTypes[] = [SonarFeedMarketTypes.MajorForex, SonarFeedMarketTypes.ForexMinors, SonarFeedMarketTypes.ForexExotic,
    SonarFeedMarketTypes.Equities, SonarFeedMarketTypes.Indices, SonarFeedMarketTypes.Metals, SonarFeedMarketTypes.Commodities, SonarFeedMarketTypes.Bonds, SonarFeedMarketTypes.Crypto];
    public selectedMarketTypes: SonarFeedMarketTypes[];
    public prevSelectedMarketTypes: SonarFeedMarketTypes[];

    public get IsNewUpdatesExists(): boolean {
        return this._isNewUpdatesExists;
    }

    public get FilterChanged(): boolean {
        return this._filterChanged;
    }

    public get selectedCard(): SonarFeedCardVM {
        return this._selectedCard;
    }

    constructor(protected _identityService: IdentityService,
        protected _sonarFeedService: SonarFeedService,
        protected _host: ElementRef,
        protected _dialog: MatDialog,
        protected _alertService: AlertService,
        protected _identity: IdentityService,
        protected _instrumentService: InstrumentCacheService,
        protected _tradingProfileService: TradingProfileService,
        protected _cdr: ChangeDetectorRef) {

        this._timer = setInterval(() => {
            if (this._refreshNeeded) {
                this._refreshNeeded = false;
                this._cdr.detectChanges();
            }
        }, 300);

        this.selectedTimeFrames = this.allowedTimeFrames.slice();
        this.selectedMarketTypes = this.allowedMarketTypes.slice();
        this.selectedTradeTypes = this.allowedTradeTypes.slice();

        if (this._identityService.subscriptionType === SubscriptionType.Discovery) {
            this._loadCount = 100;
        } else if (this._identityService.subscriptionType !== SubscriptionType.Pro && this._identityService.subscriptionType !== SubscriptionType.Trial) {
            this._loadCount = 150;
        }
    }

    ngOnInit() {
        this._commentReactionSubscription = this._sonarFeedService.onCommentReaction.subscribe((_: SocialFeedCommentReactionNotification) => {
            this._commentReaction(_);
        });

        this._postReactionSubscription = this._sonarFeedService.onPostReaction.subscribe((_: SocialFeedPostReactionNotification) => {
            this._postReaction(_);
        });

        this._commentAddedSubscription = this._sonarFeedService.onCommentAdded.subscribe((_: SocialFeedCommentAddedNotification) => {
            this._commentAdded(_);
        });

        this._commentEditedSubscription = this._sonarFeedService.onCommentEdited.subscribe((_: SocialFeedCommentEditedNotification) => {
            this._commentEdited(_);
        });

        this._commentRemovedSubscription = this._sonarFeedService.onCommentRemoved.subscribe((_: SocialFeedCommentRemovedNotification) => {
            this._commentRemoved(_);
        });

        this._itemAddedSubscription = this._sonarFeedService.onPostAdded.subscribe((_: SonarFeedItem) => {
            if (!this.isSingleCard) {
                const isFitFilters = this._isFitCardCurrentFilters(_);
                const isInAccess = this._isCardAllowed(_.granularity);
                if (isFitFilters && isInAccess) {
                    this.addItem(_);
                }
            }
        });
    }

    ngAfterViewInit() {
        if (!this.isSingleCard) {
            if (this.state) {
                this._mapToSettings(this.state);
                this._filteringParameters = this._mapToTilters();
            }
        }
        
        this.loading = true;

        this._missionsInitializedSubscription = this._tradingProfileService.MissionsInitialized.subscribe((isInitialized) => {
            if (isInitialized && !this.initialized) {
                if (this.isSingleCard && this._cardId) {
                    this._loadItem();
                } else {
                    this._initData();
                }
            }
        });
    }

    ngOnDestroy() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }

        if (this._itemAddedSubscription) {
            this._itemAddedSubscription.unsubscribe();
            this._itemAddedSubscription = null;
        }

        if (this._commentReactionSubscription) {
            this._commentReactionSubscription.unsubscribe();
            this._commentReactionSubscription = null;
        }

        if (this._postReactionSubscription) {
            this._postReactionSubscription.unsubscribe();
            this._postReactionSubscription = null;
        }

        if (this._commentAddedSubscription) {
            this._commentAddedSubscription.unsubscribe();
            this._commentAddedSubscription = null;
        }

        if (this._commentEditedSubscription) {
            this._commentEditedSubscription.unsubscribe();
            this._commentEditedSubscription = null;
        }

        if (this._commentRemovedSubscription) {
            this._commentRemovedSubscription.unsubscribe();
            this._commentRemovedSubscription = null;
        }
        
        if (this._missionsInitializedSubscription) {
            this._missionsInitializedSubscription.unsubscribe();
            this._missionsInitializedSubscription = null;
        }
    }

    onScroll(event) {
        if (this.isSingleCard) {
            return;
        }
        this._updateVisibleRecords(event.target);
    }

    isCardVisible(card: SonarFeedCardVM) {
        if (this.isSingleCard) {
            return true;
        }
        const index = this.cards.indexOf(card);
        return index >= this._firstVisible && index <= this._lastVisible;
    }

    addItem(item: SonarFeedItem) {
        const cardIndex = this.cards.findIndex(_ => _.id === item.id);
        if (cardIndex !== -1) {
            return;
        }

        this._refreshNeeded = true;
        this._renderCards([item]);

        if (this._scrollTop > 10) {
            this._isNewUpdatesExists = true;
        }
    }

    scrollTop() {
        this._isNewUpdatesExists = false;
        this._scrollToTop();
        this._refreshNeeded = true;
    }

    viewOnChart(card: SonarFeedCardVM) {
        const linkAction: LinkingAction = {
            type: Actions.ChangeInstrumentAndTimeframe,
            data: {
                instrument: card.instrument,
                timeframe: card.granularity,
                // replayDate: new Date(card.time * 1000)
            }
        };
        this.onOpenChart.next(linkAction);
    }

    showAllComments(card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.getComments(card.id).subscribe((comments: SonarFeedComment[]) => {
            this.loading = false;
            this._setComments(card, comments);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    private _setComments(card: SonarFeedCardVM, comments: SonarFeedComment[]) {
        card.comments = comments.map(_ => this._convertCommentToVM(_, true));
    }

    like(card: SonarFeedCardVM) {
        if (!card.hasMyLike) {
            this.loading = true;
            this._sonarFeedService.likeItem(card.id).subscribe((response: SonarFeedItemLikeResponse) => {
                this.loading = false;
                this._updatePostLikes(response);
                this._refreshNeeded = true;
            }, () => {
                this.loading = false;
                this._refreshNeeded = true;
            });
        } else {
            this.deleteLike(card);
        }
    }

    dislike(card: SonarFeedCardVM) {
        if (!card.hasMyDislike) {
            this.loading = true;
            this._sonarFeedService.dislikeItem(card.id).subscribe((response: SonarFeedItemLikeResponse) => {
                this.loading = false;
                this._updatePostLikes(response);
                this._refreshNeeded = true;
            }, () => {
                this.loading = false;
                this._refreshNeeded = true;
            });
        } else {
            this.deleteLike(card);
        }
    }

    deleteLike(card: SonarFeedCardVM) {
        if (!card.hasMyLike && !card.hasMyDislike) {
            return;
        }

        this.loading = true;
        this._sonarFeedService.deleteLikeItem(card.id).subscribe((response: SonarFeedItemLikeResponse) => {
            this.loading = false;
            this._updatePostLikes(response);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    favorite(card: SonarFeedCardVM) {
        if (card.isFavorite) {
            this.loading = true;
            this._sonarFeedService.deleteFavorite(card.id).subscribe(() => {
                this.loading = false;
                card.isFavorite = false;
                this._refreshNeeded = true;
            }, () => {
                this.loading = false;
                this._refreshNeeded = true;
            });
        } else {
            this.loading = true;
            this._sonarFeedService.setFavorite(card.id).subscribe(() => {
                this.loading = false;
                card.isFavorite = true;
                this._refreshNeeded = true;
            }, () => {
                this.loading = false;
                this._refreshNeeded = true;
            });
        }
    }

    share(card: SonarFeedCardVM) {
        const host = `${window.location.origin}/#/${AppRoutes.Platform}/${AppRoutes.SocialFeed}/${card.id}`;
        JsUtil.copyStringToClipboard(host);
        this._alertService.success("Share link copied to clipboard.");
    }

    commentLike(commentId: any, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.likeComment(commentId).subscribe((response: SonarFeedItemCommentLikeResponse) => {
            this.loading = false;
            this._updateCommentLikes(response, card.id);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    commentLikeDelete(commentId: any, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.deleteLikeComment(commentId).subscribe((response: SonarFeedItemCommentLikeResponse) => {
            this.loading = false;
            this._updateCommentLikes(response, card.id);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    commentDislike(commentId: any, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.dislikeComment(commentId).subscribe((response: SonarFeedItemCommentLikeResponse) => {
            this.loading = false;
            this._updateCommentLikes(response, card.id);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    removeComment(commentId: any, card: SonarFeedCardVM) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: "Do you really want to remove this comment?",
                onConfirm: () => {
                    this._removeComment(commentId, card);
                }
            }
        });
    }

    addComment(comment: string, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.postComment(card.id, comment).subscribe((commentResponse: SonarFeedComment) => {
            this.loading = false;
            this._addComment(commentResponse, card.id);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    addReplay(replayData: IReplayData, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.postReplay(replayData.commentId, replayData.text).subscribe(() => {
            this.loading = false;
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    editComment(replayData: IReplayData, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.editComment(replayData.commentId, replayData.text).subscribe(() => {
            this.loading = false;
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    clickOnCard(card: SonarFeedCardVM) {
        this._selectedCard = card;
    }

    clickOnWall(data: any) {
        if (!data.target || !data.target.attributes || !data.target.attributes['class']) {
            return;
        }

        const classValue = data.target.attributes['class'].value as string;
        if (classValue && classValue.indexOf("tcdCrossHairContainer") === -1) {
            this._selectedCard = null;
        }
    }

    filterChanged(data: any) {
        const filter = this._mapToTilters();
        this._filterChanged = !this._isFiltersSame(this._filteringParameters, filter);
    }

    applyFilters() {
        this._filteringParameters = this._mapToTilters();
        this.stateChanged.next(this._filteringParameters);
        this._initData();
    }

    cancelFilters(event: MouseEvent) {
        this.selectedMarketTypes = this.prevSelectedMarketTypes;
        this.selectedTradeTypes = this.prevSelectedTradeTypes;
        this.selectedTimeFrames = this.prevSelectedTimeFrames;
        this._filterChanged = false;
        event.stopPropagation();
        event.preventDefault();
    }

    private _scrollToTop() {
        this.scroll.nativeElement.scrollTop = 0;
    }

    private _removeComment(commentId: any, card: SonarFeedCardVM) {
        this.loading = true;
        this._sonarFeedService.deleteComment(commentId).subscribe(() => {
            this.loading = false;
            this._deleteCommentFromCommentsList(card.comments, commentId);
            this._refreshNeeded = true;
        }, () => {
            this.loading = false;
            this._refreshNeeded = true;
        });
    }

    private _isInside(a1: number, a2: number, b1: number, b2: number): boolean {
        if (a1 < b1 && a2 < b1) {
            return false;
        }

        if (a1 > b2 && a2 > b1) {
            return false;
        }

        return true;
    }

    private _updateVisibleRecords(target: any) {
        const height = target.clientHeight;
        const cards = $(target).find(".card-container");
        if (!cards || !cards.length) {
            return;
        }

        const cardsHeight: number[] = [];
        for (const card of cards) {
            cardsHeight.push($(card).outerHeight(true));
        }

        const scrolledTop = target.scrollTop;
        this._scrollTop = scrolledTop;

        if (scrolledTop < 10 && this._isNewUpdatesExists) {
            this._isNewUpdatesExists = false;
        }

        let totalHeight = 0;
        let index = 0;
        let visibleItems: number[] = [];

        for (const cardHeight of cardsHeight) {
            const start = totalHeight;
            const end = start + cardHeight;
            totalHeight += cardHeight;
            const isVisible = this._isInside(start, end, scrolledTop, scrolledTop + height);
            if (isVisible) {
                visibleItems.push(index);
            }
            index++;
        }

        this._firstVisible = Math.min(...visibleItems);
        this._lastVisible = Math.max(...visibleItems) + 2;
        // console.log(`!!! ${this._firstVisible} - ${this._lastVisible}`);

        if (this.cards && this.cards.length && this._lastVisible >= this.cards.length && this._canLoadMore && !this._loadingMore) {
            this._loadMore();
        }
    }

    private _initData() {
        this.loading = true;
        this.cards = [];

        this.prevSelectedMarketTypes = this.selectedMarketTypes;
        this.prevSelectedTradeTypes = this.selectedTradeTypes;
        this.prevSelectedTimeFrames = this.selectedTimeFrames;

        this._filterChanged = false;
        this._sonarFeedService.getItems(this._loadCount, this._filteringParameters).subscribe((data: SonarFeedItem[]) => {

            this.initialized = true;
            this.loading = false;

            if (data && data.length) {
                this._lastId = data[data.length - 1].id;
                this._canLoadMore = true;
            } else {
                this._lastId = null;
                this._canLoadMore = false;
            }

            const filtered = this._filterVisibleItems(data);

            this._renderCards(filtered);

            if (filtered.length < 10) {
                this._loadMore();
            }

            this._refreshNeeded = true;

        }, (error) => {
        });
    }

    private _loadItem() {
        this.loading = true;
        this.cards = [];
        this._sonarFeedService.getItem(this._cardId).subscribe((data: SonarFeedItem) => {
            this._renderCards([data]);
            this.initialized = true;
            this.loading = false;
        }, (error) => {
        });
    }

    private _tempRecursiveLoadingCounter = 0;

    private _loadMore() {
        this._loadingMore = true;
        this._sonarFeedService.getFromIdItems(this._lastId, this._loadCount, this._filteringParameters).subscribe((data: SonarFeedItem[]) => {

            this._loadingMore = false;

            if (data.length < this._loadCount) {
                this._canLoadMore = false;
            } else {
                this._lastId = data[data.length - 1].id;
                this._canLoadMore = true;
            }

            const filtered = this._filterVisibleItems(data);
            this._renderCards(filtered);
            this._tempRecursiveLoadingCounter += filtered.length;

            if (this._canLoadMore && this._lastId && this._tempRecursiveLoadingCounter < 10) {
                this._loadMore();
            } else {
                this._tempRecursiveLoadingCounter = 0;
            }

            this._refreshNeeded = true;

        }, (error) => {
            this._loadingMore = false;
        });
    }

    private _renderCards(items: SonarFeedItem[]) {

        for (const i of items) {
            const existing = this.cards.find(_ => _.id === i.id);
            if (existing) {
                continue;
            }

            this._mapInstrumentAndAdd(i);
        }
    }

    private _mapInstrumentAndAdd(setupItem: SonarFeedItem) {
        this._instrumentService.getInstrument(setupItem.symbol, setupItem.exchange).subscribe((instrument: IInstrument) => {
            if (!instrument) {
                return;
            }

            const card = this._convertToVM(setupItem, instrument);
            card.sortIndex = setupItem.id;

            this.cards.push(card);
            this.cards.sort((a, b) => b.sortIndex - a.sortIndex);

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
            title: this._getTitle(item.granularity, item.symbol, item.type, item.side === IBFTATrend.Up ? "Long" : "Short"),
            comments: this._getComments(item),
            commentsTotal: item.commentsTotal,
            isFavorite: item.isFavorite,
            sortIndex: -1,
            timeFrame: this._getTimeFrame(item.granularity),
            setup: item.type,
            symbol: item.symbol,
            side: item.side === IBFTATrend.Up ? "Long" : "Short"
        };
    }

    private _getComments(item: SonarFeedItem): SonarFeedCommentVM[] {
        const comments: SonarFeedComment[] = [];
        if (item.comments) {
            comments.push(...item.comments);
        }
        if (item.lastComment) {
            const existing = comments.find(_ => _.id === item.lastComment.id);
            if (!existing) {
                comments.push(item.lastComment);
            }
        }
        return comments.map(_ => this._convertCommentToVM(_, true));
    }

    private _convertCommentToVM(comment: SonarFeedComment, isRoot: boolean = false): SonarFeedCommentVM {
        return {
            id: comment.id,
            dislikesCount: comment.dislikesCount,
            likesCount: comment.likesCount,
            hasUserDislike: comment.hasUserDislike,
            hasUserLike: comment.hasUserLike,
            isOwnComment: comment.isOwnComment,
            text: comment.text,
            time: comment.time,
            userAvatarId: comment.user.avatarId,
            userLevel: comment.user.level,
            levelName: comment.user.levelName,
            userName: comment.user.name,
            comments: comment.comments ? comment.comments.map(_ => this._convertCommentToVM(_)) : [],
            isRootComment: isRoot
        };
    }

    private _getTitle(granularity: number, symbol: string, setup: string, side: string) {
        let timeFrame = this._getTimeFrame(granularity);
        return `${timeFrame} ${symbol} ${setup} ${side}`;
    }

    private _getTimeFrame(granularity: number): string {
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

        return timeFrame;
    }

    // #region Realtime updates

    private _commentRemoved(reaction: SocialFeedCommentRemovedNotification) {
        const card = this._findCard(reaction.postId);

        if (!card) {
            return;
        }

        this._deleteCommentFromCommentsList(card.comments, reaction.id);

        this._refreshNeeded = true;
    }

    private _commentEdited(reaction: SocialFeedCommentEditedNotification) {
        const card = this._findCard(reaction.postId);

        if (!card) {
            return;
        }

        const comment = this._findRecursiveComments(reaction.id, card.comments);

        if (!comment) {
            return;
        }

        comment.text = reaction.text;
        this._refreshNeeded = true;
    }

    private _commentReaction(reaction: SocialFeedCommentReactionNotification) {
        const card = this._findCard(reaction.postId);

        if (!card) {
            return;
        }

        const comment = this._findRecursiveComments(reaction.id, card.comments);

        if (!comment) {
            return;
        }

        comment.dislikesCount = reaction.dislikesCount;
        comment.likesCount = reaction.likesCount;
        this._refreshNeeded = true;
    }

    private _postReaction(reaction: SocialFeedPostReactionNotification) {
        const card = this._findCard(reaction.id);

        if (!card) {
            return;
        }

        card.likeCount = reaction.likesCount;
        card.dislikeCount = reaction.dislikesCount;
        this._refreshNeeded = true;
    }

    private _updatePostLikes(response: SonarFeedItemLikeResponse) {
        const card = this._findCard(response.postId);

        if (!card) {
            return;
        }

        card.likeCount = response.likesCount;
        card.dislikeCount = response.dislikesCount;
        card.hasMyLike = response.hasUserLike;
        card.hasMyDislike = response.hasUserDislike;
        this._refreshNeeded = true;
    }

    private _updateCommentLikes(response: SonarFeedItemCommentLikeResponse, cardId: any) {
        const card = this._findCard(cardId);
        if (!card) {
            return;
        }

        const comment = this._findRecursiveComments(response.commentId, card.comments);
        if (!comment) {
            return;
        }

        comment.likesCount = response.likesCount;
        comment.dislikesCount = response.dislikesCount;
        comment.hasUserLike = response.hasUserLike;
        comment.hasUserDislike = response.hasUserDislike;
        this._refreshNeeded = true;
    }

    private _commentAdded(reaction: SocialFeedCommentAddedNotification) {
        const comment = SocialFeedModelConverter.ConvertNotificationToSonarFeedComment(reaction, this._identity.id);
        const card = this._findCard(reaction.postId);
        if (!card) {
            return;
        }

        if (reaction.parentCommentId) {
            const commentVW = this._convertCommentToVM(comment);
            this._addCommentToComment(card, reaction.parentCommentId, commentVW);
        } else {
            const commentVW = this._convertCommentToVM(comment, true);
            this._addCommentToPost(card, commentVW);
        }

        this._refreshNeeded = true;
    }

    private _addCommentToPost(post: SonarFeedCardVM, comment: SonarFeedCommentVM) {
        const existingComments = this._findRecursiveComments(comment.id, post.comments);
        if (existingComments) {
            return;
        }

        if (post.comments) {
            post.comments.push(comment);
        }

        post.commentsTotal++;
    }

    private _addCommentToComment(post: SonarFeedCardVM, parentCommentId: any, comment: SonarFeedCommentVM) {
        if (!parentCommentId) {
            return;
        }

        const existingComments = this._findRecursiveComments(comment.id, post.comments);
        if (existingComments) {
            return;
        }

        const parentComment = this._findRecursiveComments(parentCommentId, post.comments);
        if (!parentComment.comments) {
            parentComment.comments = [];
        }

        parentComment.comments.push(comment);
        post.commentsTotal++;
    }

    private _addComment(comment: SonarFeedComment, postId: any) {
        if (!comment) {
            return;
        }

        const card = this._findCard(postId);
        if (!card) {
            return;
        }

        if (comment.parentComment) {
            const commentVW = this._convertCommentToVM(comment);
            this._addCommentToComment(card, comment.parentComment.id, commentVW);
        } else {
            const commentVW = this._convertCommentToVM(comment, true);
            this._addCommentToPost(card, commentVW);
        }

        this._refreshNeeded = true;
    }

    private _findCard(id: any): SonarFeedCardVM {
        for (const card of this.cards) {
            if (card.id === id) {
                return card;
            }
        }
    }

    private _findRecursiveComments(commentId: any, comments: SonarFeedCommentVM[]): SonarFeedCommentVM {
        for (const c of comments) {
            if (c.id === commentId) {
                return c;
            }

            if (c.comments && c.comments.length) {
                const commentInside = this._findRecursiveComments(commentId, c.comments);
                if (commentInside) {
                    return commentInside;
                }
            }
        }
    }

    private _deleteCommentFromCommentsList(comments: SonarFeedCommentVM[], commentId: any) {
        if (!comments) {
            return;
        }

        for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === commentId) {
                comments.splice(i, 1);
                i--;
            }

            if (comments[i] && comments[i].comments) {
                this._deleteCommentFromCommentsList(comments[i].comments, commentId);
            }
        }
    }

    //#endregion

    // #region Filters

    private _isFitCardCurrentFilters(item: SonarFeedItem): boolean {
        if (!this._filteringParameters) {
            return true;
        }

        if (this._filteringParameters.granularity && this._filteringParameters.granularity.length) {
            const isGranularityAllowed = this._filteringParameters.granularity.indexOf(item.granularity) !== -1;
            if (!isGranularityAllowed) {
                return false;
            }
        }

        if (this._filteringParameters.setup && this._filteringParameters.setup.length) {
            const isSetupAllowed = this._filteringParameters.setup.indexOf(this._mapSetupType(item.type)) !== -1;
            if (!isSetupAllowed) {
                return false;
            }
        }

        if (this._filteringParameters.type && this._filteringParameters.type.length) {
            const marketType = this._mapMarketType(item.symbol, item.exchange);
            if (marketType) {
                const isTypeAllowed = this._filteringParameters.type.indexOf(marketType) !== -1;
                if (!isTypeAllowed) {
                    return false;
                }
            }
        }
        return true;
    }

    private _mapSetupType(type: string): ESonarFeedSetupTypes {
        if (type.toLowerCase() === "ext") {
            return ESonarFeedSetupTypes.EXT;
        }
        if (type.toLowerCase() === "brc") {
            return ESonarFeedSetupTypes.BRC;
        }
        if (type.toLowerCase() === "swingn" || type.toLowerCase() === "swingext") {
            return ESonarFeedSetupTypes.Swing;
        }
    }

    private _mapMarketType(symbol: string, exchange: string): ESonarFeedMarketTypes {
        if (exchange && exchange.toLowerCase() === "binance") {
            return ESonarFeedMarketTypes.Crypto;
        }

        const internalMarketType = ForexTypeHelper.GetTypeSpecific(symbol);
        switch (internalMarketType) {
            case EMarketSpecific.Bonds: return ESonarFeedMarketTypes.Bonds;
            case EMarketSpecific.Commodities: return ESonarFeedMarketTypes.Commodities;
            case EMarketSpecific.Crypto: return ESonarFeedMarketTypes.Crypto;
            case EMarketSpecific.ForexExotic: return ESonarFeedMarketTypes.ForexExotic;
            case EMarketSpecific.ForexMajor: return ESonarFeedMarketTypes.MajorForex;
            case EMarketSpecific.ForexMinor: return ESonarFeedMarketTypes.ForexMinors;
            case EMarketSpecific.Indices: return ESonarFeedMarketTypes.Indices;
            case EMarketSpecific.Metals: return ESonarFeedMarketTypes.Metals;
            case EMarketSpecific.Stocks: return ESonarFeedMarketTypes.Equities;
        }
    }

    private _mapToTilters(): ISonarSetupFilters {
        const res: ISonarSetupFilters = {};

        if (this.selectedTimeFrames) {
            if (this.selectedTimeFrames.length !== this.allowedTimeFrames.length) {
                res.granularity = [];
                for (const tf of this.selectedTimeFrames) {
                    res.granularity.push(this._timeframeToGranularity(tf));
                }
            }
        }

        if (this.selectedTradeTypes) {
            if (this.allowedTradeTypes.length !== this.selectedTradeTypes.length) {
                res.setup = [];
                for (const type of this.selectedTradeTypes) {
                    res.setup.push(this._mapTradeTypesToFilter(type));
                }
            }
        }

        if (this.selectedMarketTypes) {
            if (this.allowedMarketTypes.length !== this.selectedMarketTypes.length) {
                res.type = [];
                for (const type of this.selectedMarketTypes) {
                    res.type.push(this._mapSetupTypesToFilter(type));
                }
            }
        }

        return res;
    }

    private _mapToSettings(filteringParameters: ISonarSetupFilters) {
        if (!filteringParameters) {
            return;
        }

        if (filteringParameters.granularity && filteringParameters.granularity.length) {
            this.selectedTimeFrames = [];
            for (const g of filteringParameters.granularity) {
                const i = this._granularityToTimeframe(g);
                if (this.allowedTimeFrames.indexOf(i) !== -1) {
                    this.selectedTimeFrames.push(i);
                }
            }

            if (!this.selectedTimeFrames.length) {
                this.selectedTimeFrames = this.allowedTimeFrames;
            }

            this.prevSelectedTimeFrames = this.selectedTimeFrames;
        }

        if (filteringParameters.setup && filteringParameters.setup.length) {
            this.selectedTradeTypes = [];
            for (const s of filteringParameters.setup) {
                const i = this._mapTradeTypesToSetting(s);
                if (this.allowedTradeTypes.indexOf(i) !== -1) {
                    this.selectedTradeTypes.push(i);
                }
            }

            if (!this.selectedTradeTypes.length) {
                this.selectedTradeTypes = this.allowedTradeTypes;
            }

            this.prevSelectedTradeTypes = this.selectedTradeTypes;
        }

        if (filteringParameters.type && filteringParameters.type.length) {
            this.selectedMarketTypes = [];
            for (const t of filteringParameters.type) {
                const i = this._mapSetupTypesToSetting(t);
                if (this.allowedMarketTypes.indexOf(i) !== -1) {
                    this.selectedMarketTypes.push(i);
                }
            }

            if (!this.selectedMarketTypes.length) {
                this.selectedMarketTypes = this.allowedMarketTypes;
            }

            this.prevSelectedMarketTypes = this.selectedMarketTypes;
        }
    }

    private _timeframeToGranularity(tf: TimeFrames): number {
        switch (tf) {
            case TimeFrames.Min15: return 60 * 15;
            case TimeFrames.Hour1: return 60 * 60;
            case TimeFrames.Hour4: return 60 * 60 * 4;
            case TimeFrames.Day: return 60 * 60 * 24;
        }
    }

    private _granularityToTimeframe(granularity: number): TimeFrames {
        switch (granularity) {
            case 60 * 15: return TimeFrames.Min15;
            case 60 * 60: return TimeFrames.Hour1;
            case 60 * 60 * 4: return TimeFrames.Hour4;
            case 60 * 60 * 24: return TimeFrames.Day;
        }
    }

    private _mapTradeTypesToFilter(type: TradeTypes): ESonarFeedSetupTypes {
        switch (type) {
            case TradeTypes.BRC: return ESonarFeedSetupTypes.BRC;
            case TradeTypes.Ext: return ESonarFeedSetupTypes.EXT;
            case TradeTypes.Swing: return ESonarFeedSetupTypes.Swing;
        }
    }

    private _mapTradeTypesToSetting(type: ESonarFeedSetupTypes): TradeTypes {
        switch (type) {
            case ESonarFeedSetupTypes.BRC: return TradeTypes.BRC;
            case ESonarFeedSetupTypes.EXT: return TradeTypes.Ext;
            case ESonarFeedSetupTypes.Swing: return TradeTypes.Swing;
        }
    }

    private _mapSetupTypesToFilter(type: SonarFeedMarketTypes): ESonarFeedMarketTypes {
        switch (type) {
            case SonarFeedMarketTypes.Bonds: return ESonarFeedMarketTypes.Bonds;
            case SonarFeedMarketTypes.Commodities: return ESonarFeedMarketTypes.Commodities;
            case SonarFeedMarketTypes.Crypto: return ESonarFeedMarketTypes.Crypto;
            case SonarFeedMarketTypes.Equities: return ESonarFeedMarketTypes.Equities;
            case SonarFeedMarketTypes.ForexExotic: return ESonarFeedMarketTypes.ForexExotic;
            case SonarFeedMarketTypes.ForexMinors: return ESonarFeedMarketTypes.ForexMinors;
            case SonarFeedMarketTypes.Indices: return ESonarFeedMarketTypes.Indices;
            case SonarFeedMarketTypes.MajorForex: return ESonarFeedMarketTypes.MajorForex;
            case SonarFeedMarketTypes.Metals: return ESonarFeedMarketTypes.Metals;
        }
    }

    private _mapSetupTypesToSetting(type: ESonarFeedMarketTypes): SonarFeedMarketTypes {
        switch (type) {
            case ESonarFeedMarketTypes.Bonds: return SonarFeedMarketTypes.Bonds;
            case ESonarFeedMarketTypes.Commodities: return SonarFeedMarketTypes.Commodities;
            case ESonarFeedMarketTypes.Crypto: return SonarFeedMarketTypes.Crypto;
            case ESonarFeedMarketTypes.Equities: return SonarFeedMarketTypes.Equities;
            case ESonarFeedMarketTypes.ForexExotic: return SonarFeedMarketTypes.ForexExotic;
            case ESonarFeedMarketTypes.ForexMinors: return SonarFeedMarketTypes.ForexMinors;
            case ESonarFeedMarketTypes.Indices: return SonarFeedMarketTypes.Indices;
            case ESonarFeedMarketTypes.MajorForex: return SonarFeedMarketTypes.MajorForex;
            case ESonarFeedMarketTypes.Metals: return SonarFeedMarketTypes.Metals;
        }
    }

    private _isFiltersSame(f1: ISonarSetupFilters, f2: ISonarSetupFilters): boolean {
        const f1String = JSON.stringify(f1);
        const f2String = JSON.stringify(f2);
        return f1String === f2String;
    }

    //#endregion

    //#region Access restrictions

    private _isCardAllowed(granularity: number) {
        if (granularity <= 60 * 15) {
            if (!this._identityService.is15MinAllowed()) {
                return false;
            }
            if (!this._identityService.is15MinAllowedByLevel(this._tradingProfileService.level)) {
                return false;
            }
        } else if (granularity <= 60 * 60 * 4) {
            if (!this._identityService.isHourAllowed()) {
                return false;
            }

            if (granularity <= 60 * 60) {
                if (!this._identityService.isHourAllowedByLevel(this._tradingProfileService.level)) {
                    return false;
                }
            }
        }

        return true;
    }

    private _filterVisibleItems(data: SonarFeedItem[]) {
        const res: SonarFeedItem[] = [];

        for (const item of data) {
            if (this._isCardAllowed(item.granularity)) {
                res.push(item);
            }
        }

        return res;
    }
    //#endregion

}