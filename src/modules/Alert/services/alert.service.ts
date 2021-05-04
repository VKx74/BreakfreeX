import {Observable, of} from "rxjs";

export enum AlertType {
    Error = "Error",
    Success = "Success",
    Warning = "Warning",
    Info = "Info"
}

export interface AlertServiceConfig {
    getTitle?: (type: AlertType) => Observable<string>;
}

export const DefaultAlertServiceConfig: AlertServiceConfig = {
    getTitle: (type: AlertType) => {
        const _map = {
            [AlertType.Error]: "Error",
            [AlertType.Success]: "Success",
            [AlertType.Warning]: "Warning",
            [AlertType.Info]: "Info"
        };

        return of(_map[type]);
    }
};

export abstract class AlertService {
    protected _config: AlertServiceConfig;

    abstract async success(message: Observable<string> | string, title?: string | Observable<string>, time?: number, callback?: () => void);

    abstract async info(message: Observable<string> | string, title?: string | Observable<string>, time?: number, callback?: () => void);

    abstract async warning(message: Observable<string> | string, title?: string | Observable<string>, time?: number, callback?: () => void);

    abstract async error(message: Observable<string> | string, title?: string | Observable<string>, time?: number, callback?: () => void);

    getTitle(type: AlertType): Observable<string> {
        return this._config.getTitle(type);
    }
}
