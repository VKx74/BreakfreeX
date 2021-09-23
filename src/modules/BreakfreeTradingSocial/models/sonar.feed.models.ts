export interface SonarFeedUserInfo {
    name: string;
    avatarId: string;
    userId: string;
    level: string;
    levelName: string;
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

export interface SocialFeedPostAddedNotification {
    id: any;
    symbol: string;
    exchange: string;
    type: string;
    side: string;
    granularity: number;
    time: number;
    likesCount: number;
    dislikesCount: number;
}

export interface SocialFeedCommentRemovedNotification {
    id: any;
    postId: number;
}

export interface SocialFeedCommentEditedNotification {
    id: any;
    postId: number;
    parentCommentId: number;
    text: string;
    user: SonarFeedUserInfo;
    likesCount: number;
    dislikesCount: number;
    time: number;
}

export interface SocialFeedCommentAddedNotification extends SocialFeedCommentEditedNotification {
    parentCommentUser: SonarFeedUserInfo;
}

export interface SocialFeedPostReactionNotification {
    id: any;
    likesCount: number;
    dislikesCount: number;
}

export interface SocialFeedCommentReactionNotification extends SocialFeedPostReactionNotification {
    postId: number;
    subjectOwner: SonarFeedUserInfo;
    lastReactor: SonarFeedUserInfo;
}

export interface SonarFeedItemLikeResponse {
    dislikesCount: number;
    hasUserDislike: boolean;
    hasUserLike: boolean;
    isFavorite: boolean;
    likesCount: number;
    postId: number;
}

export interface SonarFeedItemCommentLikeResponse {
    dislikesCount: number;
    hasUserDislike: boolean;
    hasUserLike: boolean;
    likesCount: number;
    commentId: number;
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