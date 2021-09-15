import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SonarFeedCommentVM } from "../sonar-feed-wall/sonar-feed-wall.component";
export interface IReplayData {
    commentId: any;
    text: string;
}

@Component({
    selector: 'sonar-feed-comment',
    templateUrl: './sonar-feed-comment.component.html',
    styleUrls: ['./sonar-feed-comment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SonarFeedCommentComponent implements OnInit {
    private _comment: SonarFeedCommentVM;

    @Output() onCommentLike = new EventEmitter<any>();
    @Output() onCommentDislike = new EventEmitter<any>();
    @Output() onAddReplay = new EventEmitter<any>();
    @Output() onRemoveComment = new EventEmitter<any>();

    @Input() public set comment(value: SonarFeedCommentVM) {
        this._comment = value;
    }

    public get comment(): SonarFeedCommentVM {
        return this._comment;
    }

    constructor(protected _cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    createTimeString(time: number): string {
        if (!time) {
            return "";
        }

        const timeNow = Math.trunc(new Date().getTime() / 1000);
        const dateOfCreation = new Date(time * 1000);
        const timeDiff = Math.trunc(timeNow - time);

        if (timeDiff < 60) {
            return `${timeDiff} s ago `;
        } else if (timeDiff < 60 * 60) {
            const mins = Math.trunc(timeDiff / 60);
            return mins > 1 ? `${mins} m` : "M";
        } else if (timeDiff < 60 * 60 * 24) {
            const hours = Math.trunc(timeDiff / 60 / 60);
            return hours > 1 ? `${hours} h` : `H`;
        } else {
            const secondsInDay = 60 * 60 * 24;
            const days1 = Math.trunc(timeNow / secondsInDay);
            const days2 = Math.trunc(time / secondsInDay);
            const timeStringSplitted = dateOfCreation.toLocaleTimeString().split(":");
            const timeString = `${timeStringSplitted[0]}:${timeStringSplitted[1]}`;
            const dateString = dateOfCreation.toLocaleDateString();

            if (days1 - days2 === 1) {
                return `Yesterday at ${timeString}`;
            }

            if (timeDiff < secondsInDay * 7) {
                const days = Math.trunc(timeDiff / secondsInDay);
                return days > 1 ? `${days} d` : `D`;
            }

            return `${dateString} ${timeString}`;
        }
    }

    likeComment(commentId: any) {
        this.onCommentLike.next(commentId);
    }

    dislikeComment(commentId: any) {
        this.onCommentDislike.next(commentId);
    }

    removeComment(commentId: any) {
        this.onRemoveComment.next(commentId);
    }

    replay(commentId: any) {
        this.onAddReplay.next(commentId);
    }
}