import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {forkJoin, Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {BrokerService, IBrokerServiceState} from "@app/services/broker.service";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {ApplicationType} from "@app/enums/ApplicationType";
import {map, switchMap} from "rxjs/operators";
import {IdentityService} from "@app/services/auth/identity.service";
import {BrokerStorage} from "@app/services/broker.storage";
import {TranslateService} from "@ngx-translate/core";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";

@Injectable()
export class DashboardResolver implements Resolve<any> {
    constructor(private _brokerService: BrokerService,
                private _appTypeService: ApplicationTypeService,
                private _brokerStorage: BrokerStorage,
                private _identityService: IdentityService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const obsList: Observable<any>[] = [
            this._initializeBroker()
                .pipe(
                    switchMap(state => {
                        if (state && state.result) {
                            this._brokerService.setBrokerInitializationState(true);
                        } else {
                            this._brokerService.setBrokerInitializationState(false);
                        }
                        return of(true);
                    })
                )
        ];


        if (this._appTypeService.applicationType === ApplicationType.Crypto) {
            const activeBroker = this._brokerService.activeBroker as CryptoBroker;
            if (activeBroker) {
                obsList.push(activeBroker.getWallets());
            }
        }

        return forkJoin(obsList);
    }

    private _initializeBroker(): Observable<any> {
        let brokerState: IBrokerServiceState = this._brokerStorage.getBrokerState();
        if (brokerState && brokerState.activeBrokerState) {
            return this._brokerService.loadState(brokerState);
        }

        return of(false);
    }
}
