import { Component, OnDestroy } from '@angular/core';
import { AppRoutes } from '@app/app.routes';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ISocialFeedLikeReaction, ISocialFeedReaction, ISocialFeedReplayReaction, SocialFeedReactionType } from 'modules/BreakfreeTradingSocial/models/sonar.feed.models';
import { SocialFeedModelConverter } from 'modules/BreakfreeTradingSocial/services/models.convertter';
import { SocialReactionsService } from 'modules/BreakfreeTradingSocial/services/social.reactions.service';
import { takeUntil } from 'rxjs/operators';

interface SocialNotification {
    isRead: boolean;
    time: string;
    userAvatarId: string;
    userName: string;
    userLevel: string;
    levelName: string;
    text: string;
    postId: any;
}

@Component({
    selector: 'social-notifications-menu',
    templateUrl: './social-notifications.component.html',
    styleUrls: ['./social-notifications.component.scss']
})
export class SocialNotificationsComponent  implements OnDestroy {
    
    public notifications: SocialNotification[] = [];
    
    constructor(private _socialRealtimeNotificationsService: SocialReactionsService) {
        this._setNotifications();
        this._socialRealtimeNotificationsService.newReaction.pipe(
            takeUntil(componentDestroyed(this))
        ).subscribe((reaction) => {
            if (reaction) {
                this._addReaction(reaction);
            }
        });
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit() {
    }

    openPost(reaction: ISocialFeedReaction) {
        const host = `${window.location.origin}/#/${AppRoutes.Platform}/${AppRoutes.SocialFeed}/${reaction.postId}`;
        window.open(host, '_blank').focus();
    }

    private _setNotifications() {
        this.notifications = [];
        this._socialRealtimeNotificationsService.getReactions().subscribe((reactions: ISocialFeedReaction[]) => {
            for (const reaction of reactions) {
                this._addReaction(reaction);
            }
        });
    }

    private _addReaction(reaction: ISocialFeedReaction) {
        if (reaction.type === SocialFeedReactionType.Like) {
            const likeReaction = reaction as ISocialFeedLikeReaction;
            this.notifications.unshift({
                isRead: likeReaction.read,
                time: SocialFeedModelConverter.ConvertTimeDiffToString(likeReaction.time.getTime() / 1000),
                userAvatarId: likeReaction.user.avatarId,
                userName: likeReaction.user.name,
                levelName: likeReaction.user.levelName,
                userLevel: likeReaction.user.level,
                text: "Liked your comment",
                postId: likeReaction.postId

            });
        } else if (reaction.type === SocialFeedReactionType.Replay) {
            const likeReaction = reaction as ISocialFeedReplayReaction;
            let replyText = likeReaction.replayText.slice(0, 100);
            if (likeReaction.replayText.length > 100) {
                replyText += "...";
            }
            this.notifications.unshift({
                isRead: likeReaction.read,
                time: SocialFeedModelConverter.ConvertTimeDiffToString(likeReaction.time.getTime() / 1000),
                userAvatarId: likeReaction.user.avatarId,
                userName: likeReaction.user.name,
                levelName: likeReaction.user.levelName,
                userLevel: likeReaction.user.level,
                text: `Replied "${replyText}" to your comment`,
                postId: likeReaction.postId
            });
        }
    }
}
