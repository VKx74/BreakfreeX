import {UserProfileModel} from "../../../app/models/auth/auth.models";

export interface ICreatorHolder {
    creatorId: string;
    creator: UserProfileModel;
}