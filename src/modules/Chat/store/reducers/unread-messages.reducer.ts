import {
    MarkMessagesAsRead,
    RemoteMessageReceived, RemoteMessageRemoved
} from "../actions";
import {ActionReducer, createReducer, on} from "@ngrx/store";
import {ChatMode} from "../../enums/chat-mode";
import {needHandleActionByThreadType} from "../../functions/helpers";
import {JsUtil} from "../../../../utils/jsUtil";

export interface IChatUnreadMessagesState {
    [threadId: string]: {
        [messageId: string]: boolean;
    };
}

export const DefaultChatUnreadMessagesState = {};

export const reducerFactory = (chatMode: ChatMode): ActionReducer<IChatUnreadMessagesState> => {
    return createReducer<IChatUnreadMessagesState>(
        DefaultChatUnreadMessagesState,
        on(RemoteMessageReceived,
            (state, {message, isMessageSentByCurrentUser, thread}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                if (isMessageSentByCurrentUser) {
                    return state;
                }

                if (state[message.threadId]) {
                    return {
                        ...state,
                        [message.threadId]: {
                            ...state[message.threadId],
                            [message.id]: true
                        }
                    };
                } else {
                    return {
                        ...state,
                        [message.threadId]: {
                            [message.id]: true
                        }
                    };
                }
            }
        ),
        on(RemoteMessageRemoved,
            (state, {messageId, threadId}) => {
                if (state[threadId]) {
                    return {
                        ...state,
                        [threadId]: JsUtil.removeObjectProperty(state[threadId], messageId)
                    };
                }

                return state;
            }
        ),
        on(
            MarkMessagesAsRead,
            (state, {threadId, messagesIds}) => {
                const updatedState = {...state};

                if (updatedState[threadId]) {
                    if (!messagesIds) {
                        delete updatedState[threadId];
                    } else {
                        updatedState[threadId] = messagesIds.reduce((acc, messageId) => {
                            delete acc[messageId];

                            return acc;
                        }, Object.assign({}, updatedState[threadId]));
                    }
                }

                return updatedState;
            }
        )
    );
};
