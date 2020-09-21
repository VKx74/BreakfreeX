import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {forkJoin, Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {BrokerService, IBrokerServiceState} from "@app/services/broker.service";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {ApplicationType} from "@app/enums/ApplicationType";
import {catchError, map, switchMap, tap} from "rxjs/operators";
import {IdentityService} from "@app/services/auth/identity.service";
import {BrokerStorage} from "@app/services/broker.storage";
import {TranslateService} from "@ngx-translate/core";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {ThemeService} from "@app/services/theme.service";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";

@Injectable()
export class AppDataResolver implements Resolve<any> {
    constructor(private _brokerService: BrokerService,
                private _appTypeService: ApplicationTypeService,
                private _brokerStorage: BrokerStorage,
                private _translateService: TranslateService,
                private _themeService: ThemeService,
                private _userSettings: UserSettingsService,
                private _userSettingsService: UserSettingsService,
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
                ),
            this._userSettingsService.getSettings()
                .pipe(
                    catchError(() => {
                        return this._userSettingsService.defaultSettings();
                    }),
                    tap((settings) => this._userSettings.applySettings(settings))
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
        if (brokerState) {
            return this._brokerService.loadState(brokerState);
        }

        return of(false);
    }
}
