import {UserProfileModel} from "@app/models/auth/auth.models";
import {IMessageDTO} from "./api.models";

// TODO: Remove
export enum ETreadMark {
    Default = 'default',
    Favorite = 'favorite',
    Archive = 'archive'
}

export enum EThreadSubjectRole {
    User = 'user',
    Admin = 'admin'
}

export enum EThreadType {
    // TODO: Remove unused
    // Default = 'default',
    Private = 'private',
    PrivateOrGroup = 'privateOrGroup',
    // PrivateOrPublic = 'privateOrPublic',
    // GroupOrPublic = 'groupOrPublic',
    // All = 'all'
    Group = 'group',
    Public = 'public',
}

export enum EThreadMessageType {
    Text = 'text',
    Activity = 'activity'
}

export interface IThread {
    muted: boolean;
    lastMessage: IMessageDTO;
    subjects: ISubject[];
    participant: IThreadParticipant;
    messagesCount: number;
    id: string;
    name: string;
    description: string;
    creatorType: EThreadSubjectRole;
    creatorId: string;
    pictureId: string;
    type: EThreadType;
    createdAt: string;
    updatedAt: string;
    isBanned: boolean;
    isBlocked: boolean;
    isDisabled: boolean;
    removed: boolean;
    hasNewMessages?: boolean;
    creator?: {
        id: string;
        userName: string;
    };
}

export interface ISubject {
    id: string;
    type: EThreadSubjectRole;
}

export interface IThreadParticipant {
    subjectId: string;
    threadId: string;
    muted: boolean;
    role: EThreadSubjectRole;
    ban?: IThreadBan;
    // TODO: Review and remove redundant
    // mark: ETreadMark;
    // subjectType: EThreadSubjectRole;
    // createdAt: string;
    // updatedAt: string;
    userModel?: {id: string, userName: string};
}

export class ThreadParticipant implements IThreadParticipant {
    muted = true;
    userModel: UserProfileModel;
    ban: IThreadBan;

    constructor(public subjectId: string, public threadId: string, public role: EThreadSubjectRole) {
    }
}

export interface IThreadCreate {
    name: string; // maxLength: 255; minLength: 0
    description?: string;
    photo?: File;
    threadType: EThreadType;
    pictureId?: string;
}

export interface IThreadUpdate {
    name: string; // maxLength: 255; minLength: 0
    description?: string;
    photo?: File;
}

export interface IThreadMessagePublish {
    content: string;
    files?: IFileInfo[];
    clientId?: string;
}

export interface IFileInfo {
    id: string;
    name: string;
}

export interface IThreadBanCreate {
    description: string; // maxLength: 255; minLength: 0
    threadId: string;
    subjectId: string;
}

export interface IThreadBan {
    id: string;
    adminId: string;
    threadId: string;
    subjectId: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface IThreadBanContainer {
    thread: IThread;
    threadBan: IThreadBan;
}

export interface IThreadBanUpdate {
    description: string; // maxLength: 255, minLength: 0
}

export interface IThreadInviteCreate {
    threadId: string;
    subjectId: string;
}

export interface IThreadInvite {
    id: string;
    inviteCreatorId: string;
    threadId: string;
    subjectId: string;
    createdAt: string;
}

export interface IThreadInviteSubject {
    threadId: string;
    requestId: string;
    subjects: ISubject[];
}

export interface IInviteEject {
    requestId: string;
    threadInvite: IThreadInvite;
}

export interface IInviteBan {
    requestId: string;
    threadBan: IThreadBan;
}

