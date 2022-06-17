import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../data/models";
import { IAccountInfoResponse, IDepositResponse, IEditDepositRequest, IEditWithdrawRequest, IUserWalletResponse, IWithdrawResponse } from 'modules/Companion/models/models';

@Injectable({
    providedIn: 'root'
})
export class CompanionUserTrackerService {
    readonly USER_TRACKER_URL = `${AppConfigService.config.apiUrls.companionUserTracker}`;

    constructor(private _http: HttpClient) {
    }

    getWalletsList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IUserWalletResponse>> {
        return this._http.get<IPaginationResponse<IUserWalletResponse>>(`${this.USER_TRACKER_URL}wallets`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getWalletDetailsList(id: string): Observable<IUserWalletResponse> {
        return this._http.get<IUserWalletResponse>(`${this.USER_TRACKER_URL}wallet?address=${id}`);
    }

    editDeposit(data: IEditDepositRequest): Observable<IDepositResponse> {
        return this._http.patch<IDepositResponse>(`${this.USER_TRACKER_URL}deposit`, data);
    }

    editWithdraw(data: IEditWithdrawRequest): Observable<IWithdrawResponse> {
        return this._http.patch<IDepositResponse>(`${this.USER_TRACKER_URL}withdraw`, data);
    }

    deleteDeposit(wallet: string, id: number): Observable<IDepositResponse> {
        return this._http.delete<IDepositResponse>(`${this.USER_TRACKER_URL}deposit?address=${wallet}&id=${id}`);
    }

    deleteWithdraw(wallet: string, id: number): Observable<IWithdrawResponse> {
        return this._http.delete<IDepositResponse>(`${this.USER_TRACKER_URL}withdraw?address=${wallet}&id=${id}`);
    }

    getBalances(userAccount: string): Observable<IAccountInfoResponse> {
        return this._http.get<IAccountInfoResponse>(`${this.USER_TRACKER_URL}balances?userAccount=${userAccount}`);
    }
}
