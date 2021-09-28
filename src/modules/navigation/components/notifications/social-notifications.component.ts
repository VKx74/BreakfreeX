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
export class SocialNotificationsComponent implements OnDestroy {

    public notifications: SocialNotification[] = [];
    public loading: boolean = false;

    public get canLoadMore(): boolean {
        return this._socialRealtimeNotificationsService.canLoadMore && this.notifications && this.notifications.length > 0;
    }

    constructor(private _socialRealtimeNotificationsService: SocialReactionsService) {
        this.loadReactions();

        this._socialRealtimeNotificationsService.newReaction.pipe(
            takeUntil(componentDestroyed(this))
        ).subscribe((reaction) => {
            if (reaction) {
                const item = this._mapReaction(reaction);
                this.notifications.unshift(item);
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

    loadMore(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.loading = true;
        this._socialRealtimeNotificationsService.loadReactions().subscribe(() => {
            this.loadReactions();
        });
    }

    private loadReactions() {
        this.loading = true;
        this._socialRealtimeNotificationsService.getReactions().subscribe((reactions: ISocialFeedReaction[]) => {
            this.notifications = [];
            for (const reaction of reactions) {
                const item = this._mapReaction(reaction);
                this.notifications.push(item);
            }
            this.loading = false;
        });
    }

    private _mapReaction(reaction: ISocialFeedReaction): SocialNotification {
        if (reaction.type === SocialFeedReactionType.Like) {
            const likeReaction = reaction as ISocialFeedLikeReaction;
            return {
                isRead: likeReaction.read,
                time: SocialFeedModelConverter.ConvertTimeDiffToString(likeReaction.time.getTime() / 1000),
                userAvatarId: likeReaction.user.avatarId,
                userName: likeReaction.user.name,
                levelName: likeReaction.user.levelName,
                userLevel: likeReaction.user.level,
                text: "Liked your comment",
                postId: likeReaction.postId

            };
        } else if (reaction.type === SocialFeedReactionType.Replay) {
            const likeReaction = reaction as ISocialFeedReplayReaction;
            let replyText = likeReaction.replayText.slice(0, 100);
            if (likeReaction.replayText.length > 100) {
                replyText += "...";
            }
            return {
                isRead: likeReaction.read,
                time: SocialFeedModelConverter.ConvertTimeDiffToString(likeReaction.time.getTime() / 1000),
                userAvatarId: likeReaction.user.avatarId,
                userName: likeReaction.user.name,
                levelName: likeReaction.user.levelName,
                userLevel: likeReaction.user.level,
                text: `Replied "${replyText}" to your comment`,
                postId: likeReaction.postId
            };
        }
    }
}
