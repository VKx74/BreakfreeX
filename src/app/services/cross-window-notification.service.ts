import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {WindowNotificationEnum} from "../enums/WindowNotificationEnum";
import {WindowsManager} from "./windows-manager";
import {IWindowConfig} from "../models/window-config";
import {JsUtil} from "../../utils/jsUtil";

export interface WindowNotification {
    type: WindowNotificationEnum;
    data?: any;
    initiator?: string;
    isBroadcast?: boolean;
}

@Injectable()
export class CrossWindowNotificationService {
    onMessage$ = new Subject<WindowNotification>();

    constructor(private _windowsManager: WindowsManager) {
        this._subscribe();
    }

    private _subscribe() {
        window.addEventListener("message", (e) => {
            const notification: WindowNotification = e.data;
            const isNotificationValid = notification.initiator && notification.initiator.length;

            if (isNotificationValid) {
                if (notification.initiator !== this._windowsManager.windowId) {
                    this.onMessage$.next(notification);
                }

                if (notification.isBroadcast) {
                    this.sendMessageToChildWindows(notification);
                }
            }
        });
    }

    sendMessage(data: WindowNotification, injectId: boolean = true) {
        if (injectId) {
            data.initiator = this._windowsManager.windowId;
        }

        const rootWindow = this._getRootWindow();
        const isRootWindow = rootWindow === window;

        if (isRootWindow) {
            this.sendMessageToChildWindows(data);
        } else {
            this.sendMessageToRootWindow(data);
        }
    }

    sendMessageToChildWindows(data: WindowNotification) {
        for (const childWindow of this._windowsManager.childWindows) {
            this._sendMessage(data, childWindow);
        }
    }

    sendMessageToRootWindow(data: WindowNotification) {
        this._sendMessage(data, this._getRootWindow());
    }

    sendMessageToWindow(data: WindowNotification, targetWindow: any) {
        this._sendMessage(data, targetWindow);
    }

    /* TODO: Add reject behaviour */
    sendRequest(notification: WindowNotification, targetWindow): Promise<WindowNotification> {
        return new Promise((resolve, reject) => {
            const messageId = JsUtil.generateGUID();

            notification.data.messageId = messageId;
            this.sendMessageToWindow(notification, targetWindow);

            const subscription = this.onMessage$.subscribe((respNotification: WindowNotification) => {
                const responseMessageId = respNotification.data.messageId;

                if (responseMessageId != null && responseMessageId === messageId) {
                    subscription.unsubscribe();
                    resolve(respNotification);
                }
            });
        });
    }

    private _sendMessage(notification: WindowNotification, targetWindow) {
        const data = JSON.parse(JSON.stringify(notification));
        targetWindow.postMessage(data, '*');
    }

    private _getRootWindow(): Window {
        const getParentWindow = (_window) => {
            if (!this._isSubWindow(_window)) {
                return _window;
            }

            return getParentWindow(_window.opener);
        };

        return getParentWindow(window);
    }

    private _isSubWindow(_window: Window): boolean {
        const windowConfig: IWindowConfig = (_window as any).windowConfig;
        return windowConfig && windowConfig.isSubWindow;
    }
}
