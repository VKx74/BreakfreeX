import {DiscussionPostDTO} from "./api";
import {UserProfileModel} from "@app/models/auth/auth.models";

export class DiscussionPostModel {
    id: string;
    message: string;
    descussionId: string;
    created: number;
    creatorId: string;
    creator: UserProfileModel;

    static fromDTO(dto: DiscussionPostDTO): DiscussionPostModel {
        return Object.assign(new DiscussionPostModel(), dto);
    }
}