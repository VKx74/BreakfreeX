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
    private _expandedComments: any[];
    private _isExpanded: boolean;

    @Output() onCommentLike = new EventEmitter<any>();
    @Output() onCommentDislike = new EventEmitter<any>();
    @Output() onAddReplay = new EventEmitter<any>();
    @Output() onRemoveComment = new EventEmitter<any>();
    @Output() onEditComment = new EventEmitter<any>();
    @Output() onExpandComment = new EventEmitter<any>();

    @Input() public set comment(value: SonarFeedCommentVM) {
        this._comment = value;
    } 
    
    @Input() public set expandedComments(value: any[]) {
        this._expandedComments = value;
    }
    
    @Input() public set isExpanded(value: boolean) {
        this._isExpanded = value;
    }

    public get comment(): SonarFeedCommentVM {
        return this._comment;
    }

    public get expandedComments(): any[] {
        return this._expandedComments;
    }


    public get isExpanded(): boolean {
        return this._isExpanded;
    }

    public get hasSubCommentsThread(): boolean {
        if (!this.comment.comments || this.comment.comments.length === 0) {
            return false;
        }

        if (this.comment.comments.length > 1) {
            return true;
        }

        for (const subComment of this.comment.comments) {
            if (subComment.comments && subComment.comments.length) {
                return true;
            }
        }
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

    editComment(commentId: any) {
        this.onEditComment.next(commentId);
    }

    expandComment(commentId: any) {
        this.onExpandComment.next(commentId);
    }

    replay(commentId: any) {
        this.onAddReplay.next(commentId);
    }

    continueThread() {
        this.onExpandComment.next(this.comment.id);
    } 
    
    isRootExpanded() {
        if (!this._expandedComments) {
            return false;
        }

        const existing = this._expandedComments.find(_ => _ === this.comment.id);
        if (existing) {
            return true;
        }

        return false;
    }
}