import {UserModel, UserProfileModel} from "@app/models/auth/auth.models";
import {ForumType} from "../enums/enums";
import {IPaginationParams} from "@app/models/pagination.model";

export interface IBaseResponse<T = any> {
    data: T;
    total: number;
    error: any | null;
}

export interface DiscussionDTO {
    id: string;
    title: string;
    description: string;
    creatorId: string;
    created: number;
    updated: string;
    categories: ICategoryDTO[];
    forumType: ForumType;
    creatorModel?: UserProfileModel;
}

export interface IGetDiscussionParams extends IPaginationParams {
    forumTypes: ForumType[];
    search?: string;
    categoryId?: string;
    popular?: boolean;
}

export interface ICreateDiscussionParams {
    title: string;
    description: string;
    forumType: ForumType;
    categoryIds?: string[];
}

export interface IUpdateDiscussionParams {
    title: string;
    description: string;
    categoryIds: string[];
}

export interface DiscussionPostDTO {
    id: string;
    message: string;
    descussionId: string;
    created: number;
    creatorId: string;
    creator: UserProfileModel;
}

export interface IGetDiscussionPostsParams {
    discussionId: string;
    page: number;
    pageSize: number;
}

export interface ICreateDiscussionPostParams {
    discussionId: string;
    message: string;
}

export interface IUpdateDiscussionPostParams {
    id: string;
    message: string;
}

export interface ICategoryDTO {
    id: string;
    name: string;
    description: string;
    count: number;
}

export interface ICreateCategoryParams {
    name: string;
    description: string;
}

export interface IUpdateCategoryParams {
    name: string;
    description: string;
}
