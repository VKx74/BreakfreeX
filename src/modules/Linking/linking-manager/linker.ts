import {Subject, Subscription} from "rxjs";
import {JsUtil} from "../../../utils/jsUtil";
import {LinkingMessagesBus} from "../services/linking-channels-hub";
import {LinkingAction, LinkingMessage} from '../models/models';

export const Colors = [
    '#098BB8',
    '#1A998A',
    '#EF2C35',
    '#DE8408',
    '#5B3E84',
    '#DCB0D1',
    '#A8A135',
    '#74D3C1'
];

export class Linker {
    id: string = JsUtil.generateGUID();

    private _onAction$ = new Subject<LinkingAction>();
    private _onMessageSubscription: Subscription;
    private _showLinkerTab: boolean = true;
    private _linkingId: string;

    get linkingId(): string {
        return this._linkingId;
    }

    linkingChange$ = new Subject<string>();

    get disabled(): boolean {
        return this._linkingId === null;
    }

    get showLinkerTab(): boolean {
        return this._showLinkerTab;
    }

    set showLinkerTab(value: boolean) {
        this._showLinkerTab = value;
    }

    constructor(private _linkingMessagesBus: LinkingMessagesBus) {
        this.id = JsUtil.generateGUID();
    }

    setDefaultLinking(force: boolean = false) { 
        if (this._linkingId && !force) {
            return;
        }
        this.setLinking("#098BB8");
    }

    useActiveElementLinker() { 
        if (this._linkingId) {
            return;
        }
        this.setLinking("#098BB8");
    }

    getLinkingColors(): string[] { 
        return Colors;
    }

    setLinking(linkingId: string) {
        if (linkingId === this._linkingId) {
            return;
        }

        const isDisabled = this._linkingId == null;

        if (isDisabled) {
            this._setLinking(linkingId);
            this._subscribeOnLinking(linkingId);
        } else {
            this._unsubscribeFromLinking(this.linkingId);
            this._setLinking(linkingId);

            if (linkingId != null) {
                this._subscribeOnLinking(linkingId);
            }
        }
    }

    sendAction(action: LinkingAction) {
        if (this._linkingId) {
            const message: LinkingMessage = {
                action: action,
                senderId: this.id
            };

            this._linkingMessagesBus.sendLinkingMessage(message, this._linkingId);
        }
    }

    onAction(handler: (action: LinkingAction) => void) {
        this._onAction$.subscribe((action: LinkingAction) => {
            handler(action);
        });
    }

    getLinkingId(): string | null {
        return this._linkingId;
    }

    disable() {
        this.setLinking(null);
    }

    destroy() {
        this._onAction$.complete();

        if (this._onMessageSubscription) {
            this._onMessageSubscription.unsubscribe();
        }
    }

    private _setLinking(linkingId: string) {
        this._linkingId = linkingId;
        this.linkingChange$.next(linkingId);
    }

    private _unsubscribeFromLinking(linkingId: string) {
        if (this._onMessageSubscription) {
            this._onMessageSubscription.unsubscribe();
            this._onMessageSubscription = null;
            this._linkingMessagesBus.unsubscribeFromLinkingMessages(linkingId);
        }
    }

    private _subscribeOnLinking(linkingId: string) {
        this._onMessageSubscription = this._linkingMessagesBus
            .subscribeToLinkingMessages(linkingId)
            .subscribe((message: LinkingMessage) => {
                if (message.senderId !== this.id) {
                    this._onAction$.next(message.action);
                }
            });
    }
}