import {PostVote, QuestionDTO} from "./api";
import {UserProfileModel} from "@app/models/auth/auth.models";

export class QuestionModel {
    id: string;
    title: string;
    message: string;
    tags: { name: string }[];
    creatorId: string;
    creator: UserProfileModel;
    isFavorite: boolean;
    vote: PostVote;
    totalVoteCount: number;
    created?: number;
    updated?: number;
    totalCommentCount: number;
    totalAnswersCount: number;
    viewCount: number;

    static fromDto(dto: QuestionDTO): QuestionModel {
        return Object.assign(new QuestionModel(), dto);
    }

    toDto(): QuestionDTO {
        return null;
    }
}

export class CreateQuestionModel {
    title: string;
    message: string;
    tags?: string[];
}

export class UpdateQuestionModel {
}