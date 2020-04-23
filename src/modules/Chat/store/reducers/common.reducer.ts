import {
    CurrentUserLeavedThread, LoadChatInitialDataSuccess,
    SelectThread, ThreadRemoved, UserRemovedFromThread
} from "../actions";
import {createReducer, on} from "@ngrx/store";

export interface IChatCommonState {
    selectedThreadId: string;
}

export const DefaultCommonChatState = {
    selectedThreadId: null
};

export const reducer = createReducer<IChatCommonState>(
    DefaultCommonChatState,
    on(LoadChatInitialDataSuccess,
        (state, action: ReturnType<typeof LoadChatInitialDataSuccess>) => {
            return {
                ...state,
                selectedThreadId: action.threads.length ? action.threads[0].id : null,
            };
        }),
    on(SelectThread,
        (state, action: ReturnType<typeof SelectThread>) => {
            return {
                ...state,
                selectedThreadId: action.threadId
            };
        }
    ),
    on(UserRemovedFromThread,
        ThreadRemoved,
        CurrentUserLeavedThread,
        (state, {threadId}) => {
            return {
                ...state,
                selectedThreadId: state.selectedThreadId === threadId ? null : state.selectedThreadId
            };
        }
    )
);
