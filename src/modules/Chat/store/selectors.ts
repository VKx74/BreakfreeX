import {createSelector} from "@ngrx/store";
import {IChatsState, IChatState, State} from './reducers';
import {IChatThreadsState} from "./reducers/threads.reducer";
import {IChatCommonState} from "./reducers/common.reducer";
import {IChatMessagesState} from "./reducers/messages.reducer";
import {IMessage, IThreadVM} from "../models/models";
import {IChatUnreadMessagesState} from "./reducers/unread-messages.reducer";
import {IThreadDTO} from "../models/api.models";

export const chatsStateSelector = createSelector(
    (state: State) => state.chats,
    (state: IChatsState) => state
);

export const chatStateSelector = () => {
    return createSelector(
        chatsStateSelector,
        (state: IChatsState, {chatInstanceKey}) => {
            return state[chatInstanceKey];
        }
    );
};

export const threadsStateSelector = () => {
    return createSelector(
        chatStateSelector(),
        (state: IChatState) => {
            return state.threads;
        }
    );
};

export const commonStateSelector = () => {
    return createSelector(
        chatStateSelector(),
        (state: IChatState) => {
            return state.common;
        }
    );
};

export const selectedThreadIdSelector = () => {
    return createSelector(
        commonStateSelector(),
        (state: IChatCommonState) => {
            return state.selectedThreadId;
        }
    );
};

export const selectedThreadSelector = () => {
    return createSelector(
        threadsStateSelector(),
        selectedThreadIdSelector(),
        (state: IChatThreadsState, selectedThreadId: string) => {
            if (selectedThreadId == null) {
                return undefined;
            }

            return state.allThreads.entities[selectedThreadId];
        }
    );
};

export const messagesStateSelector = () => {
    return createSelector(
        chatStateSelector(),
        (state: IChatState) => {
            return state.messages;
        }
    );
};

export const messagesEntitiesSelector = () => {
    return createSelector(
        messagesStateSelector(),
        (state: IChatMessagesState) => {
            return Object.keys(state.messagesToThread).reduce((acc, threadId) => {
                acc = {...acc, ...state.messagesToThread[threadId].entities};

                return acc;
            }, {} as { [messageId: string]: IMessage });
        }
    );
};

export const unreadMessagesStateSelector = () => {
    return createSelector(
        chatStateSelector(),
        (state: IChatState) => {
            return state.unreadMessages;
        }
    );
};

export const threadMessagesSelector = () => {
    return createSelector(
        selectedThreadSelector(),
        messagesStateSelector(),
        (selectedThread: IThreadDTO, messagesState: IChatMessagesState) => {
            if (!selectedThread) {
                return [];
            }

            if (selectedThread.isBanned) {
                return [];
            }

            const threadMessages = messagesState.messagesToThread[selectedThread.id];

            if (!threadMessages || threadMessages.ids.length === 0) {
                return [];
            }

            return (threadMessages.ids as string[]).map((id) => {
                return threadMessages.entities[id];
            });
        }
    );
};

export const threadsSelector = () => {
    return createSelector(
        threadsStateSelector(),
        messagesStateSelector(),
        unreadMessagesStateSelector(),
        (threadsState: IChatThreadsState,
         messagesState: IChatMessagesState,
         unreadMessagesState: IChatUnreadMessagesState) => {


            return (threadsState.threads as string[]).map((threadId: string) => {
                const threadMessagesIds = messagesState.messagesToThread[threadId] && messagesState.messagesToThread[threadId].ids;
                const lastMessageId = threadMessagesIds && threadMessagesIds.length ? threadMessagesIds[threadMessagesIds.length - 1] : null;
                const lastMessage = lastMessageId != null ? messagesState.messagesToThread[threadId].entities[lastMessageId] : null;

                return {
                    ...threadsState.allThreads.entities[threadId],
                    lastMessage: lastMessage,
                    unreadMessagesCount: unreadMessagesState[threadId]
                        ? Object.keys(unreadMessagesState[threadId]).length
                        : 0
                } as IThreadVM;
            });
        }
    );
};

export const searchedThreadsSelector = () => {
    return createSelector(
        threadsStateSelector(),
        messagesStateSelector(),
        unreadMessagesStateSelector(),
        (threadsState: IChatThreadsState,
         messagesState: IChatMessagesState,
         unreadMessagesState: IChatUnreadMessagesState) => {
            if (!threadsState.searchedThreads) {
                return null;
            }

            return (threadsState.searchedThreads as string[]).map((threadId: string) => {
                const threadMessagesIds = messagesState.messagesToThread[threadId] && messagesState.messagesToThread[threadId].ids;
                const lastMessageId = threadMessagesIds && threadMessagesIds.length ? threadMessagesIds[threadMessagesIds.length - 1] : null;
                const lastMessage = lastMessageId != null ? messagesState.messagesToThread[threadId].entities[lastMessageId] : null;

                return {
                    ...threadsState.allThreads.entities[threadId],
                    lastMessage: lastMessage,
                    unreadMessagesCount: unreadMessagesState[threadId]
                        ? Object.keys(unreadMessagesState[threadId]).length
                        : 0
                } as IThreadVM;
            });
        }
    );
};

export const totalUnreadMessagesCount = () => {
    return createSelector(
        unreadMessagesStateSelector(),
        (state: IChatUnreadMessagesState) => {
            return Object.keys(state).reduce((acc, threadId: string) => {
                return acc + Object.keys(state[threadId]).length;
            }, 0);
        }
    );
};
