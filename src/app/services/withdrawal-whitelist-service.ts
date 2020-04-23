import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {map} from "rxjs/operators";

export interface IWithdrawalWhitelistItem {
    id: string;
    address: string;
    lable: string;
}

export interface IAddWithdrawalWhitelistItemParams {
    address: string;
    lable: string;
    pin: string;
}

export interface IGetWhitelistInfoResponseDTO {
    isEnabled: number;
    whitelist: IWithdrawalWhitelistItem[];
}

@Injectable()
export class WithdrawalWhitelistService {
    constructor(private _http: HttpClient) {
    }

    isWithdrawalWhitelistEnabled(): Observable<boolean> {
        return this._getWhitelistInfo().pipe(map((data) => data.isEnabled === 1));
    }

    setWhitelistUsageStatus(use: boolean, pin: string): Observable<any> {
        return this._http.post<IGetWhitelistInfoResponseDTO>(`${AppConfigService.config.apiUrls.exchangeUserApi}/Whitelist/status`, {
            status: use ? 1 : 0,
            pin: pin
        });
    }

    getWhitelist(): Observable<IWithdrawalWhitelistItem[]> {
        return this._getWhitelistInfo()
            .pipe(
                map((data: IGetWhitelistInfoResponseDTO) => {
                    return data.whitelist;
                })
            );
    }

    private _getWhitelistInfo(): Observable<IGetWhitelistInfoResponseDTO> {
        return this._http.get<IGetWhitelistInfoResponseDTO>(`${AppConfigService.config.apiUrls.exchangeUserApi}/Whitelist`);
    }

    addWithdrawalWhitelistItem(params: IAddWithdrawalWhitelistItemParams): Observable<IWithdrawalWhitelistItem> {
        return this._http.post<any>(`${AppConfigService.config.apiUrls.exchangeUserApi}/Whitelist/add`, {
            lable: params.lable,
            address: params.address,
            pin: params.pin
        });
    }

    removeWithdrawalWhitelistItem(id: string, pin: string): Observable<any> {
        return this._http.request('DELETE', `${AppConfigService.config.apiUrls.exchangeUserApi}/Whitelist/${id}`, {
            body: {
                pin: pin
            },
        });
    }
}
