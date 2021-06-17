import {Injectable} from "@angular/core";
import {DataStorage} from "./data-storage";
import {JsUtil} from "../../../utils/jsUtil";

@Injectable()
export class LocalStorageService extends DataStorage {
    public static IsGuestKey = "isGuest";
    public static IsSpreadAutoProcessing = "isSpreadAutoProcessing";

    set(key: string, data: any): boolean {
        if (!this.canSave) {
            return false;
        }

        try {            
            if (JsUtil.isObject(data)) {
                data = JSON.stringify(data);
            }

            localStorage.setItem(key, data);
            return true;
        } catch (e) {
            return false;
        }
    }

    get(key: string): any {
        if (!this.canSave) {
            return false;
        }

        try {            
            const data: string = localStorage.getItem(key);

            if (data) {
                try {                  
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    remove(key: string): boolean {
        if (!this.canSave) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    clear(): boolean {
        if (!this.canSave) {
            return false;
        }

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            return false;
        }
    }

    setGuest() {
        this.set(LocalStorageService.IsGuestKey, true);
    }

    isGuest() {
        return !!(this.get(LocalStorageService.IsGuestKey));
    }

    trunkGuest() {
        return this.remove(LocalStorageService.IsGuestKey);
    }
}
