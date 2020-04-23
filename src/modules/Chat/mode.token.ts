import {InjectionToken} from "@angular/core";
import {ChatMode} from "./enums/chat-mode";

export const ChatModeToken = new InjectionToken<ChatMode>('Chat mode');
