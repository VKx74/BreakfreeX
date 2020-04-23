import {Injectable} from "@angular/core";

@Injectable()
export class UiHelperService {
    getStorageKeyPreffix(userId?: string): string {
        return userId == null
            ? `crypto-trader_`
            : `crypto-trader-${userId}_`;
    }
}
