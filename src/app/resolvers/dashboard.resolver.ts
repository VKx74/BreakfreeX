import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";
import { BrokerService, IBrokerServiceState } from "@app/services/broker.service";
import { BrokerStorage } from "@app/services/broker.storage";

@Injectable()
export class DashboardResolver implements Resolve<any> {
    constructor(private _brokerService: BrokerService,
        private _brokerStorage: BrokerStorage) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        this._initializeBroker().subscribe(state => {
            if (state && state.result) {
                this._brokerService.setBrokerInitializationState(true);
            } else {
                this._brokerService.setBrokerInitializationState(false);
            }
        }, error => {
            this._brokerService.setBrokerInitializationState(false);
        });

        return of(true);
    }

    private _initializeBroker(): Observable<any> {
        let brokerState: IBrokerServiceState = this._brokerStorage.getBrokerState();
        if (brokerState) {
            return this._brokerService.loadState(brokerState);
        }

        return of(false);
    }
}
