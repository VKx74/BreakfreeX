import {Action, ActionReducer, combineReducers} from "@ngrx/store";
import * as fromRoot from '@platform/store/reducers';
import * as fromMessages from './messages.reducer';
import * as fromCommon from './common.reducer';
import * as fromThreads from './threads.reducer';
import * as fromUnreadMessages from './unread-messages.reducer';
import {CreateChatInstance, DestroyChatInstance} from "../actions";
import {ChatMode} from "../../enums/chat-mode";

export interface IChatState {
    messages: fromMessages.IChatMessagesState;
    threads: fromThreads.IChatThreadsState;
    unreadMessages: fromUnreadMessages.IChatUnreadMessagesState;
    common: fromCommon.IChatCommonState;
}

export interface IChatsState {
    [chartInstanceStateKey: string]: IChatState;
}

export const DefaultChatsState: IChatsState = {};

export interface ChatInstanceAction extends Action {
    chatInstanceKey: string;
}

export interface State extends fromRoot.State {
    chats: IChatsState;
}

export const DefaultChatState: IChatState = {
    messages: fromMessages.DefaultChatMessagesState,
    threads: fromThreads.DefaultThreadsState,
    common: fromCommon.DefaultCommonChatState,
    unreadMessages: fromUnreadMessages.DefaultChatUnreadMessagesState
};

export const getChatsReducers = (chatMode: ChatMode): ActionReducer<IChatState> => {
    return combineReducers({
        messages: fromMessages.reducerFactory(chatMode),
        threads: fromThreads.reducerFactory(chatMode),
        common: fromCommon.reducer,
        unreadMessages: fromUnreadMessages.reducerFactory(chatMode)
    });
};

const chatsToReducers: { [chatId: string]: ActionReducer<IChatState> } = {};

export function reducer(state = DefaultChatsState, action: Action) {
    if (action.type === CreateChatInstance.type) {
        const id = (action as ReturnType<typeof CreateChatInstance>).id;
        const chatMode = (action as ReturnType<typeof CreateChatInstance>).chatMode;

        chatsToReducers[id] = getChatsReducers(chatMode);

        return {
            ...state,
            [id]: chatsToReducers[id](DefaultChatState, action)
        };
    }

    if (action.type === DestroyChatInstance.type) {
        const id = (action as ReturnType<typeof DestroyChatInstance>).id;
        const newState = {...state};

        delete newState[id];
        delete chatsToReducers[id];

        return newState;
    }

    if (Object.keys(state).length === 0) {
        return state;
    }

    if (Object.keys(chatsToReducers).length === 0) {
        return state;
    }

    const chatInstanceKey = (action as ChatInstanceAction).chatInstanceKey;

    if (chatInstanceKey == null) {
        return Object.keys(state)
            .reduce((acc, chatInstanceStateKey: string) => {
                acc[chatInstanceStateKey] = chatsToReducers[chatInstanceStateKey](acc[chatInstanceStateKey], action);

                return acc;
            }, {...state});
    } else {
        if (chatsToReducers[chatInstanceKey]) { // check if chat is not destroyed
            return {
                ...state,
                [chatInstanceKey]: chatsToReducers[chatInstanceKey](state[chatInstanceKey], action)
            };
        }

        return state;
    }
}
