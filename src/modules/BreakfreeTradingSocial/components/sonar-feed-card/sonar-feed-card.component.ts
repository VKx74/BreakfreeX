import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { IdentityService } from "@app/services/auth/identity.service";
declare var ResizeObserver;

export interface SonarFeedCardVM {
   id: any;
   instrument: IInstrument;
   granularity: number;
   time: number;
   title: string;
   hasMyLike: boolean;
   hasMyDislike: boolean;
   likeCount: number;
   dislikeCount: number;
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
    private _isVisible: boolean;
    private _sizeChangeObserver: any;
    private _hasMyLike: boolean;
    private _hasMyDislike: boolean;
    private _likeCount: number = 0;
    private _dislikeCount: number = 0;

    @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
    @ViewChild('cardContainer', { static: true }) cardContainer: ElementRef;

    @Output() onOpenChart = new EventEmitter<void>();
    @Output() onLike = new EventEmitter<void>();
    @Output() onDislike = new EventEmitter<void>();
    @Output() onShare = new EventEmitter<void>();
    @Output() onAddComment = new EventEmitter<string>();
    @Output() onRemoveComment = new EventEmitter<any>();

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

    createTimeString(): string {
        if (!this._time) {
            return "";
        }

        const timeNow = Math.trunc(new Date().getTime() / 1000);
        const dateOfCreation = new Date(this._time * 1000);
        const timeDiff = Math.trunc(timeNow - this._time);

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
            const days2 = Math.trunc(this._time / secondsInDay);
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