import {IMessage} from "../../models/models";
import {Action, ActionReducer, createReducer, on} from "@ngrx/store";
import {
    AddMessages,
    CancelThreadsSearchCleanup,
    CreateThreadRequestSuccess,
    LoadMoreMessagesRequestSuccess,
    LoadChatInitialDataSuccess,
    LoadThreadMessagesSuccess,
    RemoteMessageEdited,
    RemoteMessageReceived,
    RemoteMessageRemoved,
    RemoveMessageRequestSuccess,
    RemoveMessages,
    ResendMessageRequestSuccess,
    SearchThreadsRequestSuccess,
    SendMessageRequest,
    SendMessageRequestFailed,
    SendMessageRequestSuccess,
    ThreadCreated,
    ThreadRemoved,
    UpdateMessages,
    UserRemovedFromThread,
    ThreadRestored,
    LoadMoreThreadsRequestSuccess,
    ThreadLastMessageChanged,
    CurrentUserLeavedThread, UpdateMessageRequestSuccess
} from "../actions";
import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {MessageSendingStatus} from "../../enums/message-sending-status";
import {ChatMode} from "../../enums/chat-mode";
import {needHandleActionByThreadType} from "../../functions/helpers";


export function selectMessageId(message: IMessage): string {
    return message.id;
}

const sortComparer = (m1: IMessage, m2: IMessage): number => {
    return new Date(m1.createdAt).getTime() > new Date(m2.createdAt).getTime()
        ? 1
        : -1;
};

const adapter: EntityAdapter<IMessage> = createEntityAdapter<IMessage>({
    selectId: selectMessageId,
    sortComparer: sortComparer
});

export interface IChatMessagesState {
    messagesToThread: {
        [threadId: string]: EntityState<IMessage>;
    };
}

export const DefaultChatMessagesState = {
    messagesToThread: {}
};

function addMessages(messages: IMessage[], state: IChatMessagesState): IChatMessagesState {
    return messages.reduce((acc, m) => {
        if (!acc.messagesToThread[m.threadId]) {
            acc.messagesToThread = {...acc.messagesToThread, [m.threadId]: adapter.getInitialState()};
            // acc.messagesToThread[m.threadId] = adapter.getInitialState();
        }

        acc.messagesToThread = {
            ...acc.messagesToThread,
            [m.threadId]: adapter.upsertOne(m, acc.messagesToThread[m.threadId])
        };

        return acc;
    }, {...state});
}

function updateMessages(data: { messageId: string, threadId: string, message: IMessage }[], state: IChatMessagesState): IChatMessagesState {
    return data.reduce((acc: IChatMessagesState, d) => {
        if (acc.messagesToThread[d.threadId]) {
            acc.messagesToThread = {
                ...acc.messagesToThread,
                [d.threadId]: adapter.updateOne({
                    id: d.messageId,
                    changes: d.message
                }, acc.messagesToThread[d.threadId])
            };
        }

        return acc;

    }, Object.assign({}, state) as IChatMessagesState);
}

function removeMessages(data: { messageId: string, threadId: string }[], state: IChatMessagesState): IChatMessagesState {
    return data.reduce((acc, d) => {
        if (acc.messagesToThread[d.threadId]) {
            acc.messagesToThread = {
                ...acc.messagesToThread,
                [d.threadId]: adapter.removeOne(d.messageId, acc.messagesToThread[d.threadId])
            };
        }

        return acc;
    }, Object.assign({}, state));
}

export const reducerFactory = (chatMode: ChatMode): ActionReducer<IChatMessagesState, Action> => {
    return createReducer<IChatMessagesState>(
        DefaultChatMessagesState,
        on(AddMessages,
            (state, {messages}) => {
                return addMessages(messages, state);
            }
        ),
        on(RemoveMessages,
            (state, {data}) => {
                return removeMessages(data, state);
            }
        ),
        on(UpdateMessages,
            (state, {updates}) => {
                return updateMessages(updates, state);
            }
        ),
        on(LoadChatInitialDataSuccess,
            LoadMoreMessagesRequestSuccess,
            (state, {messages}) => {
                return addMessages(messages, state);
            }
        ),
        on(LoadThreadMessagesSuccess,
            LoadMoreThreadsRequestSuccess,
            (state, {messages}) => {
                return addMessages(messages, state);
            }
        ),
        on(RemoveMessageRequestSuccess,
            (state, {messageId, threadId, lastThreadMessage}) => {
                const updatedState = removeMessages([{messageId, threadId}], state);

                if (!lastThreadMessage) {
                    return updatedState;
                } else {
                    return addMessages([lastThreadMessage], updatedState);
                }
            }),
        on(RemoteMessageReceived,
            (state, {message, thread, localMessageId}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                if (localMessageId != null && state.messagesToThread[message.threadId]
                    && state.messagesToThread[message.threadId].entities[localMessageId]) { // message sent by user
                    return updateMessages([{
                        threadId: message.threadId,
                        messageId: localMessageId,
                        message: message
                    }], state);
                }

                if (state.messagesToThread[message.threadId] && state.messagesToThread[message.threadId].entities[message.id]) {
                    return state;
                }

                return addMessages([message], state);
            }),

        on(SendMessageRequest,
            (state, {message}) => {
                return addMessages([message], state);
            }
        ),

        on(SendMessageRequestFailed,
            (state, {messageId, threadId}) => {
                const message = state.messagesToThread[threadId] && state.messagesToThread[threadId].entities[messageId];

                if (!message) {
                    return state;
                }

                return updateMessages([{
                    messageId: messageId,
                    threadId: threadId,
                    message: {
                        ...message,
                        sendingState: MessageSendingStatus.Failed
                    }
                }], state);
            }
        ),

        on(SendMessageRequestSuccess,
            ResendMessageRequestSuccess,
            (state, {message, thread, localMessageId}) => {
                if (state.messagesToThread[thread.id]) {

                    if (state.messagesToThread[thread.id].entities[localMessageId]) {
                        return updateMessages([{
                            message: message,
                            messageId: localMessageId,
                            threadId: thread.id
                        }], state);
                    } else {
                        return addMessages([message], state);
                    }
                }

                return state;
            }
        ),
        on(RemoteMessageRemoved,
            (state, {messageId, threadId, lastThreadMessage}) => {
                const updatedState = removeMessages([{messageId, threadId}], state);

                if (!lastThreadMessage) {
                    return updatedState;
                } else {
                    return addMessages([lastThreadMessage], updatedState);
                }
            }
        ),
        on(RemoteMessageEdited,
            (state, data) => {
                if (state.messagesToThread[data.threadId] && state.messagesToThread[data.threadId].entities[data.messageId]) {
                    return updateMessages([{
                        threadId: data.threadId,
                        message: Object.assign({}, state.messagesToThread[data.threadId].entities[data.messageId], {
                            content: data.content,
                            files: data.files
                        } as Partial<IMessage>),
                        messageId: data.messageId
                    }], state);
                }

                return state;
            }
        ),
        on(CreateThreadRequestSuccess,
            (state, {thread}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                return {
                    ...state,
                    messagesToThread: {
                        ...state.messagesToThread,
                        ...{
                            [thread.id]: adapter.getInitialState()
                        }
                    }
                };
            }
        ),
        on(ThreadCreated,
            ThreadRestored,
            (state, {thread, lastMessage}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                if (!state.messagesToThread[thread.id]) {
                    let threadMessages = adapter.getInitialState();

                    if (lastMessage) {
                        threadMessages = adapter.addOne(lastMessage, threadMessages);
                    }

                    return {
                        ...state,
                        messagesToThread: {
                            ...state.messagesToThread,
                            [thread.id]: threadMessages
                        }
                    };
                }

                if (lastMessage) {
                    return addMessages([lastMessage], state);
                }

                return state;
            }
        ),
        on(ThreadRemoved,
            CurrentUserLeavedThread,
            (state, {threadId}) => {
                if (!state.messagesToThread[threadId]) {
                    return state;
                }

                const messagesToThreads = Object.assign({}, state.messagesToThread);
                delete messagesToThreads[threadId];

                return {
                    ...state,
                    messagesToThread: messagesToThreads
                };
            }
        ),
        on(SearchThreadsRequestSuccess,
            (state, {messages}) => {
                if (!messages) {
                    return state;
                }

                const messagesToThreads = messages.reduce((acc, m) => {
                    if (!acc[m.threadId]) {
                        acc[m.threadId] = adapter.getInitialState();
                    }

                    acc[m.threadId] = adapter.upsertOne(m, acc[m.threadId]);

                    return acc;
                }, Object.assign({}, state.messagesToThread));

                return {
                    ...state,
                    messagesToThread: messagesToThreads
                };
            }
        ),
        on(CancelThreadsSearchCleanup,
            (state, {threadsToRemove}) => {
                const messagesToThreads = threadsToRemove.reduce((acc, id) => {
                    delete acc[id];

                    return acc;
                }, Object.assign({}, state.messagesToThread));

                return {
                    ...state,
                    messagesToThread: messagesToThreads
                };
            }
        ),
        on(UserRemovedFromThread,
            (state, {threadId}) => {
                const messagesToThread = {...state.messagesToThread};

                delete messagesToThread[threadId];

                return {
                    ...state,
                    messagesToThread: messagesToThread
                };
            }
        ),
        on(ThreadLastMessageChanged,
            (state, {thread, message}) => {
                if (!message) { // message removed
                    const messagesToThreads = Object.assign({}, state.messagesToThread);

                    if (messagesToThreads[thread.id]) {
                        delete messagesToThreads[thread.id];
                    }

                    return {
                        ...state,
                        messagesToThread: messagesToThreads
                    };
                }

                if (state.messagesToThread[thread.id]) {
                    return {
                        ...state,
                        messagesToThread: {
                            ...state.messagesToThread,
                            [thread.id]: adapter.upsertOne(message, state.messagesToThread[thread.id])
                        }
                    };
                }

                return state;
            }
        ),
        on(UpdateMessageRequestSuccess,
            (state, {message}) => {
                if (!state.messagesToThread[message.threadId]) {
                    return state;
                }

                return {
                    ...state,
                    messagesToThread: {
                        ...state.messagesToThread,
                        [message.threadId]: adapter.updateOne({
                            id: message.id,
                            changes: message
                        }, state.messagesToThread[message.threadId])
                    }
                };
            }
        )
    );
};
