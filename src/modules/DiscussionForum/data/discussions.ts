import {DiscussionDTO, ICategoryDTO} from "./api";
import {UserProfileModel} from "@app/models/auth/auth.models";
import {ForumType} from "../enums/enums";

export class DiscussionModel {
    id: string;
    title: string;
    description: string;
    creatorId: string;
    created: number;
    creatorModel: UserProfileModel;
    updated: string;
    forumType: ForumType;
    categories: ICategoryDTO[];

    static fromDTO(dto: DiscussionDTO): DiscussionModel {
        return Object.assign(new DiscussionModel(), dto, {created: dto.created});
    }
}
