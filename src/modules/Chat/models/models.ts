import {EThreadMessageType, EThreadSubjectRole, EThreadType, IFileInfo} from "./thread";
import {IMessageDTO, IThreadDTO} from "./api.models";
import {UserProfileModel} from "@app/models/auth/auth.models";
import {MessageSendingStatus} from "../enums/message-sending-status";
import {JsUtil} from "../../../utils/jsUtil";

export interface IMessage extends IMessageDTO {
    sendingState: MessageSendingStatus;
}

export function createIMessage(content: string, files: IFileInfo[] = [], user: UserProfileModel): IMessage {
    return {
        files: files,
        unread: false,
        id: JsUtil.generateGUID(),
        threadId: null,
        content: content,
        fromType: EThreadSubjectRole.User,
        type: EThreadMessageType.Text,
        fromId: 'string;',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sendingState: MessageSendingStatus.Pending,
        creator: {
            avatarId: '',
            id: user.id,
            userName: user.userName
        }
    };
}

export function convertToIMessage(dto: IMessageDTO, sendingState = MessageSendingStatus.Succeeded): IMessage {
    return {
        ...dto,
        sendingState: sendingState
    };
}

export interface IThreadVM extends IThreadDTO {
    lastMessage: IMessage;
    unreadMessagesCount: number;
}
