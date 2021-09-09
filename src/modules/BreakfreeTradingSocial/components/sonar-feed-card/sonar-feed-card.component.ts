import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { IdentityService } from "@app/services/auth/identity.service";
import { SonarFeedCommentVM } from "../sonar-feed-wall/sonar-feed-wall.component";
declare var ResizeObserver;

@Component({
    selector: 'sonar-feed-card',
    templateUrl: './sonar-feed-card.component.html',
    styleUrls: ['./sonar-feed-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedCardComponent implements OnInit {
    private _instrument: IInstrument;
    private _granularity: number;
    private _time: number;
    private _title: string;
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

    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    @ViewChild('cardContainer', { static: true }) cardContainer: ElementRef;

    @Output() onOpenChart = new EventEmitter<void>();
    @Output() onLike = new EventEmitter<void>();
    @Output() onDislike = new EventEmitter<void>();
    @Output() onCommentLike = new EventEmitter<any>();
    @Output() onCommentDislike = new EventEmitter<any>();
    @Output() onShare = new EventEmitter<void>();
    @Output() onAddComment = new EventEmitter<string>();
    @Output() onRemoveComment = new EventEmitter<any>();
    @Output() onShowAllComments = new EventEmitter<void>();
    @Output() onFavorite = new EventEmitter<void>();

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

    @Input() public set instrument(value: IInstrument) {
        this._instrument = value;
    }

    @Input() public set comments(value: SonarFeedCommentVM[]) {
        this._comments = value;
    }

    @Input() public set commentsTotal(value: number) {
        this._commentsTotal = value;
    }

    @Input() public set isFavorite(value: boolean) {
        this._isFavorite = value;
    }

    public set comment(value: string) {
        this._comment = value;
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

    constructor(protected _identityService: IdentityService,
        private host: ElementRef,
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

        const timeNow = Math.trunc(new Date().getTime() / 1000);
        const dateOfCreation = new Date(time * 1000);
        const timeDiff = Math.trunc(timeNow - time);

        if (timeDiff < 60) {
            return `${timeDiff} seconds ago`;
        } else if (timeDiff < 60 * 60) {
            const mins = Math.trunc(timeDiff / 60);
            return mins > 1 ? `${mins} minutes ago` : "Minute ago";
        } else if (timeDiff < 60 * 60 * 24) {
            const hours = Math.trunc(timeDiff / 60 / 60);
            return hours > 1 ? `${hours} hours ago` : `Hour ago`;
        } else {
            const secondsInDay = 60 * 60 * 24;
            const days1 = Math.trunc(timeNow / secondsInDay);
            const days2 = Math.trunc(time / secondsInDay);
            const timeStringSplitted = dateOfCreation.toLocaleTimeString().split(":");
            const timeString = `${timeStringSplitted[0]}:${timeStringSplitted[1]}`;
            const dateString = dateOfCreation.toLocaleDateString();

            if (days1 - days2 === 1) {
                return `Yesterday at ${timeString[0]}:${timeString[1]}`;
            }

            if (timeDiff < secondsInDay * 7) {
                const days = Math.trunc(timeDiff / secondsInDay);
                return days > 1 ? `${days} hours ago` : `Day ago`;
            }

            return `${dateString} ${timeString}`;
        }
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

    likeComment(comment: SonarFeedCommentVM) {
        this.onCommentLike.next(comment.id);
    }

    dislikeComment(comment: SonarFeedCommentVM) {
        this.onCommentDislike.next(comment.id);
    }

    sendComment() {
        if (!this.comment || !this.comment.length) {
            return;
        }

        this.onAddComment.next(this.comment);
        this.comment = null;
    }

    showAllComment() {
        this._showLastComment = false;
        this.onShowAllComments.next();
    }

    removeComment(comment: SonarFeedCommentVM) {
        this.onRemoveComment.next(comment.id);
    }

    hideAllComment() {
        this._showLastComment = true;
        this._cdr.detectChanges();
    }

    private _adjustChartHeight(containerWidth: number) {
        if (!this.chartContainer) {
            return;
        }

        let requiredHeigh = Math.trunc(containerWidth / 4 * 2);
        if (requiredHeigh < 160) {
            requiredHeigh = 160;
        }

        this.chartContainer.nativeElement.style.height = `${requiredHeigh}px`;
        this._cdr.detectChanges();
    }
}