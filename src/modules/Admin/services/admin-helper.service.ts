import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {BlockchainStatus} from "@app/models/exchange/models";

@Injectable()
export class AdminHelperService {
    getBlockchainStatusStr(status: BlockchainStatus): Observable<string> {
        return status === BlockchainStatus.active
            ? of('Active')
            : of('Disabled');
    }
}