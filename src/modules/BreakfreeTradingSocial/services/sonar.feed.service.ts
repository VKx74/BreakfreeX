import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable, Subject, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { SonarFeedCommentDTO, SonarFeedItemCommentLikeResponseDTO, SonarFeedItemDTO, SonarFeedItemLikeResponseDTO, SonarFeedNotificationResponseDTO, SonarFeedNotificationsHistoryResponseDTO } from "../models/sonar.feed.dto.models";
import { SocialFeedCommentAddedNotification, SocialFeedCommentReactionNotification, SocialFeedCommentEditedNotification, SocialFeedPostReactionNotification, SocialFeedCommentRemovedNotification, SocialFeedPostAddedNotification, SonarFeedComment, SonarFeedItem, SonarFeedItemLikeResponse, SonarFeedItemCommentLikeResponse, ISocialFeedReaction, ISocialFeedLikeReaction, SocialFeedReactionType, ISocialFeedReplayReaction } from "../models/sonar.feed.models";
import { SocialFeedModelConverter } from "./models.convertter";
import { SonarFeedSocketService } from "./sonar.feed.socket.service";

export enum ESonarFeedMarketTypes {
    MajorForex = "MajorForex",
    ForexMinors = "ForexMinors",
    ForexExotic = "ForexExotics",
    Metals = "Metals",
    Indices = "Indices",
    Equities = "Equities",
    Crypto = "Crypto",
    Commodities = "Commodities",
    Bonds = "Bonds"
}

export enum ESonarFeedSetupTypes {
    Swing = "Swing",
    BRC = "BRC",
    EXT = "EXT"
}

export enum ESonarFeedOrderTypes {
    Hot = "Hot",
    New = "New",
    Top = "Top",
    Rising = "Rising",
}

export enum ESonarFeedIntervalTypes {
    Now = "Now",
    Today = "Today",
    ThisWeek = "This Week",
    ThisMonth = "This Month",
    ThisYear = "This Year",
    AllTime = "All Time"
}

export interface ISonarSetupFilters {
    type?: ESonarFeedMarketTypes[];
    setup?: ESonarFeedSetupTypes[];
    granularity?: number[];
    following?: boolean;
    timeInterval?: ESonarFeedIntervalTypes;
}

@Injectable()
export class SonarFeedService {
    // private _items: SonarFeedItem[] = [];
    // private _unlistedItems: { [id: string]: SonarFeedItem; } = {};
    private _url: string;
    private _commentReactionSubscription: Subscription;
    private _commentAddedSubscription: Subscription;
    private _commentEditedSubscription: Subscription;
    private _commentRemovedSubscription: Subscription;
    private _postReactionSubscription: Subscription;
    private _postAddedSubscription: Subscription;

    public onPostAdded: Subject<SonarFeedItem> = new Subject<SonarFeedItem>();
    public onCommentReaction: Subject<SocialFeedCommentReactionNotification> = new Subject<SocialFeedCommentReactionNotification>();
    public onPostReaction: Subject<SocialFeedPostReactionNotification> = new Subject<SocialFeedPostReactionNotification>();
    public onCommentAdded: Subject<SocialFeedCommentAddedNotification> = new Subject<SocialFeedCommentAddedNotification>();
    public onCommentEdited: Subject<SocialFeedCommentEditedNotification> = new Subject<SocialFeedCommentEditedNotification>();
    public onCommentRemoved: Subject<SocialFeedCommentRemovedNotification> = new Subject<SocialFeedCommentRemovedNotification>();

    constructor(private _http: HttpClient, private _socketService: SonarFeedSocketService) {
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

    getItems(take: number, filters: ISonarSetupFilters = null, searchText: string = null): Observable<SonarFeedItem[]> {
        const requestDate = new Date().getTime() / 1000;
        return this._loadItemsByDate(take, Math.trunc(requestDate), filters, searchText);
    }

    getFromIdItems(id: any, take: number, filters: ISonarSetupFilters = null, searchText: string = null): Observable<SonarFeedItem[]> {
        return this._loadItemsById(id, take, filters, searchText);
    }

    getOrderedItems(skip: number, take: number, postOrderType: ESonarFeedOrderTypes, filters: ISonarSetupFilters = null, searchText: string = null): Observable<SonarFeedItem[]> {
        return this._loadOrderedItems(skip, take, postOrderType, filters, searchText);
    }

    getItem(id: any): Observable<SonarFeedItem> {
        return this._loadItem(id);
    }

    getComments(postId: any): Observable<SonarFeedComment[]> {
        return this._loadComments(postId).pipe(map((items) => {
            return items;
        }));
    }

    likeItem(postId: any): Observable<SonarFeedItemLikeResponse> {
        return this._http.post<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like?isLike=true`, {
            isLike: true
        }).pipe(map((response) => {
            return response;
        }));
    }

    dislikeItem(postId: any): Observable<SonarFeedItemLikeResponse> {
        return this._http.post<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like?isLike=false`, {
            isLike: false
        }).pipe(map((response) => {
            return response;
        }));
    }

    deleteLikeItem(postId: any): Observable<SonarFeedItemLikeResponse> {
        return this._http.delete<SonarFeedItemLikeResponseDTO>(`${this._url}api/post/${postId}/like`).pipe(map((response) => {
            return response;
        }));
    }

    setFavorite(postId: any): Observable<any> {
        return this._http.post<any>(`${this._url}api/post/${postId}/favorite`, {}).pipe(map((response) => {
            return response;
        }));
    }

    deleteFavorite(postId: any): Observable<any> {
        return this._http.delete<any>(`${this._url}api/post/${postId}/favorite`).pipe(map((response) => {
            return response;
        }));
    }

    likeComment(commentId: any): Observable<SonarFeedItemCommentLikeResponse> {
        return this._http.post<SonarFeedItemCommentLikeResponseDTO>(`${this._url}api/comment/${commentId}/like?isLike=true`, {
            isLike: true
        }).pipe(map((response) => {
            return response;
        }));
    }

    dislikeComment(commentId: any): Observable<SonarFeedItemCommentLikeResponse> {
        return this._http.post<SonarFeedItemCommentLikeResponseDTO>(`${this._url}api/comment/${commentId}/like?isLike=false`, {
            isLike: false
        }).pipe(map((response) => {
            return response;
        }));
    }

    deleteLikeComment(commentId: any): Observable<SonarFeedItemCommentLikeResponse> {
        return this._http.delete<SonarFeedItemCommentLikeResponseDTO>(`${this._url}api/comment/${commentId}/like`).pipe(map((response) => {
            return response;
        }));
    }

    postComment(postId: any, comment: string): Observable<SonarFeedComment> {
        return this._http.post<any>(`${this._url}api/post/${postId}/comment`, {
            text: comment
        }).pipe(map((response: SonarFeedCommentDTO) => {
            if (!response) {
                return;
            }

            return response;
        }));
    }

    editComment(commentId: any, text: string): Observable<SonarFeedComment> {
        return this._http.patch<any>(`${this._url}api/comment/${commentId}`, {
            text: text
        }).pipe(map((response: SonarFeedCommentDTO) => {
            if (!response) {
                return;
            }

            return response;
        }));
    }

    postReplay(commentId: any, text: string): Observable<SonarFeedComment> {
        return this._http.post<any>(`${this._url}api/comment/${commentId}`, {
            text: text
        }).pipe(map((response: SonarFeedCommentDTO) => {
            if (!response) {
                return;
            }
            return response;
        }));
    }

    deleteComment(commentId: any): Observable<any> {
        return this._http.delete<any>(`${this._url}api/comment/${commentId}`).pipe(map((response) => {
            return response;
        }));
    }

    blockUser(userId: any): Observable<any> {
        return this._http.patch<any>(`${this._url}block/${userId}`, {});
    }

    unblockUser(userId: any): Observable<any> {
        return this._http.patch<any>(`${this._url}unblock/${userId}`, {});
    }

    getNotifications(): Observable<ISocialFeedReaction[]> {
        return this._http.get<SonarFeedNotificationResponseDTO[]>(`${this._url}notifications`).pipe(map((data: SonarFeedNotificationResponseDTO[]) => {
            return this._mapNotifications(data);
        }));
    }

    getNotificationsHistory(skip: number, take: number): Observable<ISocialFeedReaction[]> {
        return this._http.get<SonarFeedNotificationsHistoryResponseDTO>(`${this._url}notifications/all?skip=${skip}&take=${take}`).pipe(map((data: SonarFeedNotificationsHistoryResponseDTO) => {
            if (data && data.notifications) {
                return this._mapNotifications(data.notifications);
            }
            return [];
        }));
    } 
    
    getActiveSubscriptions(): Observable<number[]> {
        return this._http.get<number[]>(`${this._url}api/post/activePostsIds?skip=0&take=1000`).pipe(map((data: number[]) => {
           if (data) {
               return data;
           }

           return [];
        }));
    }

    private _mapNotifications(data: SonarFeedNotificationResponseDTO[]): ISocialFeedReaction[] {
        const res: ISocialFeedReaction[] = [];

        for (const item of data) {
            if (item.isLike) {
                const likeReaction: ISocialFeedLikeReaction = {
                    commentId: item.commentId,
                    time: new Date(item.time * 1000),
                    postId: item.postId,
                    read: item.isRead,
                    type: SocialFeedReactionType.Like,
                    user: item.reactor
                };

                res.push(likeReaction);
            } else if (item.replyComment) {
                const replayReaction: ISocialFeedReplayReaction = {
                    time: new Date(item.time * 1000),
                    postId: item.postId,
                    read: item.isRead,
                    type: SocialFeedReactionType.Like,
                    user: item.reactor,
                    replayText: item.replyComment.text
                };

                res.push(replayReaction);
            }
        }

        return res;
    }

    setAsReadNotifications(): Observable<any> {
        return this._http.patch<SonarFeedNotificationResponseDTO[]>(`${this._url}notifications/read`, {});
    }

    // private _addCommentToPost(post: SonarFeedItem, comment: SonarFeedComment) {
    //     const existingComments = this._getComment(post, comment.id);
    //     if (existingComments) {
    //         return;
    //     }

    //     if (post.comments) {
    //         post.comments.push(comment);
    //     }

    //     post.lastComment = comment;
    //     post.commentsTotal++;
    // }

    // private _editComment(post: SonarFeedItem, comment: SonarFeedComment, text: string) {
    //     comment.text = text;
    // }

    // private _addCommentToComment(post: SonarFeedItem, parentComment: SonarFeedComment, comment: SonarFeedComment) {
    //     if (!parentComment) {
    //         return;
    //     }

    //     const existingComments = this._getComment(post.id, comment.id);
    //     if (existingComments) {
    //         return;
    //     }

    //     if (!parentComment.comments) {
    //         parentComment.comments = [];
    //     }

    //     parentComment.comments.push(comment);
    //     post.commentsTotal++;
    // }

    // private _deleteCommentFromPost(post: SonarFeedItem, commentId: any) {
    //     this._deleteCommentFromCommentsList(post.comments, commentId);
    //     if (post.commentsTotal > 0) {
    //         post.commentsTotal--;
    //     }

    //     if (post.comments && post.lastComment && post.lastComment.id === commentId) {
    //         post.lastComment = post.comments[post.comments.length - 1];
    //     }
    // }

    // private _deleteCommentFromCommentsList(comments: SonarFeedComment[], commentId: any) {
    //     if (!comments) {
    //         return;
    //     }

    //     for (let i = 0; i < comments.length; i++) {
    //         if (comments[i].id === commentId) {
    //             comments.splice(i, 1);
    //             i--;
    //         }

    //         if (comments[i] && comments[i].comments) {
    //             this._deleteCommentFromCommentsList(comments[i].comments, commentId);
    //         }
    //     }
    // }

    // private _getComment(post: SonarFeedItem, commentId: any): SonarFeedComment {
    //     if (!post) {
    //         return null;
    //     }

    //     if (post.comments) {
    //         const comment = this._findRecursiveComments(commentId, post.comments);
    //         if (comment) {
    //             return comment;
    //         }
    //     }

    //     if (post.lastComment) {
    //         if (post.lastComment.id === commentId) {
    //             return post.lastComment;
    //         }

    //         if (post.lastComment.comments) {
    //             const comment = this._findRecursiveComments(commentId, post.lastComment.comments);
    //             if (comment) {
    //                 return comment;
    //             }
    //         }
    //     }

    //     return null;
    // }

    // private _findRecursiveComments(commentId: any, comments: SonarFeedComment[]): SonarFeedComment {
    //     for (const c of comments) {
    //         if (c.id === commentId) {
    //             return c;
    //         }

    //         if (c.comments && c.comments.length) {
    //             const commentInside = this._findRecursiveComments(commentId, c.comments);
    //             if (commentInside) {
    //                 return commentInside;
    //             }
    //         }
    //     }
    // }

    // private _searchCommentById(commentId: any, items: SonarFeedItem[]): { comment: SonarFeedComment, post: SonarFeedItem } {
    //     for (const item of items) {
    //         if (item.lastComment && item.lastComment.id === commentId) {
    //             return { comment: item.lastComment, post: item };
    //         }

    //         if (item.comments) {
    //             const comment = this._findRecursiveComments(commentId, item.comments);
    //             if (comment) {
    //                 return { comment: comment, post: item };
    //             }
    //         }
    //     }
    // }

    // private _updateItemLikes(post: SonarFeedItem, response: SonarFeedItemLikeResponseDTO) {
    //     if (!response || !post) {
    //         return;
    //     }

    //     if (post.dislikesCount === response.dislikesCount &&
    //         post.likesCount === response.likesCount &&
    //         post.hasUserDislike === response.hasUserDislike &&
    //         post.hasUserLike === response.hasUserLike &&
    //         post.isFavorite === response.isFavorite) {
    //         return;
    //     }

    //     post.dislikesCount = response.dislikesCount;
    //     post.likesCount = response.likesCount;
    //     post.hasUserDislike = response.hasUserDislike;
    //     post.hasUserLike = response.hasUserLike;
    //     post.isFavorite = response.isFavorite;

    //     this.onPostChanged.next(post);
    // }

    // private _updateCommentLikes(post: SonarFeedItem, comment: SonarFeedComment, response: SonarFeedItemCommentLikeResponseDTO) {
    //     if (!response || !comment || !post) {
    //         return;
    //     }

    //     if (comment.dislikesCount === response.dislikesCount &&
    //         comment.likesCount === response.likesCount &&
    //         comment.hasUserDislike === response.hasUserDislike &&
    //         comment.hasUserLike === response.hasUserLike) {
    //         return;
    //     }

    //     comment.dislikesCount = response.dislikesCount;
    //     comment.likesCount = response.likesCount;
    //     comment.hasUserDislike = response.hasUserDislike;
    //     comment.hasUserLike = response.hasUserLike;

    //     this.onPostChanged.next(post);
    // }


    private _loadItem(id: any): Observable<SonarFeedItem> {
        return this._http.get<SonarFeedItemDTO>(`${this._url}api/post/${id}`).pipe(map((item) => {
            if (!item) {
                return null;
            }

            const convertedItem = SocialFeedModelConverter.ConvertToSonarFeedPost(item);
            return convertedItem;
        }));
    }

    private _loadItemsByDate(limit: number, dateTo: number, filters: ISonarSetupFilters, searchText: string): Observable<SonarFeedItem[]> {
        const filterString = this._createFilterString(filters, searchText);
        return this._http.get<SonarFeedItemDTO[]>(`${this._url}api/post?dateTo=${dateTo}&limit=${limit}${filterString}`).pipe(map((items) => {
            const res: SonarFeedItem[] = [];
            for (const item of items) {
                const converted = SocialFeedModelConverter.ConvertToSonarFeedPost(item);
                res.push(converted);
            }
            return res;
        }));
    }

    private _loadItemsById(id: any, take: number, filters: ISonarSetupFilters, searchText: string): Observable<SonarFeedItem[]> {
        const filterString = this._createFilterString(filters, searchText);
        return this._http.get<SonarFeedItemDTO[]>(`${this._url}api/post/${id}/before?limit=${take}${filterString}`).pipe(map((items) => {
            const res: SonarFeedItem[] = [];
            for (const item of items) {
                const converted = SocialFeedModelConverter.ConvertToSonarFeedPost(item);
                res.push(converted);
            }
            return res;
        }));
    }

    private _loadOrderedItems(skip: number, take: number, postOrderType: ESonarFeedOrderTypes, filters: ISonarSetupFilters, searchText: string): Observable<SonarFeedItem[]> {
        const filterString = this._createFilterString(filters, searchText);
        return this._http.get<SonarFeedItemDTO[]>(`${this._url}api/post/ordered?skip=${skip}&take=${take}&orderPostType=${postOrderType}${filterString}`).pipe(map((items) => {
            const res: SonarFeedItem[] = [];
            for (const item of items) {
                const converted = SocialFeedModelConverter.ConvertToSonarFeedPost(item);
                res.push(converted);
            }
            return res;
        }));
    }

    private _createFilterString(filters: ISonarSetupFilters, searchText: string): string {
        let res = '';

        if (!filters) {
            return res;
        }

        if (filters.granularity) {
            for (const g of filters.granularity) {
                res += `&granularities=${g}`;
            }
        }

        if (filters.setup) {
            for (const s of filters.setup) {
                res += `&setupTypes=${s}`;
            }
        }

        if (filters.type) {
            for (const t of filters.type) {
                res += `&marketTypes=${t}`;
            }
        }

        if (filters.following) {
            res += `&favorite=true`;
        }

        if (searchText) {
            res += `&symbol=${searchText}`;
        }

        if (filters.timeInterval) {
            let index = Object.values(ESonarFeedIntervalTypes).indexOf(filters.timeInterval);
            if (index >= 0) {
                let val = Object.keys(ESonarFeedIntervalTypes)[index];
                res += `&timeIntervalType=${val}`;
            }
        }

        return res;
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

    private _processCommentReaction(data: SocialFeedCommentReactionNotification) {
        this.onCommentReaction.next(data);
    }

    private _processCommentAdded(data: SocialFeedCommentAddedNotification) {
        this.onCommentAdded.next(data);
    }

    private _processCommentEdited(data: SocialFeedCommentEditedNotification) {
        // const post = this._getPost(data.postId);
        // if (!post) {
        //     return;
        // }

        // const comment = this._getComment(data.postId, data.id);
        // if (!comment) {
        //     return;
        // }

        // if (comment.likesCount === data.likesCount && comment.dislikesCount === data.dislikesCount && comment.text === data.text) {
        //     return;
        // }

        // comment.likesCount = data.likesCount;
        // comment.dislikesCount = data.dislikesCount;
        // comment.text = data.text;

        this.onCommentEdited.next(data);
    }

    private _processCommentRemoved(data: SocialFeedCommentRemovedNotification) {
        this.onCommentRemoved.next(data);
    }

    private _processPostReaction(data: SocialFeedPostReactionNotification) {
        this.onPostReaction.next(data);
    }

    private _processPostAdded(data: SocialFeedPostAddedNotification) {
        const newPost = SocialFeedModelConverter.ConvertNotificationToSonarFeedPost(data);
        this.onPostAdded.next(newPost);
    }
}