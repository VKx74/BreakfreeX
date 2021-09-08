export interface SonarFeedUserInfoDTO {
    name: string;
    avatarId: string;
    level: string;
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
}

export interface SonarFeedItemLikeResponseDTO {
    dislikesCount: number;
    hasUserDislike: boolean;
    hasUserLike: boolean;
    likesCount: number;
    postId: number;
}