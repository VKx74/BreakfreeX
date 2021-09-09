export interface SonarFeedUserInfo {
    name: string;
    avatarId: string;
    level: string;
}

export interface SonarFeedComment {
    id: number;
    text: string;
    user: SonarFeedUserInfo;
    likesCount: number;
    dislikesCount: number;
    hasUserLike: boolean;
    hasUserDislike: boolean;
    parentComment: SonarFeedComment;
    comments: SonarFeedComment[];
    isOwnComment: boolean;
    time: number;
}

export interface SonarFeedItem {
    id: any;
    symbol: string;
    exchange: string;
    type: string;
    side: string;
    granularity: number;
    time: number;
    likesCount: number;
    dislikesCount: number;
    hasUserLike: boolean;
    hasUserDislike: boolean;
    lastComment: SonarFeedComment;
    comments?: SonarFeedComment[];
    commentsTotal: number;
    isFavorite: boolean;
}