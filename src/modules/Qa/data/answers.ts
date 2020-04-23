import {IAnswerDTO, PostVote} from "./api";
import {ICreatorHolder} from "../../ForumShared/data/creator-holder.interface";
import {UserProfileModel} from "@app/models/auth/auth.models";

export class AnswerModel implements ICreatorHolder {
    id: string;
    questionId: string;
    message: string;
    creatorId: string;
    vote: PostVote;
    totalVoteCount: number;
    created?: number;
    updated?: number;
    isFavorite: boolean;
    isRightAnswer: boolean;
    totalCommentCount: number;
    creator: UserProfileModel;

    static fromDto(dto: IAnswerDTO): AnswerModel {
        return Object.assign(new AnswerModel(), dto);
    }

    toDto(): IAnswerDTO {
        return null;
    }
}

export class CreateAnswerModel {
}

export class UpdateAnswerModel {
}