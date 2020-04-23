import {EThreadType} from "../models/thread";
import {ChatMode} from "../enums/chat-mode";

export const needHandleActionByThreadType = (threadType: EThreadType, chatMode: ChatMode): boolean => {
    if (chatMode === ChatMode.PublicThreads) {
        return threadType === EThreadType.Public;
    }

    if (chatMode === ChatMode.PrivateThreads) {
        return threadType === EThreadType.Group || threadType === EThreadType.Private;
    }

    return false;
};
