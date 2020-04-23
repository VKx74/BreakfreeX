import {IThreadDTO} from "../../models/api.models";
import {
    CancelThreadsSearchCleanup,
    CreateThreadRequestSuccess,
    LoadChatInitialDataSuccess,
    ThreadCreated,
    ThreadRemoved,
    ThreadUpdated,
    RemoteMessageReceived,
    SearchThreadsRequestSuccess,
    SortThreads,
    UserBannedInThread,
    UserUnbannedInThread,
    UserRemovedFromThread,
    SendMessageRequestSuccess,
    ResendMessageRequestSuccess,
    ThreadRestored,
    LoadMoreThreadsRequestSuccess,
    UpdateThreadRequestSuccess,
    CurrentUserLeavedThread,
} from "../actions";
import {ActionReducer, createReducer, on} from "@ngrx/store";
import {createEntityAdapter, EntityAdapter, EntityState} from "@ngrx/entity";
import {JsUtil} from "../../../../utils/jsUtil";
import {ChatMode} from "../../enums/chat-mode";
import {needHandleActionByThreadType} from "../../functions/helpers";

export function selectThreadId(thread: IThreadDTO): string {
    return thread.id;
}

const adapter: EntityAdapter<IThreadDTO> = createEntityAdapter<IThreadDTO>({
    selectId: selectThreadId
});


export interface IChatThreadsState {
    allThreads: EntityState<IThreadDTO>;
    threads: string[];
    searchedThreads: string[];
}

export const DefaultThreadsState: IChatThreadsState = {
    allThreads: adapter.getInitialState(),
    threads: [],
    searchedThreads: null
};

export const reducerFactory = (chatMode: ChatMode): ActionReducer<IChatThreadsState> => {
    return createReducer<IChatThreadsState>(
        DefaultThreadsState,
        on(LoadChatInitialDataSuccess,
            (state, data) => {

                return {
                    ...state,
                    allThreads: adapter.addMany(data.threads, state.allThreads),
                    threads: data.threads.map(t => t.id)
                };
            }
        ),
        on(RemoteMessageReceived,
            (state, {thread}) => {
                if (!thread || !needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                return {
                    ...state,
                    allThreads: adapter.addOne(thread, state.allThreads),
                    threads: JsUtil.arrayOfUniques([].concat(...state.threads, thread.id) as string[])
                };
            }
        ),
        on(CreateThreadRequestSuccess,
            (state, {thread}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                return {
                    ...state,
                    allThreads: adapter.upsertOne(thread, state.allThreads),
                    threads: JsUtil.arrayOfUniques([].concat(...state.threads, thread.id) as string[])
                };
            }
        ),
        on(SortThreads,
            (state, {messagesState}) => {
                function getLastMessageDate(threadId: string): Date {
                    if (!messagesState.messagesToThread[threadId] || messagesState.messagesToThread[threadId].ids.length === 0) {
                        return null;
                    }

                    const lastMessageId = messagesState.messagesToThread[threadId].ids[messagesState.messagesToThread[threadId].ids.length - 1];

                    return new Date(messagesState.messagesToThread[threadId].entities[lastMessageId].updatedAt);
                }

                return {
                    ...state,
                    threads: state.threads.slice()
                        .sort((id1, id2) => {
                            const lastMessageDate1 = getLastMessageDate(id1);
                            const lastMessageDate2 = getLastMessageDate(id2);

                            return (lastMessageDate1 || new Date(state.allThreads.entities[id1].updatedAt)).getTime()
                            > (lastMessageDate2 || new Date(state.allThreads.entities[id2].updatedAt)).getTime()
                                ? -1
                                : 1;
                        })
                };
            }
        ),
        on(ThreadCreated,
            ThreadRestored,
            (state, {thread}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                return {
                    ...state,
                    allThreads: adapter.upsertOne(thread, state.allThreads),
                    threads: JsUtil.arrayOfUniques([].concat(...state.threads, thread.id))
                };
            }
        ),
        on(ThreadRemoved,
            CurrentUserLeavedThread,
            (state, {threadId}) => {
                return {
                    ...state,
                    allThreads: adapter.removeOne(threadId, state.allThreads),
                    threads: state.threads.filter(t => t !== threadId),
                    searchedThreads: state.searchedThreads
                        ? state.searchedThreads.filter(t => t !== threadId)
                        : state.searchedThreads
                };
            }
        ),
        on(ThreadUpdated,
            (state, {thread}) => {
                if (!state.allThreads.entities[thread.id]) {
                    return state;
                }

                return {
                    ...state,
                    allThreads: adapter.updateOne({
                        id: thread.id,
                        changes: thread
                    }, state.allThreads)
                };
            }
        ),
        on(SearchThreadsRequestSuccess,
            (state, {threads}) => {
                return {
                    ...state,
                    allThreads: adapter.upsertMany(threads, state.allThreads),
                    searchedThreads: threads.map(t => t.id)
                };
            }
        ),
        on(CancelThreadsSearchCleanup,
            (state, {threadsToRemove}) => {
                return {
                    ...state,
                    allThreads: adapter.removeMany(threadsToRemove, state.allThreads),
                    searchedThreads: null
                };
            }
        ),
        on(UserBannedInThread,
            (state, {threadId}) => {
                return {
                    ...state,
                    allThreads: adapter.updateOne({
                        id: threadId,
                        changes: {
                            isBanned: true
                        }
                    }, state.allThreads)
                };
            }
        ),
        on(UserUnbannedInThread,
            (state, {threadId}) => {
                return {
                    ...state,
                    allThreads: adapter.updateOne({
                        id: threadId,
                        changes: {
                            isBanned: false
                        }
                    }, state.allThreads)
                };
            }
        ),
        on(UserRemovedFromThread,
            (state, {threadId}) => {
                return {
                    ...state,
                    allThreads: adapter.removeOne(threadId, state.allThreads),
                    threads: state.threads ? state.threads.filter(id => id !== threadId) : state.threads,
                    searchedThreads: state.searchedThreads ? state.searchedThreads.filter(id => id !== threadId) : state.searchedThreads
                };
            }
        ),
        on(SendMessageRequestSuccess,
            ResendMessageRequestSuccess,
            (state, {thread}) => {
                if (!needHandleActionByThreadType(thread.type, chatMode)) {
                    return state;
                }

                return {
                    ...state,
                    allThreads: adapter.upsertOne(thread, state.allThreads),
                    threads: state.threads ? JsUtil.arrayOfUniques([...state.threads, thread.id]) : state.threads
                };
            }
        ),
        on(LoadMoreThreadsRequestSuccess,
            (state, {threads}) => {
                return {
                    ...state,
                    allThreads: adapter.upsertMany(threads, state.allThreads),
                    threads: state.threads ? JsUtil.arrayOfUniques([...state.threads, ...threads.map(t => t.id)]) : state.threads
                };
            }
        ),
        on(UpdateThreadRequestSuccess,
            (state, {threadId, threadType, name, description, photoId}) => {
                if (!needHandleActionByThreadType(threadType, chatMode)) {
                    return state;
                }

                const thread = state.allThreads.entities[threadId];

                if (!thread) {
                    return state;
                }

                return {
                    ...state,
                    allThreads: adapter.updateOne({
                        id: threadId,
                        changes: {
                            name,
                            description,
                            pictureId: photoId ? photoId : thread.pictureId
                        }
                    }, state.allThreads)
                };
            }
        )
    );
};
