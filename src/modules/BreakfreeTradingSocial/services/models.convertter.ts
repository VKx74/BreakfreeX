import { SonarFeedCommentDTO, SonarFeedItemDTO } from "../models/sonar.feed.dto.models";
import { SocialFeedCommentAddedNotification, SocialFeedPostAddedNotification, SonarFeedComment, SonarFeedItem } from "../models/sonar.feed.models";

export class SocialFeedModelConverter {
    public static ConvertToSonarFeedPost(dto: SonarFeedItemDTO): SonarFeedItem {
        return {
            id: dto.id,
            symbol: dto.body.symbol,
            exchange: dto.body.exchange,
            type: dto.body.type,
            side: dto.body.side,
            granularity: dto.body.granularity,
            time: dto.body.time,
            likesCount: dto.likesCount,
            dislikesCount: dto.dislikesCount,
            hasUserLike: dto.hasUserLike,
            hasUserDislike: dto.hasUserDislike,
            lastComment: dto.lastComment,
            commentsTotal: dto.commentsTotal,
            isFavorite: dto.isFavorite
        };
    } 
    
    public static ConvertToSonarFeedComment(dto: SonarFeedCommentDTO): SonarFeedComment {
        return dto;
    }

    public static ConvertNotificationToSonarFeedComment(dto: SocialFeedCommentAddedNotification, myId: any): SonarFeedComment {
        return {
            comments: null,
            dislikesCount: dto.dislikesCount,
            hasUserDislike: false,
            hasUserLike: false,
            id: dto.id,
            isOwnComment: dto.user.userId === myId,
            likesCount: dto.likesCount,
            parentComment: null,
            text: dto.text,
            time: dto.time,
            user: dto.user
        };
    }

    public static ConvertNotificationToSonarFeedPost(dto: SocialFeedPostAddedNotification): SonarFeedItem {
        return {
            comments: null,
            lastComment: null,
            dislikesCount: dto.dislikesCount,
            hasUserDislike: false,
            hasUserLike: false,
            id: dto.id,
            likesCount: dto.likesCount,
            time: dto.time,
            commentsTotal: 0,
            exchange: dto.exchange,
            granularity: dto.granularity,
            isFavorite: false,
            side: dto.side,
            symbol: dto.symbol,
            type: dto.type
        };
    }
}