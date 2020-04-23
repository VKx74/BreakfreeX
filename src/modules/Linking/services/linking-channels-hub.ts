import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {LinkingMessage} from "../models";

export interface Linking {
    subject: Subject<LinkingMessage>;
    subscribersCount: number;
}

export const DisabledChannel = 'disabled';

@Injectable()
export class LinkingMessagesBus {
    private _linkings: {[linkingId: string]: Linking} = {};

    subscribeToLinkingMessages(linkingId: string): Subject<LinkingMessage> {
        if (this._linkings[linkingId]) {
            this._linkings[linkingId].subscribersCount++;
            return this._linkings[linkingId].subject;
        }
        this._linkings[linkingId] = {
            subject: new Subject(),
            subscribersCount: 1
        };
        return this._linkings[linkingId].subject;
    }

    sendLinkingMessage(message: LinkingMessage, linkingId: string) {
        if (this._linkings[linkingId]) {
            this._linkings[linkingId].subject.next(message);
        }
    }

    unsubscribeFromLinkingMessages(channelId: string) {
        this._linkings[channelId].subscribersCount--;
        if (this._linkings[channelId].subscribersCount === 0) {
            this._linkings[channelId].subject.unsubscribe();
            delete this._linkings[channelId];
        }
    }
}