import {Roles, UserProfileModel} from "@app/models/auth/auth.models";
import {PaginationParams} from "@app/models/pagination.model";

export interface IBaseResponse<T = any> {
    data: T;
    total: number;
    error?: {
        errorData: any;
        errorDescription: string;
        errorType: number;
    };
}

export interface IGetQuestionsParams {
    page: number;
    pageSize: number;
}

export const DEFAULT_PAGINATION_PARAMS: IGetQuestionsParams = {
    page: 0,
    pageSize: 10,
};

export interface IGetQuestionsByTagsParams {
    tag: string;
    pagination: PaginationParams;
}

export interface IGetQuestionFiltrationParams {
    search?: string;
    from?: string;
    to?: string;
}

export interface IGetQuestionParams {
    id: string;
    refererUrl?: string;
}

export interface ICreateQuestionParams {
    title: string;
    message: string; // base64
    tags?: string[];
}

export interface IUpdateQuestionParams {
    id: string;
    title: string;
    message: string;
    // topicId: string;
    tags: string[];
}

export interface IGetAnswersParams {
    questionId: string;
    orderType?: GetAnswersOrderType;
    page: number;
    pageSize: number;
}

export interface ICreateAnswerParams {
    questionId: string;
    message: string;
}

export interface IUpdateAnswerParams {
    id: string;
    message: string;
}

export interface ICreator {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    role: Roles;
    avatarId: string;
}

export interface QuestionDTO {
    id: string;
    title: string;
    message: string;
    tags: { name: string }[];
    creatorId: string;
    isFavorite: boolean;
    vote: PostVote;
    totalVoteCount: number;
    created?: number;
    updated?: number;
    totalCommentCount: number;
    totalAnswersCount: number;
    viewCount: number;
    creator?: UserProfileModel;
}

export interface IAnswerDTO {
    id: string;
    questionId: string;
    message: string;
    creatorId: string;
    vote: PostVote;
    totalVoteCount: number;
    totalCommentCount: number;
    created?: number;
    updated?: number;
    isFavorite: boolean;
    isRightAnswer: boolean;
    creator: UserProfileModel;
}

export interface IPostVoteResponse {
    postId: string;
    vote: PostVote;
    total: number;
}

export enum GetAnswersOrderType {
    Active = 0,
    Oldest = 1,
    Votes = 2
}

export enum PostVote {
    Up = 1,
    Down = -1,
    None = 0
}

export interface ICreateCommentParams {
    postId: string;
    message: string;
}

export interface IUpdateCommentParams {
    id: string;
    message: string;
    postId: string;
}

export interface IDeleteCommentParams {
    id: string;
    postId: string;
}

export interface IPopularTagDTO {
    tagName: string;
    count: number;
}
