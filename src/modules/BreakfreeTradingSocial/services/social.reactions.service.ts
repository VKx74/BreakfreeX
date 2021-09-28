import { Injectable } from "@angular/core";
import { IdentityService } from "@app/services/auth/identity.service";
import { Observable, of, Subject, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { ISocialFeedLikeReaction, ISocialFeedReaction, ISocialFeedReplayReaction, SocialFeedCommentAddedNotification, SocialFeedCommentReactionNotification, SocialFeedReactionType, SonarFeedUserInfo } from "../models/sonar.feed.models";
import { SonarFeedService } from "./sonar.feed.service";

@Injectable()
export class SocialReactionsService {
    private _newReaction: Subject<ISocialFeedReaction> = new Subject<ISocialFeedReaction>();
    private _commentReactionSubscription: Subscription;
    private _commentAddedSubscription: Subscription;
    private _reactions: ISocialFeedReaction[] = [];
    private _reactionsCanLoadMore: boolean = true;
    private _reactionsLoadCount: number = 25;

    public get canLoadMore(): boolean {
        return this._reactionsCanLoadMore;
    } 
    
    public get newReaction(): Subject<ISocialFeedReaction> {
        return this._newReaction;
    }

    // public get reactions(): ISocialFeedReaction[] {
    //     return this._reactions.slice();
    // }
    
    public get unreadExists(): boolean {
        if (!this._reactions || !this._reactions.length) {
            return false;
        }

        for (const r of this._reactions) {
            if (!r.read) {
                return true;
            }
        }
    }

    constructor(private _sonarFeedService: SonarFeedService, private _identity: IdentityService) {

        this._commentReactionSubscription = this._sonarFeedService.onCommentReaction.subscribe((data: SocialFeedCommentReactionNotification) => {
            this._processCommentReaction(data);
        });

        this._commentAddedSubscription = this._sonarFeedService.onCommentAdded.subscribe((data: SocialFeedCommentAddedNotification) => {
            this._processCommentAdded(data);
        });

        this.loadReactions().subscribe();
    }

    setAsRead() {
        this._reactions.forEach((item) => {
            item.read = true;
        });

        this._sonarFeedService.setAsReadNotifications().subscribe();
    }

    getReactions(): Observable<ISocialFeedReaction[]> {
        return of(this._reactions.slice());
    }

    loadReactions() {
        return this._sonarFeedService.getNotificationsHistory(this._reactions.length, this._reactionsLoadCount).pipe(map((data: ISocialFeedReaction[]) => {
            data.sort((a, b) => b.time.getTime() - a.time.getTime());
            this._reactions.push(...data);
            this._reactionsCanLoadMore = data && data.length === this._reactionsLoadCount;
        }));  
    }

    private _processCommentReaction(data: SocialFeedCommentReactionNotification) {
        if (!data.subjectOwner || data.subjectOwner.userId !== this._identity.id || !data.lastReactor) {
            return;
        }

        const commentReaction: ISocialFeedLikeReaction = {
            commentId: data.id,
            time: new Date(),
            postId: data.postId,
            read: false,
            type: SocialFeedReactionType.Like,
            user: data.lastReactor
        };

        this._reactions.unshift(commentReaction);

        this._newReaction.next(commentReaction);
    }

    private _processCommentAdded(data: SocialFeedCommentAddedNotification) {
        if (!data.parentCommentUser || data.parentCommentUser.userId !== this._identity.id) {
            return;
        }  
        
        if (!data.user || data.user.userId === this._identity.id) {
            return;
        }

        const commentReaction: ISocialFeedReplayReaction = {
            replayText: data.text,
            time: new Date(),
            postId: data.postId,
            read: false,
            type: SocialFeedReactionType.Replay,
            user: data.user
        };

        this._reactions.unshift(commentReaction);

        this._newReaction.next(commentReaction);
    }
}