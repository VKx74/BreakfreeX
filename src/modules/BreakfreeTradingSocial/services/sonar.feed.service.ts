import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable, of, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { SonarFeedCommentDTO, SonarFeedItemDTO, SonarFeedItemLikeResponseDTO } from "../models/sonar.feed.dto.models";
import { SonarFeedComment, SonarFeedItem } from "../models/sonar.feed.models";
import { SocialFeedModelConverter } from "./models.convertter";

@Injectable()
export class SonarFeedService {
    private _items: SonarFeedItem[] = [];
    private _url: string;

    public onItemChanged: Subject<SonarFeedItem> = new Subject<SonarFeedItem>();
    public onItemsChanged: Subject<SonarFeedItem> = new Subject<SonarFeedItem>();

    constructor(private _http: HttpClient) {
        this._url = AppConfigService.config.apiUrls.socialFeedREST;
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

    getComments(postId: any): Observable<SonarFeedComment[]> {
        const existing = this._items.find(_ => _.id === postId);

        if (existing && existing.comments) {
            return of(existing.comments);
        }

        return this._loadComments(postId).pipe(map((items) => {
            if (existing) {
                existing.comments = items;
            }
            return items;
        }));
    }

    likeItem(postId: any): Observable<SonarFeedItem> {
        const post = this._getPost(postId);
        if (post.hasUserLike) {
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
        if (post.hasUserDislike) {
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
        if (!post.hasUserLike && !post.hasUserDislike) {
            return of(post);
        }

        return this._http.delete<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like`).pipe(map((response) => {
            this._updateItemLikes(post, response);
            return post;
        }));
    }

    likeComment(postId: any, commentId: any): Observable<SonarFeedComment> {
        const comment = this._getComment(postId, commentId);
        if (!comment) {
            return of(null);
        }

        const post = this._getPost(postId);

        return this._http.post<any>(`${this._url}api/comment/${commentId}/like`, {
            isLike: true
        }).pipe(map(() => {
            comment.likesCount++;
            comment.hasUserLike = true;
            if (comment.hasUserDislike) {
                comment.dislikesCount--;
                comment.hasUserDislike = false;
            }
            this.onItemChanged.next(post);
            return comment;
        }));
    }

    dislikeComment(postId: any, commentId: any): Observable<SonarFeedComment> {
        const comment = this._getComment(postId, commentId);
        if (!comment) {
            return of(null);
        }

        const post = this._getPost(postId);

        return this._http.post<any>(`${this._url}api/comment/${commentId}/like`, {
            isLike: false
        }).pipe(map(() => {
            comment.dislikesCount++;
            comment.hasUserDislike = true;
            if (comment.hasUserLike) {
                comment.likesCount--;
                comment.hasUserLike = false;
            }
            this.onItemChanged.next(post);
            return comment;
        }));
    }

    deleteLikeComment(postId: any, commentId: any): Observable<SonarFeedComment> {
        const comment = this._getComment(postId, commentId);
        if (!comment) {
            return of(null);
        }

        const post = this._getPost(postId);

        return this._http.delete<any>(`${this._url}api/comment/${commentId}/like`).pipe(map(() => {
            if (comment.hasUserLike) {
                comment.likesCount--;
            }
            if (comment.hasUserDislike) {
                comment.dislikesCount--;
            }
            comment.hasUserLike = false;
            comment.hasUserDislike = false;
            this.onItemChanged.next(post);
            return comment;
        }));
    }

    postComment(postId: any, comment: string): Observable<SonarFeedItem> {
        const post = this._getPost(postId);

        if (!post) {
            return of(null);
        }

        return this._http.post<any>(`${this._url}api/post/${postId}/comment`, {
            comment: comment
        }).pipe(map(() => {
            // todo: reload post
            return post;
        }));
    }
    
    deleteComment(postId: any, commentId: any): Observable<SonarFeedItem> {
        const comment = this._getComment(postId, commentId);
        const post = this._getPost(postId);

        if (!post || !comment) {
            return of(null);
        }

        return this._http.delete<any>(`${this._url}api/comment/${commentId}`).pipe(map(() => {
           // todo: reload post
            return post;
        }));
    }

    private _getPost(postId: any): SonarFeedItem {
        return this._items.find(_ => _.id === postId);
    }
    
    private _getComment(postId: any, commentId: any): SonarFeedComment {
        const post = this._getPost(postId);
        if (!post) {
            return null;
        }

        if (post.comments) {
            const comment = post.comments.find(_ => _.id === commentId);
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

    private _loadItems(limit: number, dateTo: number): Observable<SonarFeedItem[]> {
        return this._http.get<SonarFeedItemDTO[]>(`${this._url}api/post?dateTo=${dateTo}&limit=${limit}`).pipe(map((items) => {
            const res: SonarFeedItem[] = [];
            for (const item of items) {
                const converted = SocialFeedModelConverter.ConvertToSonarFeedItem(item);
                const existing = this._items.find(_ => _.id === converted.id);
                if (!existing) {
                    this._items.push(converted);
                }
                res.push(converted);
            }
            return res;
        }));
    }

    private _loadComments(postId: any): Observable<SonarFeedComment[]> {
        return this._http.get<SonarFeedCommentDTO[]>(`${this._url}api/post/${postId}/comments`).pipe(map((items) => {
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

        post.dislikesCount = response.dislikesCount;
        post.likesCount = response.likesCount;
        post.hasUserDislike = response.hasUserDislike;
        post.hasUserLike = response.hasUserLike;

        this.onItemChanged.next(post);
    }
}