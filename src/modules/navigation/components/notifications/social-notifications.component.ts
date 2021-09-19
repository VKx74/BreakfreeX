import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadLayoutAction, OpenNewLayoutAction, SaveLayoutAsNewAction, SaveStateAction } from '@app/store/actions/platform.actions';
import { Store } from "@ngrx/store";
import { AppState } from '@app/store/reducer';
import { LayoutStorageService } from '@app/services/layout-storage.service';
import { ISocialFeedLikeReaction, ISocialFeedReaction, ISocialFeedReplayReaction, SocialFeedReactionType, SocialRealtimeNotificationsService } from 'modules/BreakfreeTradingSocial/services/realtime.notifications.service';
import { SocialFeedModelConverter } from 'modules/BreakfreeTradingSocial/services/models.convertter';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';

interface SocialNotification {
    isRead: boolean;
    time: string;
    userAvatarId: string;
    userName: string;
    userLevel: string;
    levelName: string;
    text: string;
}

@Component({
    selector: 'social-notifications-menu',
    templateUrl: './social-notifications.component.html',
    styleUrls: ['./social-notifications.component.scss']
})
export class SocialNotificationsComponent  implements OnDestroy {
    
    public notifications: SocialNotification[] = [];
    
    constructor(private _socialRealtimeNotificationsService: SocialRealtimeNotificationsService) {
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

    private _setNotifications() {
        this.notifications = [];
        const reactions = this._socialRealtimeNotificationsService.reactions;
        for (const reaction of reactions) {
            this._addReaction(reaction);
        }
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
                text: "Like your comment",

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
                text: `Replied "${replyText}" to your comment`
            });
        }
    }
}
