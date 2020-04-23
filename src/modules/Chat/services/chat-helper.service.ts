import {Injectable} from "@angular/core";
import {select, Store} from "@ngrx/store";
import {IChatThreadsState} from "../store/reducers/threads.reducer";
import {ObservableUtils} from "../../../utils/observable.utils";
import {
    commonStateSelector, messagesEntitiesSelector,
    messagesStateSelector, searchedThreadsSelector,
    selectedThreadIdSelector, selectedThreadSelector, threadMessagesSelector, threadsSelector,
    threadsStateSelector
} from "../store/selectors";
import {IChatMessagesState} from "../store/reducers/messages.reducer";
import {UserProfileModel} from "@app/models/auth/auth.models";
import {ChatApiService} from "./chat.api.service";
import {Observable, of} from "rxjs";
import {createIMessage, convertToIMessage, IMessage} from "../models/models";
import {flatMap, map} from "rxjs/operators";
import {IThreadDTO, IMessageDTO} from "../models/api.models";
import {IChatCommonState} from "../store/reducers/common.reducer";
import {IChatState, State} from "../store/reducers";
import {Dictionary} from "@ngrx/entity";
import {UsersProfileService} from "@app/services/users-profile.service";
import {IFileInfo} from "../models/thread";
import {IdentityService} from "@app/services/auth/identity.service";

@Injectable()
export class ChatHelperService {
    constructor(private _store: Store<State>,
                private _chatApiService: ChatApiService,
                private _usersProfileService: UsersProfileService,
                private _identityService: IdentityService) {
    }

    getCurrentUserInfo(): UserProfileModel {
        return {
            id: this._identityService.id,
            userName: this._identityService.preferredUsername,
            firstName: this._identityService.firstName,
            lastName: this._identityService.lastName,
            role: this._identityService.role,
            avatarId: '',
        };
    }

    getCommonState(chatInstanceKey: string): IChatCommonState {
        return ObservableUtils.instant(this._store.pipe(select(commonStateSelector(), {chatInstanceKey})));
    }

    getThreadsState(chatInstanceKey: string): IChatThreadsState {
        return ObservableUtils.instant(this._store.pipe(select(threadsStateSelector(), {chatInstanceKey})));
    }

    getMessagesState(chatInstanceKey: string): IChatMessagesState {
        return ObservableUtils.instant(this._store.pipe(select(messagesStateSelector(), {chatInstanceKey})));
    }

    getAllLoadedThreadsIds(chatInstanceKey: string): string[] {
        return this.getThreadsState(chatInstanceKey).allThreads.ids as string[];
    }

    getAllLoadedThreadsEntitiesFromChats(): Dictionary<IThreadDTO> {
        const state: State = ObservableUtils.instant(this._store);

        return Object.keys(state.chats)
            .reduce((acc, chatInstanceStateKey: string) => {
                const threadEntities = state.chats[chatInstanceStateKey].threads.allThreads.entities;
                return {...acc, ...threadEntities};

            }, {} as Dictionary<IThreadDTO>);
    }

    getThreadEnitity(threadId: string): IThreadDTO {
        return this.getAllLoadedThreadsEntitiesFromChats()[threadId];
    }

    getAllChatsStates(): Dictionary<IChatState> {
        const state: State = ObservableUtils.instant(this._store);
        return state.chats;
    }

    getAllChatsKeys(): string[] {
        return Object.keys(this.getAllChatsStates());
    }

    selectedThreadSelector(chatInstanceKey: string): Observable<IThreadDTO> {
        return this._store.pipe(select(selectedThreadSelector(), {chatInstanceKey}));
    }

    selectedThreadIdSelector(chatInstanceKey: string): Observable<string> {
        return this._store.pipe(select(selectedThreadIdSelector(), {chatInstanceKey}));
    }

    threadsSelector(chatInstanceKey: string): Observable<IThreadDTO[]> {
        return this._store.pipe(select(threadsSelector(), {chatInstanceKey}));
    }

    searchedThreadsSelector(chatInstanceKey: string): Observable<IThreadDTO[]> {
        return this._store.pipe(select(searchedThreadsSelector(), {chatInstanceKey}));
    }

    selectedThreadMessagesSelector(chatInstanceKey: string): Observable<IMessage[]> {
        return this._store.pipe(select(threadMessagesSelector(), {chatInstanceKey}));
    }

    isMessageInStore(id: string, chatInstanceKey: string): boolean {
        const messagesState = this.getMessagesState(chatInstanceKey);

        return Object.keys(messagesState.messagesToThread).reduce((acc, threadId) => {
            return {
                ...acc,
                ...messagesState.messagesToThread[threadId].entities
            };
        }, {})[id] != null;
    }

    getThreadLastMessage(threadId: string): Observable<IMessage> {
        return this._chatApiService.getThreadMessagesList(threadId)
            .pipe(
                map((resp) => resp.items),
                flatMap((threads: IMessageDTO[]) => {
                    if (threads && threads.length) {
                        return this.convertToIMessage(threads[0]);
                    }

                    return of(null);
                })
            );
    }

    getMessagesEntities(chatInstanceKey: string): Dictionary<IMessage> {
        return ObservableUtils.instant(this._store.select(messagesEntitiesSelector(), {chatInstanceKey}));
    }

    createCurrentUserMessage(content: string, files: IFileInfo[] = []): IMessage {
        return createIMessage(content, files, this.getCurrentUserInfo());
    }

    convertToIMessage(message: IMessageDTO): Observable<IMessage> {
        return of(convertToIMessage(message));
    }

    convertToIMessages(messages: IMessageDTO[]): Observable<IMessage[]> {
        return of(messages.map((m) => {
            return convertToIMessage(m);
        }));
    }
}
