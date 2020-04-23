import {UserProfileModel} from "@app/models/auth/auth.models";
import {ICreatorHolder} from "../../ForumShared/data/creator-holder.interface";
import {ICreator} from "./api";

export interface ICommentDTO {
    id: string;
    message: string;
    creatorId: string;
    created: number;
    creator: UserProfileModel;
}

export class CommentModel implements ICreatorHolder {
    id: string;
    message: string;
    creatorId: string;
    created: number;
    creator: UserProfileModel;

    static fromDTO(dto: ICommentDTO): CommentModel {
        return Object.assign(new CommentModel(), dto);
    }
}