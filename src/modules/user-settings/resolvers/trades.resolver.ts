import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable, of} from "rxjs";
import {ICryptoTrade} from "../../Trading/models/crypto/crypto.models";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {BrokerService} from "@app/services/broker.service";

@Injectable()
export class TradesResolver implements Resolve<ICryptoTrade[]> {
    constructor(private _brokerService: BrokerService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICryptoTrade[]> {
        const broker = this._brokerService.activeBroker;

        return broker ? (this._brokerService.activeBroker as CryptoBroker).getTrades({}) : of([]);
    }
}
