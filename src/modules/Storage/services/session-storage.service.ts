import {Injectable} from "@angular/core";
import {DataStorage} from "./data-storage";
import {JsUtil} from "../../../utils/jsUtil";

@Injectable()
export class SessionStorageService extends DataStorage {
    set(key: string, data: any): boolean {
        if (!this.canSave) {
            return false;
        }

        try {            
            if (JsUtil.isObject(data)) {
                data = JSON.stringify(data);
            }

            sessionStorage.setItem(key, data);
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
            const data: string = sessionStorage.getItem(key);

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
            sessionStorage.removeItem(key);
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
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => sessionStorage.removeItem(key));
            return true;
        } catch (e) {
            return false;
        }
    }
}
