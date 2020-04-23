import {Action, createAction, props} from "@ngrx/store";
import {EThreadType, IFileInfo} from "../models/thread";
import {IThreadDTO} from "../models/api.models";
import {IMessage} from "../models/models";
import {UserProfileModel} from "@app/models/auth/auth.models";
import {IChatMessagesState} from "./reducers/messages.reducer";
import {ChatMode} from "../enums/chat-mode";

export interface IMessageRemovedActionPayload {
    messageId: string;
    threadId: string;
    lastThreadMessage: IMessage;
}

export const CreateChatInstance = createAction('[Chat] Create chat instance',
    props<{ id: string, chatMode: ChatMode }>()
);

export const DestroyChatInstance = createAction('[Chat] Destroy chat instance',
    props<{ id: string }>()
);

export const LoadChatInitialData = createAction('[Chat] Load chat initial data',
    props<{ chatInstanceKey: string, chatMode: ChatMode }>()
);

export const LoadChatInitialDataSuccess = createAction('[Chat] Load chat initial data success',
    props<{
        threads: IThreadDTO[],
        messages: IMessage[],
        chatInstanceKey: string
    }>()
);

export const LoadChatInitialDataFailed = createAction('[Chat] Load chat initial data failed',
    props<{ error: any; chatInstanceKey: string }>()
);

export const LoadThreadMessages = createAction('[Chat] Load thread messages',
    props<{ threadId: string, chatInstanceKey: string }>()
);

export const LoadThreadMessagesSuccess = createAction('[Chat] Load thread messages success',
    props<{
        messages: IMessage[],
        threadId: string,
        chatInstanceKey: string
    }>()
);

export const LoadThreadMessagesFailed = createAction('[Chat] Load thread messages failed',
    props<{
        error: any;
        chatInstanceKey: string
    }>()
);

export const SendMessageRequest = createAction('[Chat] Send Message request',
    props<{ message: IMessage, chatInstanceKey: string }>()
);

export const SendMessageRequestSuccess = createAction('[Chat] Send Message request success',
    props<{ thread: IThreadDTO, message: IMessage, localMessageId: string }>()
);

export const SendMessageRequestFailed = createAction('[Chat] Send Message request failed',
    props<{ threadId: string, messageId: string, error: any, chatInstanceKey: string }>()
);

export const AddMessages = createAction('[Chat] Add messages',
    props<{ messages: IMessage[], chatInstanceKey: string }>()
);

export const UpdateMessageRequest = createAction('[Chat] Update message',
    props<{ threadId: string, messageId: string, content: string, files: IFileInfo[], chatInstanceKey: string }>()
);

export const UpdateMessageRequestSuccess = createAction('[Chat] Update message success',
    props<{ messageId: string, message: IMessage }>()
);

export const UpdateMessageRequestFailed = createAction('[Chat] Update message failed',
    props<{ messageId: string, error: any, chatInstanceKey: string }>()
);

export const UpdateMessages = createAction('[Chat] Update messages',
    props<{ updates: { messageId: string, threadId: string, message: IMessage }[], chatInstanceKey: string }>()
);

export const RemoveMessages = createAction('[Chat] Remove messages',
    props<{ data: { threadId: string, messageId: string }[], chatInstanceKey: string }>()
);

export const RemoveMessageRequest = createAction('[Chat] Remove message request',
    props<{ messageId: string, threadId: string, chatInstanceKey: string }>()
);

export const RemoveMessageRequestSuccess = createAction('[Chat] Remove message request success',
    props<IMessageRemovedActionPayload>()
);

export const RemoveMessageRequestFailed = createAction('[Chat] Remove message request failed',
    props<{ messageId: string, error: any, chatInstanceKey: string }>()
);

export const CreateThreadRequest = createAction('[Chat] Create thread request',
    props<{ threadName: string, description: string, photo: File, chatInstanceKey: string, chatMode: ChatMode }>()
);

export const CreateThreadRequestSuccess = createAction('[Chat] Create thread success',
    props<{ thread: IThreadDTO }>()
);

export const CreateThreadRequestFailed = createAction('[Chat] Create thread failed',
    props<{ error: any, chatInstanceKey: string }>()
);

export const ThreadCreated = createAction('[Chat] Thread created',
    props<{ thread: IThreadDTO, lastMessage?: IMessage }>()
);

export const UpdateThreadRequest = createAction('[Chat] Update thread request',
    props<{ threadId: string, threadType: EThreadType, threadName: string, description: string, photo: File, chatInstanceKey: string }>()
);

export const UpdateThreadRequestSuccess = createAction('[Chat] Update thread request success',
    props<{ threadId: string, threadType: EThreadType, name: string, description?: string, photoId?: string }>()
);

export const UpdateThreadRequestFailed = createAction('[Chat] Update thread request failed',
    props<{ error: any, threadId: string, chatInstanceKey: string }>()
);

export const ThreadUpdated = createAction('[Chat] Thread updated',
    props<{ thread: IThreadDTO }>()
);

export const ThreadRemoved = createAction('[Chat] Thread removed',
    props<{ threadId: string }>()
);

export const SelectThread = createAction('[Chat] Select thread',
    props<{ threadId: string, prevThreadId: string, chatInstanceKey: string }>()
);

export const RemoteMessageReceived = createAction('[Chat] Remote message received',
    props<{ message: IMessage, thread: IThreadDTO, isMessageSentByCurrentUser: boolean, localMessageId: string }>()
);

export const RemoteMessageRemoved = createAction('[Chat] Remote message removed',
    props<{ messageId: string, threadId: string, lastThreadMessage?: IMessage }>()
);

export const RemoteMessageEdited = createAction('[Chat] Remote message edited',
    props<{ messageId: string, threadId: string, content: string, files: IFileInfo[] }>()
);

export const SortThreads = createAction('[Chat] Sort Threads',
    props<{ messagesState: IChatMessagesState, chatInstanceKey: string }>()
);

export const MarkMessagesAsRead = createAction('[Chat] Mark messages as read',
    props<{ threadId: string, messagesIds?: string[] }>()
);

export const LoadMoreMessagesRequest = createAction('[Chat] Load more messages request',
    props<{ threadId: string, messageId: string, count: number, chatInstanceKey: string }>()
);

export const LoadMoreMessagesRequestSuccess = createAction('[Chat] Load more messages request success',
    props<{ threadId: string, messages: IMessage[], moreMessagesEnabled: boolean, chatInstanceKey: string }>()
);

export const LoadMoreMessagesRequestFailed = createAction('[Chat] Load more messages request failed',
    props<{ threadId: string, error: any, chatInstanceKey: string }>()
);

export const SearchThreadsRequest = createAction('[Chat] Search threads request',
    props<{ query: string, chatInstanceKey: string, chatMode: ChatMode }>()
);

export const SearchThreadsRequestSuccess = createAction('[Chat] Search threads request success',
    props<{ query: string, threads: IThreadDTO[], messages: IMessage[], chatInstanceKey: string }>()
);

export const SearchThreadsRequestFailed = createAction('[Chat] Search threads request failed',
    props<{ query: string, error: any, chatInstanceKey: string }>()
);

export const CancelThreadsSearch = createAction('[Chat] Cancel threads search', props<{ chatInstanceKey: string }>());
export const CancelThreadsSearchCleanup = createAction('[Chat] Cancel threads search cleanup',
    props<{ threadsToRemove: string[], chatInstanceKey: string }>()
);


export const ResendMessageRequest = createAction('[Chat] Resend message request',
    props<{ messageId: string, threadId: string, content: string, files: IFileInfo[], chatInstanceKey: string }>()
);

export const ResendMessageRequestSuccess = createAction('[Chat] Resend message request success',
    props<{ thread: IThreadDTO, message: IMessage, localMessageId: string }>()
);

export const ResendMessageRequestFailed = createAction('[Chat] Resend message request failed',
    props<{ threadId: string, messageId: string, error: any, chatInstanceKey: string }>()
);

export const UserBannedInThread = createAction('[Chat] User banned in thread',
    props<{ threadId: string }>()
);

export const UserUnbannedInThread = createAction('[Chat] User unbanned in thread',
    props<{ threadId: string }>()
);

export const UserRemovedFromThread = createAction('[Chat] User removed from thread',
    props<{ threadId: string }>()
);

export const AddUsersEntities = createAction('[Chat] Add users entities',
    props<{ users: UserProfileModel[] }>()
);

export const ThreadRestored = createAction('[Chat] Thread restored',
    props<{ thread: IThreadDTO, lastMessage?: IMessage }>()
);

export const LoadMoreThreadsRequest = createAction('[Chat] Load more threads request',
    props<{ lastThreadId?: string, skip?: number, chatMode: ChatMode, chatInstanceKey: string }>()
);

export const LoadMoreThreadsRequestSuccess = createAction('[Chat] Load more threads request success',
    props<{ threads: IThreadDTO[], messages: IMessage[], moreThreadsEnabled: boolean, chatInstanceKey: string }>()
);

export const LoadMoreThreadsRequestFailed = createAction('[Chat] Load more threads request failed',
    props<{ error: any, chatInstanceKey: string }>()
);

export const ThreadLastMessageChanged = createAction('[Chat] Thread last message changed',
    props<{ thread: IThreadDTO, message?: IMessage }>()
);

export const CurrentUserLeavedThread = createAction('[Chat] Current user leaved thread',
    props<{ threadId: string}>()
);
