import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { Injectable } from "@angular/core";
import { BrokerService, IBrokerServiceState } from "@app/services/broker.service";
import { catchError, switchMap, tap } from "rxjs/operators";
import { BrokerStorage } from "@app/services/broker.storage";
import { UserSettingsService } from "@app/services/user-settings/user-settings.service";

@Injectable()
export class AppDataResolver implements Resolve<any> {
    constructor(private _brokerService: BrokerService,
        private _brokerStorage: BrokerStorage,
        private _userSettings: UserSettingsService,
        private _userSettingsService: UserSettingsService) {
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
                ),
            this._userSettingsService.getSettings()
                .pipe(
                    catchError(() => {
                        return this._userSettingsService.defaultSettings();
                    }),
                    tap((settings) => this._userSettings.applySettings(settings))
                )
        ];

        return forkJoin(obsList);
    }

    private _initializeBroker(): Observable<any> {
        return this._brokerService.initialize().pipe(switchMap(() => {
            let brokerState: IBrokerServiceState = this._brokerStorage.getBrokerState();
            if (brokerState) {
                return this._brokerService.loadState(brokerState);
            }
    
            return of(false);
        }));
    }
}
