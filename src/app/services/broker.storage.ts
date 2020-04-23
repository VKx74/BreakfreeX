import {Injectable} from "@angular/core";
import {IdentityService} from "@app/services/auth/identity.service";
import {LocalStorageService} from "Storage";
import {IBrokerServiceState} from "@app/services/broker.service";

@Injectable()
export class BrokerStorage {
    constructor(private _identity: IdentityService,
                private _localStorage: LocalStorageService) {
    }

    getBrokerState(): IBrokerServiceState {
        return this._localStorage.get(this._getKey());
    }

    saveBrokerState(state: IBrokerServiceState, userId?: string) {
        this._localStorage.set(this._getKey(userId), state);
    }

    clear() {
        this._localStorage.remove(this._getKey());
    }

    private _getKey(userId?: string): string {
        userId = userId == null ? this._identity.id : userId;

        return `${userId}brokerState`;
    }
}
