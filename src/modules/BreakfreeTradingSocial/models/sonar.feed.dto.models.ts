export interface SonarFeedUserInfoDTO {
    name: string;
    avatarId: string;
    level: string;
    levelName: string;
    userId: string;
}

export interface SonarFeedCommentDTO {
    id: number;
    text: string;
    user: SonarFeedUserInfoDTO;
    likesCount: number;
    dislikesCount: number;
    hasUserLike: boolean;
    hasUserDislike: boolean;
    parentComment: SonarFeedCommentDTO;
    comments: SonarFeedCommentDTO[];
    isOwnComment: boolean;
    time: number;
}

export interface SonarFeedItemBodyDTO {
    exchange: string;
    granularity: number;
    side: string;
    symbol: string;
    time: number;
    type: string;
    algoId: string;
    algoTime: number;
}

export interface SonarFeedItemDTO {
    id: any;
    body: SonarFeedItemBodyDTO;
    user: SonarFeedUserInfoDTO;
    time: number;
    likesCount: number;
    dislikesCount: number;
    hasUserLike: boolean;
    hasUserDislike: boolean;
    lastComment: SonarFeedCommentDTO;
    commentsTotal: number;
    isFavorite: boolean;
}

export interface SonarFeedItemLikeResponseDTO {
    dislikesCount: number;
    hasUserDislike: boolean;
    hasUserLike: boolean;
    isFavorite: boolean;
    likesCount: number;
    postId: number;
}

export interface SonarFeedItemCommentLikeResponseDTO {
    dislikesCount: number;
    hasUserDislike: boolean;
    hasUserLike: boolean;
    likesCount: number;
    commentId: number;
}

export interface SonarFeedNotificationResponseDTO {
    postId: number;
    commentId: number;
    reactor: SonarFeedUserInfoDTO;
    replyComment: SonarFeedCommentDTO;
    isLike: boolean;
    isRead: boolean;
    time: number;
}

export interface SonarFeedNotificationsHistoryResponseDTO {
    notifications: SonarFeedNotificationResponseDTO[];
    total: number;
}