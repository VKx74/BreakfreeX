import { Injectable } from "@angular/core";
import { IInstrument } from "@app/models/common/instrument";
import { IdentityService } from "@app/services/auth/identity.service";
import { Subject, Subscription } from "rxjs";
import { SocialFeedCommentAddedNotification, SocialFeedCommentReactionNotification, SonarFeedUserInfo } from "../models/sonar.feed.models";
import { SonarFeedSocketService } from "./sonar.feed.socket.service";

interface IInstrumentCache {
    instrument: IInstrument;
    time: number;
}

export enum SocialFeedReactionType {
    Replay = 0,
    Like = 1
}

export interface ReactionUserInfo extends SonarFeedUserInfo {
}

export interface ISocialFeedReaction {
    postId: any;
    time: Date;
    read: boolean;
    type: SocialFeedReactionType;
    user: ReactionUserInfo;
}

export interface ISocialFeedLikeReaction extends ISocialFeedReaction {
    commentId: any;
}
export interface ISocialFeedReplayReaction extends ISocialFeedReaction {
    replayText: string;
}

@Injectable()
export class SocialRealtimeNotificationsService {
    private _newReaction: Subject<ISocialFeedReaction> = new Subject<ISocialFeedReaction>();
    private _commentReactionSubscription: Subscription;
    private _commentAddedSubscription: Subscription;
    private _reactions: ISocialFeedReaction[] = [];

    public get newReaction(): Subject<ISocialFeedReaction> {
        return this._newReaction;
    }

    public get reactions(): ISocialFeedReaction[] {
        return this._reactions.slice();
    }
    
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

    constructor(private _socketService: SonarFeedSocketService, private _identity: IdentityService) {

        this._commentReactionSubscription = this._socketService.commentReaction.subscribe((data: SocialFeedCommentReactionNotification) => {
            this._processCommentReaction(data);
        });

        this._commentAddedSubscription = this._socketService.commentAdded.subscribe((data: SocialFeedCommentAddedNotification) => {
            this._processCommentAdded(data);
        });

        this._socketService.open().subscribe(() => {
            console.log("Sonar Feed Socket opened");
        }, () => {
            console.error("Sonar Feed Socket failed to open");
        });
    }

    setAsRead() {
        this._reactions.forEach((item) => {
            item.read = true;
        });
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

        this._reactions.push(commentReaction);

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

        this._reactions.push(commentReaction);

        this._newReaction.next(commentReaction);
    }
}