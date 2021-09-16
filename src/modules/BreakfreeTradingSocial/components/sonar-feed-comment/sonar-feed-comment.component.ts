import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SocialFeedModelConverter } from "modules/BreakfreeTradingSocial/services/models.convertter";
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

        return SocialFeedModelConverter.ConvertTimeDiffToString(time);
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