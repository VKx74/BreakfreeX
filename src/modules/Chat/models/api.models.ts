import {EThreadMessageType, EThreadSubjectRole, EThreadType, IFileInfo} from "./thread";

export interface IThreadDTO {
    muted: boolean;
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
    lastMessage: IMessageDTO;
    bannedTill: string;
}

export interface IMessageDTO {
    files: IFileInfo[];
    unread: boolean;
    id: string;
    threadId: string;
    content: string;
    fromType: EThreadSubjectRole;
    type: EThreadMessageType;
    fromId: string;
    createdAt: string;
    updatedAt: string;
    creator: {
        id: string;
        userName: string;
        avatarId?: string;
    };
}

// export interface IMessageDTO {
//     files: IFileInfo[];
//     unread: boolean;
//     id: string;
//     threadId: string;
//     content: string;
//     fromType: EThreadSubjectRole;
//     type: EThreadMessageType;
//     fromId: string;
//     createdAt: string;
//     updatedAt: string;
//     clientId?: string;
//     creator: {
//         id: string;
//         userName: string;
//         avatarId?: string;
//     };
// }
