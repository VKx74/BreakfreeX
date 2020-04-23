import {Injectable} from "@angular/core";
import {JsUtil} from "../../utils/jsUtil";

@Injectable()
export class WindowsManager {
    get parentWindow(): Window {
        return window.opener;
    }

    get isPopupWindow(): boolean {
        return this.parentWindow != null;
    }

    childWindows: Window[] = [];
    windowId: string = JsUtil.generateGUID();

    constructor() {
    }

    openWindow(url: string, name: string, params: string): Window {
        const newWindow = window.open(url, name, params);

        if (newWindow) {
            this.childWindows.push(newWindow);
        }

        return newWindow;
    }
}
