import {IdentityService} from "@app/services/auth/identity.service";
import {Injectable} from "@angular/core";
import {IGoldenLayoutComponentState} from "angular-golden-layout";
import {LocalStorageService} from "Storage";

@Injectable()
export class LayoutStorage {
    constructor(private _identity: IdentityService,
                private _localStorage: LocalStorageService) {
    }

    getLayoutState(): IGoldenLayoutComponentState {
        return this._localStorage.get(this._getKey());
    }

    saveLayoutState(state: IGoldenLayoutComponentState, userId?: string) {
        this._localStorage.set(this._getKey(userId), state);
    }

    clear() {
        this._localStorage.remove(this._getKey());
    }

    private _getKey(userId?: string): string {
        userId = userId == null ? this._identity.id : userId;

        return `${userId}dashboard`;
    }
}
