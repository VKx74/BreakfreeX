import {EThreadMessageType, EThreadSubjectRole, EThreadType, IThreadInvite} from "../../../modules/Chat/models/thread";
import {IThreadDTO} from "../../../modules/Chat/models/api.models";

export enum NotificationAction {
    Thread_CreatedEvent = "realtimeThreadCreatedEvent",
    Thread_RemovedEvent = "realtimeThreadRemovedEvent",
    Thread_MessagePublishedEvent = "realtimeThreadMessagePublishedEvent",
    Thread_MessageEditEvent = "realtimeThreadMessageEditEvent",
    Thread_MessageDeletedEvent = "realtimeThreadMessageDeletedEvent",
    Thread_MutedEvent = "realtimeThreadMutedEvent",
    Thread_ParticipantJoinedEvent = "realtimeThreadParticipantJoinedEvent",
    Thread_ParticipantsJoinedEvent = "realtimeThreadParticipantsJoinedEvent",
    Thread_ParticipantLeftEvent = "realtimeThreadParticipantLeftEvent",
    Thread_ParticipantsLeftEvent = "realtimeThreadParticipantsLeftEvent",
    Thread_ParticipantsDeleteEvent = "realtimeThreadSubjectDeletedEvent",
    Thread_ParticipantUpdatedEvent = "realtimeThreadParticipantUpdatedEvent",
    Thread_TouchedEvent = "realtimeThreadTouchedEvent",
    Thread_UnmutedEvent = "realtimeThreadUnmutedEvent",
    Thread_UpdatedEvent = "realtimeThreadUpdatedEvent",
    Thread_RestoreEvent = "realtimeThreadRestoredEvent",
    Thread_MessageTouchedEvent = "realtimeThreadMessageTouchedEvent",
    Thread_MessagesCountEvent = "realtimeThreadMessagesCountEvent",
    Thread_WriteabilityChangedEvent = "realtimeThreadWriteabilityChangedEvent",
    Thread_BanCreatedEvent = "realtimeThreadBanCreatedEvent",
    Thread_BanUpdatedEvent = "realtimeThreadBanUpdatedEvent",
    Thread_BanDeletedEvent = "realtimeThreadBanDeletedEvent",
    Thread_InviteCreatedEvent = "realtimeThreadInviteCreatedEvent",
    Thread_InviteDeletedEvent = "realtimeThreadInviteDeletedEvent",
    Thread_InviteAcceptedEvent = "realtimeThreadInviteAcceptedEvent",
    Thread_InviteRejectedEvent = "realtimeThreadInviteRejectedEvent",

    // auto trading engine messages
    ATE_AlertStateMessage = "ATE.AlertStateMessage",
    ATE_AlertTriggeredMessage = "ATE.AlertTriggeredMessage",
    ATE_CancelOrderRequest = "ATE.CancelOrderRequest",
    ATE_PlaceOrderRequest = "ATE.PlaceOrderRequest",
    ATE_PlaySoundMessage = "ATE.PlaySoundMessage",
    ATE_ScriptStateMessage = "ATE.ScriptStateMessage",
    ATE_ShowPopupMessage = "ATE.ShowPopupMessage",

    BacktestFinishedMessage = 'ATE.BacktestEndMessage'
}

export enum NotificationTopics {
    Chat = "chat",
    MessageCount = "messages-count",
    PublicRooms = "public-rooms",
    UserBans = "bans",
    Invites = "invites",
}

export interface ActivationKeyResponse {
    sessionKey: string;
}

export interface NotificationMessage {
    action: NotificationAction;
    actionObject: string;
    notificationTopicName: NotificationTopics;
    notificationTopicId: string;
    notificationType: number;  // TODO enum type
    excludeUserIds: string[];
    payloadType: string;
    payload: string; // it is JSON
    parentTree: ParentTree;
    userIds: string[];
    senderId: string;
    senderMetadata: any;
}

export interface ParentTree {
    id: string;
    type: string;
    parent: any;
}

export interface NotificationPayload {
    requestId: string;
}

export interface MessagesCountPayload extends NotificationPayload {
    threadId: string;
    messagesCount: number;
}

export interface PublishMessagePayload extends NotificationPayload {
    threadMessage: PublishedMessage;
    files: MessageFileDetails[];
}

export interface PublishedMessage {
    content: string;
    createdAt: string;
    fromId: string;
    fromType: EThreadSubjectRole;
    id: string;
    threadId: string;
    type: EThreadMessageType;
    updatedAt: string;
    clientId?: string;
}

export interface MessageFileDetails {
    id: string;
    name: string;
}

export interface EditMessagePayload extends NotificationPayload {
    creatorId: string;
    messageContent: string;
    messageId: string;
    threadId: string;
    files: MessageFileDetails[];
}

export interface RemoveMessagePayload extends NotificationPayload {
    messageId: string;
    threadId: string;
    userId: string;
}

export interface UpdateThreadPayload extends NotificationPayload {
    thread: UpdatedThread;
}

export interface UpdatedThread {
    createdAt: string;
    creatorId: string;
    creatorType: boolean;
    id: string;
    isBlocked: boolean;
    isDisabled: boolean;
    name: string;
    pictureId: string;
    removed: boolean;
    type: boolean;
    updatedAt: string;
}

export interface DeleteThreadPayload extends NotificationPayload {
    threadId: string;
}

export interface BanThreadPayload extends NotificationPayload {
    threadBan: ThreadBan;
}

export interface ThreadBan {
    id: string;
    subjectId: string;
    threadId: string;
    updatedAt: string;
}

export interface PayloadThreadDto {
    id: string;
    name: string;
    description: string;
    type: EThreadType;
    creatorId: string;
    creatorType: EThreadSubjectRole;
    pictureId: string;
    isBlocked: boolean;
    isDisabled: boolean;
    removed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IThreadInvitePayload {
    threadInvite: IThreadInvite;
    thread: PayloadThreadDto;
    creator: {id: string; userName: string; avatarId?: string};
}


export interface IThreadBanCreatedNotificationPayload extends NotificationPayload {
    threadBan: {
        id: string;
        subjectId: string;
        threadId: string;
        updatedAt: string;
    };
}

export interface IThreadBanDeletedNotificationPayload extends NotificationPayload {
    threadBan: {
        id: string;
        subjectId: string;
        threadId: string;
    };
}

export interface IThreadInviteAcceptedNotificationPayload {
    threadInvite: {
        id: string;
        inviteCreatorId: string;
        threadId: string;
        subjectId: string;
    };
}

export interface IThreadCreatedNotificationPayload {
    thread: IThreadDTO;
}

export interface IThreadRemovedNotificationPayload {
    threadId: string;
}

export interface IThreadUpdatedNotificationPayload {
    thread: IThreadDTO;
}

export interface IUserRemovedFromThreadNotificationPayload {
    threadId: string;
}

export interface IThreadRestoredNotificationPayload {
    thread: IThreadDTO;
}


