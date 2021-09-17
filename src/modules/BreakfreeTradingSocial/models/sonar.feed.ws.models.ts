
export enum SocialFeedMessageType {
    Add = "Add",
    Update = "Update",
    Delete = "Delete",
}

export enum SocialFeedMessageSubject {
    Post = "Post",
    Comment = "Comment",
    PostReaction = "PostReaction",
    CommentReaction = "CommentReaction"
}

export interface ISocialFeedUserDescription {
    name: string;
    avatarId: string;
    level: string;
    levelName: string;
    userId: string;
}

export interface ISocialFeedSetupDescription {
    exchange: string;
    granularity: number;
    side: string;
    symbol: string;
    time: number;
    type: string;
}

export interface ISocialFeedPostReaction {
    likesCount: number;
    dislikesCount: number;
    postId: number;
}

export interface ISocialFeedCommentReaction extends ISocialFeedPostReaction {
    subjectOwner: ISocialFeedUserDescription;
    lastReactor: ISocialFeedUserDescription;
}

export interface ISocialFeedCommentEdited {
    postId: number;
    parentCommentId: number;
    text: string;
    user: ISocialFeedUserDescription;
    likesCount: number;
    dislikesCount: number;
    time: number;
}

export interface ISocialFeedCommentRemoved {
    postId: number;
}

export interface ISocialFeedCommentAdded extends ISocialFeedCommentEdited {
    parentCommentUser: ISocialFeedUserDescription;
}

export interface ISocialFeedPostAdded {
    title: string;
    user: ISocialFeedUserDescription;
    body: ISocialFeedSetupDescription;
    likesCount: number;
    dislikesCount: number;
    time: number;
}

export interface ISocialFeedMessage {
    data: any;
    id: any;
    type: SocialFeedMessageType;
    subject: SocialFeedMessageSubject;
}