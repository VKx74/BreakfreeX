import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { IInstrument } from "@app/models/common/instrument";
import { IBFTATrend } from "@app/services/algo.service";
import { IdentityService } from "@app/services/auth/identity.service";
import { TradingHelper } from "@app/services/mt/mt.helper";
import { SonarChartIndicatorDataProviderService } from "@chart/services/indicator-data-provider.service";
import { TradingProfileService } from "modules/BreakfreeTrading/services/tradingProfile.service";
import { SocialFeedModelConverter } from "modules/BreakfreeTradingSocial/services/models.convertter";
import { ESonarFeedMarketTypes } from "modules/BreakfreeTradingSocial/services/sonar.feed.service";
import { SonarFeedCardTrendVM, SonarFeedCommentVM } from "../sonar-feed-wall/sonar-feed-wall.component";
declare var ResizeObserver;

export interface IReplayData {
    commentId: any;
    text: string;
}

@Component({
    selector: 'sonar-feed-card',
    templateUrl: './sonar-feed-card.component.html',
    styleUrls: ['./sonar-feed-card.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedCardComponent implements OnInit {
    private _instrument: IInstrument;
    private _granularity: number;
    private _time: number;
    private _title: string;
    private _timeFrame: string;
    private _symbol: string;
    private _setup: string;
    private _side: string;
    private _isVisible: boolean;
    private _sizeChangeObserver: any;
    private _hasMyLike: boolean;
    private _hasMyDislike: boolean;
    private _likeCount: number = 0;
    private _dislikeCount: number = 0;
    private _comment: string;
    private _comments: SonarFeedCommentVM[] = [];
    private _commentsTotal: number = 0;
    private _isFavorite: boolean;
    private _showLastComment: boolean = true;
    private _scrollDownNeed: boolean = false;
    private _showAllCommentsOnExpand: boolean = false;
    private _selected: boolean = false;
    private _replayCommentId: any;
    private _editComment: boolean;
    private _expandedComments: any[] = [];
    private _trend: SonarFeedCardTrendVM;
    private _marketType: ESonarFeedMarketTypes;

    IBFTATrend = IBFTATrend;

    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    @ViewChild('cardContainer', { static: true }) cardContainer: ElementRef;
    @ViewChild('scroll', { static: true }) scroll: ElementRef;
    @ViewChild('textarea', { static: true }) textarea: ElementRef;

    @Output() onOpenChart = new EventEmitter<void>();
    @Output() onLike = new EventEmitter<void>();
    @Output() onDislike = new EventEmitter<void>();
    @Output() onCommentLike = new EventEmitter<any>();
    @Output() onCommentLikeDelete = new EventEmitter<any>();
    @Output() onCommentDislike = new EventEmitter<any>();
    @Output() onBanUser = new EventEmitter<any>();
    @Output() onShare = new EventEmitter<void>();
    @Output() onAddComment = new EventEmitter<string>();
    @Output() onEditComment = new EventEmitter<IReplayData>();
    @Output() onAddReplay = new EventEmitter<IReplayData>();
    @Output() onRemoveComment = new EventEmitter<any>();
    @Output() onShowAllComments = new EventEmitter<void>();
    @Output() onFavorite = new EventEmitter<void>();
    @Output() chartClick = new EventEmitter<void>();

    @Input() public set isVisible(value: boolean) {
        this._isVisible = value;
    }

    @Input() public set hasMyLike(value: boolean) {
        this._hasMyLike = value;
    }

    @Input() public set hasMyDislike(value: boolean) {
        this._hasMyDislike = value;
    }

    @Input() public set likeCount(value: number) {
        this._likeCount = value;
    }

    @Input() public set dislikeCount(value: number) {
        this._dislikeCount = value;
    }

    @Input() public set granularity(value: number) {
        this._granularity = value;
    }

    @Input() public set time(value: number) {
        this._time = value;
    }

    @Input() public set title(value: string) {
        this._title = value;
    }

    @Input() public set timeFrame(value: string) {
        this._timeFrame = value;
    }

    @Input() public set symbol(value: string) {
        this._symbol = value;
    }

    @Input() public set setup(value: string) {
        this._setup = value;
    }

    @Input() public set side(value: string) {
        this._side = value;
    }

    @Input() public set instrument(value: IInstrument) {
        this._instrument = value;
    }

    @Input() public set comments(value: SonarFeedCommentVM[]) {
        this._comments = value;
        this._scrollToBottom();
    }

    @Input() public set commentsTotal(value: number) {
        this._commentsTotal = value;
    }

    @Input() public set isFavorite(value: boolean) {
        this._isFavorite = value;
    }

    @Input() public set showAllCommentsOnExpand(value: boolean) {
        this._showAllCommentsOnExpand = value;
    }

    @Input() public set selected(value: boolean) {
        this._selected = value;
    }

    @Input() public set trend(value: SonarFeedCardTrendVM) {
        this._trend = value;
    }

    @Input() public set marketType(value: ESonarFeedMarketTypes) {
        this._marketType = value;
    }

    public set comment(value: string) {
        this._comment = value;
        this._setTextAreaHeight();
    }

    public get instrument(): IInstrument {
        return this._instrument;
    }

    public get granularity(): number {
        return this._granularity;
    }

    public get time(): number {
        return this._time;
    }

    public get title(): string {
        return this._title;
    }

    public get timeFrame(): string {
        return this._timeFrame;
    }

    public get symbol(): string {
        return this._symbol;
    }

    public get setup(): string {
        return this._setup;
    }

    public get side(): string {
        return this._side;
    }

    public get isVisible(): boolean {
        return this._isVisible;
    }

    public get hasMyLike(): boolean {
        return this._hasMyLike;
    }

    public get hasMyDislike(): boolean {
        return this._hasMyDislike;
    }

    public get likeCount(): number {
        return this._likeCount;
    }

    public get dislikeCount(): number {
        return this._dislikeCount;
    }

    public get comment(): string {
        return this._comment;
    }

    public get showAllCommentsOnExpand(): boolean {
        return this._showAllCommentsOnExpand;
    }

    public get expandedComments(): any[] {
        return this._expandedComments;
    }

    public get trend(): SonarFeedCardTrendVM {
        return this._trend;
    }

    public get marketType(): ESonarFeedMarketTypes {
        return this._marketType;
    }

    public get comments(): SonarFeedCommentVM[] {
        if (this._showLastComment && this._comments) {
            const length = this._comments.length;
            if (length > 1) {
                return this._comments.slice(length - 1);
            }
        }
        return this._comments;
    }

    public get commentsTotal(): number {
        return this._commentsTotal;
    }

    public get isFavorite(): boolean {
        return this._isFavorite;
    }

    public get showLastComment(): boolean {
        return this._showLastComment;
    }

    public get selected(): boolean {
        return this._selected;
    }

    public get replayComment(): SonarFeedCommentVM {
        if (!this._replayCommentId) {
            return null;
        }

        const comment = this._findRecursiveComments(this._replayCommentId, this._comments);
        return comment;
    }

    constructor(protected _identityService: IdentityService,
        protected host: ElementRef,
        protected _cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this._sizeChangeObserver = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            this._adjustChartHeight(width);
        });

        this._sizeChangeObserver.observe(this.host.nativeElement);
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        try {
            if (this._sizeChangeObserver) {
                this._sizeChangeObserver.unobserve(this.host.nativeElement);
            }
        } catch (e) {
            console.log(e);
        }
    }

    createTimeString(time: number): string {
        if (!time) {
            return "";
        }

        return SocialFeedModelConverter.ConvertTimeDiffToSonarTimeString(time);
    }

    viewOnChart() {
        this.onOpenChart.next();
    }

    like() {
        this.onLike.next();
    }

    dislike() {
        this.onDislike.next();
    }

    favorite() {
        this.onFavorite.next();
    }

    share() {
        this.onShare.next();
    }

    likeComment(comment: SonarFeedCommentVM) {
        this.onCommentLike.next(comment.id);
    }

    deleteCommentLike(comment: SonarFeedCommentVM) {
        this.onCommentLikeDelete.next(comment.id);
    }

    dislikeComment(comment: SonarFeedCommentVM) {
        this.onCommentDislike.next(comment.id);
    }

    banUser(comment: SonarFeedCommentVM) {
        this.onBanUser.next(comment.userId);
    }

    expandComment(commentId: any) {
        this._expandedComments.push(commentId);
        this._expandedComments = this._expandedComments.slice();
    }

    sendComment() {
        if (!this.comment || !this.comment.length) {
            return;
        }

        if (this._replayCommentId) {
            if (this._editComment) {
                this._editComment = false;
                this.onEditComment.next({
                    commentId: this._replayCommentId,
                    text: this.comment
                });
            } else {
                this.onAddReplay.next({
                    commentId: this._replayCommentId,
                    text: this.comment
                });
            }
            this._replayCommentId = null;
        } else {
            this.onAddComment.next(this.comment);
        }
        this.comment = "";
        this._cdr.detectChanges();
    }

    textChanged() {
        this._setTextAreaHeight();
    }

    showAllComment() {
        this._showLastComment = false;
        this._scrollDownNeed = true;
        this.onShowAllComments.next();
    }

    removeComment(commentId: any) {
        this.onRemoveComment.next(commentId);
    }

    hideAllComment() {
        this._showLastComment = true;
        this._cdr.detectChanges();
    }

    replay(commentId: any) {
        this._replayCommentId = commentId;
        this._cdr.detectChanges();
        this.textarea.nativeElement.focus();
    }

    editComment(commentId: any) {
        this._replayCommentId = commentId;
        this._editComment = true;
        this._cdr.detectChanges();
        this.textarea.nativeElement.focus();
    }

    stopReplay() {
        this._replayCommentId = null;
        this._editComment = false;
        this.comment = "";
        this.textarea.nativeElement.blur();
        this._cdr.detectChanges();
    }

    clickOnChart() {
        this.chartClick.next();
    }

    keyUpOnTextArea(data: KeyboardEvent) {
        if (data.code === "Enter" && !data.shiftKey) {
            this.sendComment();
            data.preventDefault();
            data.stopPropagation();
            return;
        }
    }

    hasMoreComments() {
        if (this.comments.length > 1) {
            return false;
        }

        const commentsCount = this._countCommentsRecursive(this.comments);
        return commentsCount !== this.commentsTotal;
    }

    getTrendDescription() {
        if (!this.trend) {
            return "";
        }

        const strength = TradingHelper.convertTrendSpread((this.trend.globalTrendSpread + this.trend.localTrendSpread) / 2);
        return `${strength}`;
        // return `${strength} (${localValue}/${globalValue})`;
    }  
    
    getTrendDescriptionTooltip() {
        if (!this.trend) {
            return "";
        }

        const localStrength = TradingHelper.convertTrendSpread(this.trend.localTrendSpread);
        const globalStrength = TradingHelper.convertTrendSpread(this.trend.globalTrendSpread);
        const localValue = Math.trunc(this.trend.localTrendSpread * 100);
        const globalValue = Math.trunc(this.trend.globalTrendSpread * 100);
        const localTrendString = `Local - ${this.trend.localTrend} Trend ${localStrength}(${localValue}%)`;
        const globalTrendString = `Global - ${this.trend.globalTrend} Trend ${globalStrength}(${globalValue}%)`;
        return `${localTrendString}\n\n${globalTrendString}`;
    }

    getMarketType() {
        switch (this.marketType) {
            case ESonarFeedMarketTypes.MajorForex: return "Forex Major";
            case ESonarFeedMarketTypes.ForexMinors: return "Forex Minor";
            case ESonarFeedMarketTypes.ForexExotic: return "Forex Exotic";
            case ESonarFeedMarketTypes.Bonds: return "Bonds";
            case ESonarFeedMarketTypes.Commodities: return "Commodities";
            case ESonarFeedMarketTypes.Crypto: return "Crypto";
            case ESonarFeedMarketTypes.Equities: return "Equities";
            case ESonarFeedMarketTypes.Indices: return "Indices";
            case ESonarFeedMarketTypes.Metals: return "Metals";
        }

        return "Other";
    }

    // is15Min() {
    //     return this.granularity <= 60 * 15;
    // } 

    // isHourly() {
    //     return this.granularity <= 60 * 60 * 4 && !this.is15Min();
    // }

    // isAccessRestriction() {
    //    return !this._isCardVisible;
    // } 

    // isLevelRestriction() {
    //    return !this._isCardVisibleByLevel && this._isCardVisible;
    // }

    private _setTextAreaHeight() {
        if (!this.textarea || !this.textarea.nativeElement) {
            return;
        }
        this.textarea.nativeElement.style.height = `0px`;

        if (this.comment) {
            const scroll = this.textarea.nativeElement.scrollHeight + 2;
            this.textarea.nativeElement.style.height = `${scroll}px`;
        }
    }

    private _countCommentsRecursive(comments: SonarFeedCommentVM[]): number {
        let count = 0;

        for (const c of comments) {
            count++;
            if (c.comments || c.comments.length) {
                let subCommentCount = this._countCommentsRecursive(c.comments);
                count += subCommentCount;
            }
        }

        return count;
    }

    private _scrollToBottom(): void {
        if (!this._scrollDownNeed) {
            return;
        }

        this._scrollDownNeed = false;
        try {
            if (this.scroll) {
                this._cdr.detectChanges();
                setTimeout(() => {
                    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
                    this._cdr.detectChanges();
                }, 1);
            }
        } catch (err) { }
    }

    private _adjustChartHeight(containerWidth: number) {
        if (!this.chartContainer) {
            return;
        }

        let requiredHeigh = Math.trunc(containerWidth / 4 * 2);
        if (requiredHeigh < 200) {
            requiredHeigh = 200;
        }

        this.chartContainer.nativeElement.style["min-height"] = `${requiredHeigh}px`;
        this.chartContainer.nativeElement.style["height"] = `${requiredHeigh}px`;
        this._cdr.detectChanges();
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
}