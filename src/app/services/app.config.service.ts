import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ApiUrls, AppConfig, ServicesHealthCheckUrls} from "../models/app-config";
import {catchError, tap} from "rxjs/operators";
import {Observable, of, throwError} from "rxjs";
import {AuthInterceptorSkipHeader} from "./auth/constants";

export const CONFIG_PATH = './config/config.json';

@Injectable()
export class AppConfigService {
    static config: AppConfig = null;

    static get apiUrls(): ApiUrls {
        return AppConfigService.config.apiUrls;
    }

    static get servicesHealthCheckUrls(): ServicesHealthCheckUrls {
        return AppConfigService.config.servicesHealthCheckUrls;
    }

    constructor(private _httpClient: HttpClient) {
    }

    loadConfig(): Observable<any> {
        if (AppConfigService.config) {
            return of(AppConfigService.config);
        }

        return this._httpClient.get(this._getConfigPath(), {headers: {[AuthInterceptorSkipHeader]: ''}})
            .pipe(
                tap((config: AppConfig) => {
                    AppConfigService.config = config;
                }),
                catchError((e) => {
                    console.error('Failed to load app config');
                    console.error(e);

                    return throwError(e);
                })
            );
    }

    private _getConfigPath(): string {
        return CONFIG_PATH;
    }
}
