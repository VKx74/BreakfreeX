import { SonarFeedCommentDTO, SonarFeedItemDTO } from "../models/sonar.feed.dto.models";
import { SonarFeedComment, SonarFeedItem } from "../models/sonar.feed.models";

export class SocialFeedModelConverter {
    public static ConvertToSonarFeedItem(dto: SonarFeedItemDTO): SonarFeedItem {
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
            lastComment: dto.lastComment
        };
    } 
    
    public static ConvertToSonarFeedComment(dto: SonarFeedCommentDTO): SonarFeedComment {
        return dto;
    }
}