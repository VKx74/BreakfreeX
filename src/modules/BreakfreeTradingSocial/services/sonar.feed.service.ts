import { F } from "@angular/cdk/keycodes";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { IdentityService } from "@app/services/auth/identity.service";
import { switchmap } from "@decorators/switchmap";
import { Observable, of, Subject, Subscription } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { SonarFeedCommentDTO, SonarFeedItemCommentLikeResponseDTO, SonarFeedItemDTO, SonarFeedItemLikeResponseDTO } from "../models/sonar.feed.dto.models";
import { SocialFeedCommentAddedNotification, SocialFeedCommentCommentReactionNotification, SocialFeedCommentEditedNotification, SocialFeedCommentPostReactionNotification, SocialFeedCommentRemovedNotification, SocialFeedPostAddedNotification, SonarFeedComment, SonarFeedItem } from "../models/sonar.feed.models";
import { SocialFeedModelConverter } from "./models.convertter";
import { SonarFeedSocketService } from "./sonar.feed.socket.service";

@Injectable()
export class SonarFeedService {
    private _items: SonarFeedItem[] = [];
    private _unlistedItems: { [id: string]: SonarFeedItem; } = {};
    private _url: string;
    private _commentReactionSubscription: Subscription;
    private _commentAddedSubscription: Subscription;
    private _commentEditedSubscription: Subscription;
    private _commentRemovedSubscription: Subscription;
    private _postReactionSubscription: Subscription;
    private _postAddedSubscription: Subscription;

    public onPostChanged: Subject<SonarFeedItem> = new Subject<SonarFeedItem>();
    public onPostAdded: Subject<SonarFeedItem> = new Subject<SonarFeedItem>();

    constructor(private _http: HttpClient, private _socketService: SonarFeedSocketService, private _identity: IdentityService) {
        this._url = AppConfigService.config.apiUrls.socialFeedREST;
        this._socketService.open().subscribe(() => {
            console.log("Sonar Feed Socket opened");
        }, () => {
            console.error("Sonar Feed Socket failed to open");
        });

        this._commentReactionSubscription = this._socketService.commentReaction.subscribe((data) => this._processCommentReaction(data));
        this._commentAddedSubscription = this._socketService.commentAdded.subscribe((data) => this._processCommentAdded(data));
        this._commentEditedSubscription = this._socketService.commentEdited.subscribe((data) => this._processCommentEdited(data));
        this._commentRemovedSubscription = this._socketService.commentRemoved.subscribe((data) => this._processCommentRemoved(data));

        this._postReactionSubscription = this._socketService.postReaction.subscribe((data) => this._processPostReaction(data));
        this._postAddedSubscription = this._socketService.postAdded.subscribe((data) => this._processPostAdded(data));
    }

    getItems(skip: number, take: number): Observable<SonarFeedItem[]> {
        const count = skip + take;
        if (this._items.length >= count) {
            return of(this._items.slice(skip, skip + take));
        }

        const lastItem = this._items[this._items.length - 1];
        const requestDate = lastItem ? lastItem.time : (new Date().getTime() / 1000);

        return this._loadItems(take * 5, Math.trunc(requestDate)).pipe(map(() => {
            return this._items.slice(skip, skip + take);
        }));
    }

    getItem(id: any): Observable<SonarFeedItem> {
        return this._loadItem(id);
    }

    getComments(postId: any): Observable<SonarFeedComment[]> {
        const existing = this._getPost(postId);

        return this._loadComments(postId).pipe(map((items) => {
            if (existing) {
                existing.comments = items;
                if (items) {
                    existing.lastComment = items[items.length - 1];
                } else {
                    existing.lastComment = null;
                }
                existing.commentsTotal = existing.comments ? existing.comments.length : 0;
                this.onPostChanged.next(existing);
            }
            return items;
        }));
    }

    likeItem(postId: any): Observable<SonarFeedItem> {
        const post = this._getPost(postId);

        if (post && post.hasUserLike) {
            return this.deleteLikeItem(postId);
        }

        return this._http.post<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like?isLike=true`, {
            isLike: true
        }).pipe(map((response) => {
            this._updateItemLikes(post, response);
            return post;
        }));
    }

    dislikeItem(postId: any): Observable<SonarFeedItem> {
        const post = this._getPost(postId);
        if (post && post.hasUserDislike) {
            return this.deleteLikeItem(postId);
        }

        return this._http.post<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like?isLike=false`, {
            isLike: false
        }).pipe(map((response) => {
            this._updateItemLikes(post, response);
            return post;
        }));
    }

    deleteLikeItem(postId: any): Observable<SonarFeedItem> {
        const post = this._getPost(postId);
        if (!post) {
            return of(null);
        }

        if (!post.hasUserLike && !post.hasUserDislike) {
            return of(post);
        }

        return this._http.delete<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like`).pipe(map((response) => {
            this._updateItemLikes(post, response);
            return post;
        }));
    }

    setFavorite(postId: any): Observable<SonarFeedItem> {
        const post = this._getPost(postId);
        if (post && post.isFavorite) {
            return this.deleteFavorite(postId);
        }

        return this._http.post<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/favorite`, {}).pipe(map((response) => {
            this._updateItemLikes(post, response);
            return post;
        }));
    }

    deleteFavorite(postId: any): Observable<SonarFeedItem> {
        const post = this._getPost(postId);
        if (post && !post.isFavorite) {
            return of(post);
        }

        return this._http.delete<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/favorite`).pipe(map((response) => {
            this._updateItemLikes(post, response);
            return post;
        }));
    }

    likeComment(postId: any, commentId: any): Observable<SonarFeedComment> {
        const comment = this._getComment(postId, commentId);
        if (!comment) {
            return of(null);
        }

        if (comment.hasUserLike) {
            return this.deleteLikeComment(postId, commentId);
        }

        const post = this._getPost(postId);

        return this._http.post<SonarFeedItemCommentLikeResponseDTO>(`${this._url}api/comment/${commentId}/like?isLike=true`, {
            isLike: true
        }).pipe(map((response) => {
            this._updateCommentLikes(post, comment, response);
            return comment;
        }));
    }

    dislikeComment(postId: any, commentId: any): Observable<SonarFeedComment> {
        const comment = this._getComment(postId, commentId);
        if (!comment) {
            return of(null);
        }

        if (comment.hasUserDislike) {
            return this.deleteLikeComment(postId, commentId);
        }

        const post = this._getPost(postId);

        return this._http.post<SonarFeedItemCommentLikeResponseDTO>(`${this._url}api/comment/${commentId}/like?isLike=false`, {
            isLike: false
        }).pipe(map((response) => {
            this._updateCommentLikes(post, comment, response);
            return comment;
        }));
    }

    deleteLikeComment(postId: any, commentId: any): Observable<SonarFeedComment> {
        const comment = this._getComment(postId, commentId);
        if (!comment) {
            return of(null);
        }

        const post = this._getPost(postId);

        return this._http.delete<SonarFeedItemCommentLikeResponseDTO>(`${this._url}api/comment/${commentId}/like`).pipe(map((response) => {
            this._updateCommentLikes(post, comment, response);
            return comment;
        }));
    }

    postComment(postId: any, comment: string): Observable<SonarFeedItem> {
        const post = this._getPost(postId);

        if (!post) {
            return of(null);
        }

        return this._http.post<any>(`${this._url}api/post/${postId}/comment`, {
            text: comment
        }).pipe(map((response: SonarFeedCommentDTO) => {
            if (!response) {
                return;
            }
            const commentItem = SocialFeedModelConverter.ConvertToSonarFeedComment(response);
            this._addCommentToPost(post, commentItem);
            return post;
        }));
    }

    postReplay(postId: any, commentId: any, text: string): Observable<SonarFeedItem> {
        const comment = this._getComment(postId, commentId);

        if (!comment) {
            return of(null);
        }

        const post = this._getPost(postId);

        return this._http.post<any>(`${this._url}api/comment/${commentId}`, {
            text: text
        }).pipe(map((response: SonarFeedCommentDTO) => {
            if (!response) {
                return;
            }
            const replayedComment = SocialFeedModelConverter.ConvertToSonarFeedComment(response);
            this._addCommentToComment(post, comment, replayedComment);
            return post;
        }));
    }

    deleteComment(postId: any, commentId: any): Observable<SonarFeedItem> {
        const comment = this._getComment(postId, commentId);
        const post = this._getPost(postId);

        if (!post || !comment) {
            return of(null);
        }

        return this._http.delete<any>(`${this._url}api/comment/${commentId}`).pipe(map((response) => {
            this._deleteCommentFromPost(post, commentId);
            return post;
        }));
    }

    refresh() {
        this._items = [];
        this._unlistedItems = {};
    }

    private _addCommentToPost(post: SonarFeedItem, comment: SonarFeedComment) {
        const existingComments = this._getComment(post.id, comment.id);
        if (existingComments) {
            return;
        }

        if (post.comments) {
            post.comments.push(comment);
        }

        post.lastComment = comment;
        post.commentsTotal++;

        this.onPostChanged.next(post);
    }

    private _addCommentToComment(post: SonarFeedItem, parentComment: SonarFeedComment, comment: SonarFeedComment) {
        const existingComments = this._getComment(post.id, comment.id);
        if (existingComments) {
            return;
        }

        if (!parentComment.comments) {
            parentComment.comments = [];
        }

        parentComment.comments.push(comment);
        post.commentsTotal++;

        this.onPostChanged.next(post);
    }

    private _deleteCommentFromPost(post: SonarFeedItem, commentId: any) {
        this._deleteCommentFromCommentsList(post.comments, commentId);
        if (post.commentsTotal > 0) {
            post.commentsTotal--;
        }

        if (post.comments && post.lastComment && post.lastComment.id === commentId) {
            post.lastComment = post.comments[post.comments.length - 1];
        }

        this.onPostChanged.next(post);
    }

    private _deleteCommentFromCommentsList(comments: SonarFeedComment[], commentId: any) {
        if (!comments) {
            return;
        }

        for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === commentId) {
                comments.splice(i, 1);
                i--;
            }

            if (comments[i].comments) {
                this._deleteCommentFromCommentsList(comments[i].comments, commentId);
            }
        }
    }

    private _getPost(postId: any): SonarFeedItem {
        const post = this._items.find(_ => _.id === postId);
        if (post) {
            return post;
        }

        return this._unlistedItems[postId];
    }

    private _getComment(postId: any, commentId: any): SonarFeedComment {
        const post = this._getPost(postId);
        if (!post) {
            return null;
        }

        if (post.comments) {
            const comment = this._findRecursiveComments(commentId, post.comments);
            if (comment) {
                return comment;
            }
        }

        if (post.lastComment) {
            if (post.lastComment.id === commentId) {
                return post.lastComment;
            }
        }

        return null;
    }

    private _findRecursiveComments(commentId: any, comments: SonarFeedComment[]): SonarFeedComment {
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

    private _searchCommentById(commentId: any): { comment: SonarFeedComment, post: SonarFeedItem } {
        for (const item of this._items) {
            if (item.lastComment && item.lastComment.id === commentId) {
                return { comment: item.lastComment, post: item };
            }

            if (item.comments) {
                const comment = this._findRecursiveComments(commentId, item.comments);
                if (comment) {
                    return { comment: comment, post: item };
                }
            }
        }

        for (const item in this._unlistedItems) {
            const post = this._unlistedItems[item];

            if (post.lastComment && post.lastComment.id === commentId) {
                return { comment: post.lastComment, post: post };
            }

            if (post.comments) {
                const comment = this._findRecursiveComments(commentId, post.comments);
                if (comment) {
                    return { comment: comment, post: post };
                }
            }
        }
    }

    private _loadItems(limit: number, dateTo: number): Observable<SonarFeedItem[]> {
        return this._http.get<SonarFeedItemDTO[]>(`${this._url}api/post?dateTo=${dateTo}&limit=${limit}`).pipe(map((items) => {
            const res: SonarFeedItem[] = [];
            for (const item of items) {
                const converted = SocialFeedModelConverter.ConvertToSonarFeedPost(item);
                const existing = this._items.find(_ => _.id === converted.id);
                if (!existing) {
                    this._items.push(converted);
                }
                res.push(converted);
            }
            return res;
        }));
    }

    private _loadItem(id: any): Observable<SonarFeedItem> {
        return this._http.get<SonarFeedItemDTO>(`${this._url}api/post/${id}`).pipe(map((item) => {
            if (!item) {
                return null;
            }

            const convertedItem = SocialFeedModelConverter.ConvertToSonarFeedPost(item);
            this._unlistedItems[convertedItem.id] = convertedItem;
            return convertedItem;
        }));
    }

    private _loadComments(postId: any): Observable<SonarFeedComment[]> {
        return this._http.get<SonarFeedCommentDTO[]>(`${this._url}api/post/${postId}/comments?tree=true`).pipe(map((items) => {
            const res: SonarFeedComment[] = [];
            for (const item of items) {
                const converted = SocialFeedModelConverter.ConvertToSonarFeedComment(item);
                res.push(converted);
            }
            return res;
        }));
    }

    private _updateItemLikes(post: SonarFeedItem, response: SonarFeedItemLikeResponseDTO) {
        if (!response || !post) {
            return;
        }

        if (post.dislikesCount === response.dislikesCount &&
            post.likesCount === response.likesCount &&
            post.hasUserDislike === response.hasUserDislike &&
            post.hasUserLike === response.hasUserLike &&
            post.isFavorite === response.isFavorite) {
            return;
        }

        post.dislikesCount = response.dislikesCount;
        post.likesCount = response.likesCount;
        post.hasUserDislike = response.hasUserDislike;
        post.hasUserLike = response.hasUserLike;
        post.isFavorite = response.isFavorite;

        this.onPostChanged.next(post);
    }

    private _updateCommentLikes(post: SonarFeedItem, comment: SonarFeedComment, response: SonarFeedItemCommentLikeResponseDTO) {
        if (!response || !comment || !post) {
            return;
        }

        if (comment.dislikesCount === response.dislikesCount &&
            comment.likesCount === response.likesCount &&
            comment.hasUserDislike === response.hasUserDislike &&
            comment.hasUserLike === response.hasUserLike) {
            return;
        }

        comment.dislikesCount = response.dislikesCount;
        comment.likesCount = response.likesCount;
        comment.hasUserDislike = response.hasUserDislike;
        comment.hasUserLike = response.hasUserLike;

        this.onPostChanged.next(post);
    }

    private _processCommentReaction(data: SocialFeedCommentCommentReactionNotification) {
        const item = this._searchCommentById(data.id);
        if (!data) {
            return;
        }

        if (item.comment.likesCount === data.likesCount && item.comment.dislikesCount === data.dislikesCount) {
            return;
        }

        item.comment.likesCount = data.likesCount;
        item.comment.dislikesCount = data.dislikesCount;
        this.onPostChanged.next(item.post);
    }

    private _processCommentAdded(data: SocialFeedCommentAddedNotification) {
        const post = this._getPost(data.postId);
        if (!post) {
            return;
        }

        const existingComments = this._getComment(post.id, data.id);
        if (existingComments) {
            return;
        }

        const comment = SocialFeedModelConverter.ConvertNotificationToSonarFeedComment(data, this._identity.id);

        if (data.parentCommentId) {
            const parentComment = this._getComment(post.id, data.parentCommentId);
            this._addCommentToComment(post, parentComment, comment);
        } else {
            this._addCommentToPost(post, comment);
        }

        // this.getComments(post.id).subscribe();
        return;
    }

    private _processCommentEdited(data: SocialFeedCommentEditedNotification) {
        const post = this._getPost(data.postId);
        if (!post) {
            return;
        }

        const comment = this._getComment(data.postId, data.id);
        if (!comment) {
            return;
        }

        if (comment.likesCount === data.likesCount && comment.dislikesCount === data.dislikesCount && comment.text === data.text) {
            return;
        }

        comment.likesCount = data.likesCount;
        comment.dislikesCount = data.dislikesCount;
        comment.text = data.text;

        this.onPostChanged.next(post);
    }

    private _processCommentRemoved(data: SocialFeedCommentRemovedNotification) {
        const post = this._getPost(data.postId);
        if (!post) {
            return;
        }

        this._deleteCommentFromPost(post, data.id);
    }

    private _processPostReaction(data: SocialFeedCommentPostReactionNotification) {
        const post = this._getPost(data.id);
        if (!post) {
            return;
        }

        if (post.likesCount === data.likesCount && post.dislikesCount === data.dislikesCount) {
            return;
        }

        post.likesCount = data.likesCount;
        post.dislikesCount = data.dislikesCount;
        this.onPostChanged.next(post);
    }

    private _processPostAdded(data: SocialFeedPostAddedNotification) {
        if (!this._items || !this._items.length) {
            return;
        }

        const post = this._getPost(data.id);
        if (post) {
            return;
        }
        const newPost = SocialFeedModelConverter.ConvertNotificationToSonarFeedPost(data);
        this._items.unshift(newPost);
        this.onPostAdded.next(newPost);
    }
}