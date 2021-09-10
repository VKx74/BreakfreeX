import { Injectable } from "@angular/core";
import { WebsocketBase } from "@app/interfaces/socket/socketBase";
import { IWebSocketConfig, ReadyStateConstants } from "@app/interfaces/socket/WebSocketConfig";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable, Subject, Subscriber, Subscription } from "rxjs";
import { SocialFeedCommentAddedNotification, SocialFeedCommentCommentReactionNotification, SocialFeedCommentEditedNotification, SocialFeedCommentPostReactionNotification, SocialFeedCommentRemovedNotification, SocialFeedPostAddedNotification } from "../models/sonar.feed.models";
import { ISocialFeedCommentAdded, ISocialFeedCommentEdited, ISocialFeedCommentReaction, ISocialFeedCommentRemoved, ISocialFeedMessage, ISocialFeedPostAdded, ISocialFeedPostReaction, SocialFeedMessageSubject, SocialFeedMessageType } from "../models/sonar.feed.ws.models";

@Injectable()
export class SonarFeedSocketService extends WebsocketBase {
    private _token: string;
    private _authSucceeded: boolean;
    private _onMessageSubscription: Subscription;

    private _commentReaction: Subject<SocialFeedCommentCommentReactionNotification> = new Subject<SocialFeedCommentCommentReactionNotification>();
    private _postReaction: Subject<SocialFeedCommentPostReactionNotification> = new Subject<SocialFeedCommentPostReactionNotification>();
    private _postAdded: Subject<SocialFeedPostAddedNotification> = new Subject<SocialFeedPostAddedNotification>();
    private _commentAdded: Subject<SocialFeedCommentAddedNotification> = new Subject<SocialFeedCommentAddedNotification>();
    private _commentEdited: Subject<SocialFeedCommentEditedNotification> = new Subject<SocialFeedCommentEditedNotification>();
    private _commentRemoved: Subject<SocialFeedCommentRemovedNotification> = new Subject<SocialFeedCommentRemovedNotification>();

    get config(): IWebSocketConfig {
        return {
            url: AppConfigService.config.apiUrls.socialFeedWS
        };
    }

    get commentReaction(): Subject<SocialFeedCommentCommentReactionNotification> {
        return this._commentReaction;
    }

    get postReaction(): Subject<SocialFeedCommentPostReactionNotification> {
        return this._postReaction;
    }

    get postAdded(): Subject<SocialFeedPostAddedNotification> {
        return this._postAdded;
    }

    get commentAdded(): Subject<SocialFeedCommentAddedNotification> {
        return this._commentAdded;
    }

    get commentEdited(): Subject<SocialFeedCommentEditedNotification> {
        return this._commentEdited;
    }

    get commentRemoved(): Subject<SocialFeedCommentRemovedNotification> {
        return this._commentRemoved;
    }

    constructor() {
        super();
        // this._token = "Bearer " + this._identityService.token;

        this._onMessageSubscription = this.onMessage.subscribe(value => {
            try {
                const msgData = value as ISocialFeedMessage;
                const msgSubject = msgData && msgData.subject ? msgData.subject.toLowerCase() : "";

                if (msgSubject === SocialFeedMessageSubject.Post.toLowerCase()) {
                    this._processPost(msgData);
                    return;
                }  
                
                if (msgSubject === SocialFeedMessageSubject.Comment.toLowerCase()) {
                    this._processComment(msgData);
                    return;
                } 
                
                if (msgSubject === SocialFeedMessageSubject.PostReaction.toLowerCase()) {
                    this._processPostReaction(msgData);
                    return;
                } 
                
                if (msgSubject === SocialFeedMessageSubject.CommentReaction.toLowerCase()) {
                    this._processCommentReaction(msgData);
                    return;
                }
            } catch (e) {
                console.log('Failed to process ws message in MT5SocketService');
                console.log(e);
            }
        });
    }

    dispose() {
        this.close();
    }

    open(): Observable<void> {
        return new Observable<void>(subscriber => {
            if (this.readyState === ReadyStateConstants.OPEN) {
                subscriber.next();
                return;
            }

            this._open(subscriber);

            // if (this._identityService.isExpired) {
            //     this._identityService.refreshTokens().subscribe(() => {
            //         this._open(subscriber);
            //     }, (error) => {
            //         this._open(subscriber);
            //     });
            // } else {
            //     this._open(subscriber);
            // }

        });
    }

    sendAuth(): Observable<void> {
        return new Observable<void>(subscriber => {
            // if (this._identityService.isExpired) {
            //     this._identityService.refreshTokens().subscribe(() => {
            //         this._open(subscriber);
            //     }, (error) => {
            //         this._open(subscriber);
            //     });
            // } else {
            //     this._open(subscriber);
            // }
            this._open(subscriber);
        });
    }

    protected _open(subscriber: Subscriber<void>) {
        super.open().subscribe(() => {
            subscriber.next();
            subscriber.complete();

            // const authRequest = new AlertAuthRequest();
            // authRequest.Data = {
            //     Token: "Bearer " + this._identityService.token
            // };

            // this.auth(authRequest).subscribe((res) => {
            //     if (res.Type === AlertResponseMessageType.Success) {
            //         this._authSucceeded = true;
            //         subscriber.next();
            //         subscriber.complete();
            //     } else {
            //         this._authSucceeded = false;
            //         this.close();
            //         subscriber.complete();
            //     }
            // }, (error1) => {
            //     this._authSucceeded = false;
            //     this.close();
            //     subscriber.error(error1);
            //     subscriber.complete();
            // });

        }, (error) => {
            subscriber.error(error);
            subscriber.complete();
        });
    }

    // protected auth(data: AlertAuthRequest): Observable<AlertResponseMessageBase> {
    //     return new Observable<AlertResponseMessageBase>(subscriber => {
    //         this._send(data, subscriber);
    //     });
    // }

    // private _send(data: AlertRequestMessageBase, subscriber: Subscriber<AlertResponseMessageBase>) {
    //     try {
    //         this._subscribers[data.MessageId] = subscriber;
    //         const sent = this.send(data);
    //         if (!sent) {
    //             subscriber.error("Failed to send message");
    //             subscriber.complete();
    //         }
    //     } catch (error) {
    //         subscriber.error(error.message);
    //         subscriber.complete();
    //     }
    // }

    private _processCommentReaction(msgData: ISocialFeedMessage) {
        const data = msgData.data as ISocialFeedCommentReaction;
        this._commentReaction.next({
            id: msgData.id,
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount
        });
    }

    private _processPostReaction(msgData: ISocialFeedMessage) {
        const data = msgData.data as ISocialFeedPostReaction;
        this._postReaction.next({
            id: msgData.id,
            likesCount: data.likesCount,
            dislikesCount: data.dislikesCount
        });
    }

    private _processComment(msgData: ISocialFeedMessage) {
        const type = msgData.type;

        if (type === SocialFeedMessageType.Add) {
            const data = msgData.data as ISocialFeedCommentAdded;
            this._commentAdded.next({
                id: msgData.id,
                likesCount: data.likesCount,
                dislikesCount: data.dislikesCount,
                parentCommentId: data.parentCommentId,
                postId: data.postId,
                text: data.text,
                time: data.time,
                user: data.user
            });
        } else if (type === SocialFeedMessageType.Update) {
            const data = msgData.data as ISocialFeedCommentEdited;
            this._commentEdited.next({
                id: msgData.id,
                likesCount: data.likesCount,
                dislikesCount: data.dislikesCount,
                parentCommentId: data.parentCommentId,
                postId: data.postId,
                text: data.text,
                time: data.time,
                user: data.user
            });
        }  else if (type === SocialFeedMessageType.Delete) {
            const data = msgData.data as ISocialFeedCommentRemoved;
            this._commentRemoved.next({
                id: msgData.id,
                postId: data.postId
            });
        } 
    }

    private _processPost(msgData: ISocialFeedMessage) {
        const type = msgData.type;

        if (type === SocialFeedMessageType.Add) {
            const data = msgData.data as ISocialFeedPostAdded;
            this._postAdded.next({
                id: msgData.id,
                likesCount: data.likesCount,
                dislikesCount: data.dislikesCount,
                exchange: data.body.exchange,
                granularity: data.body.granularity,
                side: data.body.side,
                symbol: data.body.symbol,
                time: data.body.time,
                type: data.body.type
            });
        }
    }
}
