import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {QueryParamsConstructor} from "../data/models";
import { IAccountInfoResponse, IAddEndDateDepositAdminRequest, IAddFlexibleDepositAdminRequest, IAddRedeemRequest, IDepositResponse, IEditDepositRequest, IEditEndDateDepositRequest, IEditWithdrawRequest, IEndDateDepositResponse, IForgotPasswordResponse, IRedeemResponse, ITransferLogResponse, IUserWalletResponse, IWithdrawResponse } from 'modules/Companion/models/models';

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

    getEndDateDepositsFilteredList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IEndDateDepositResponse>> {
        return this._http.get<IPaginationResponse<IEndDateDepositResponse>>(`${this.USER_TRACKER_URL}end-date-deposits-filtered`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getWithdrawsFilteredList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IWithdrawResponse>> {
        return this._http.get<IPaginationResponse<IWithdrawResponse>>(`${this.USER_TRACKER_URL}withdraws-filtered`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getRedeemsFilteredList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IRedeemResponse>> {
        return this._http.get<IPaginationResponse<IRedeemResponse>>(`${this.USER_TRACKER_URL}redeems`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getWalletDetailsList(id: string): Observable<IUserWalletResponse> {
        return this._http.get<IUserWalletResponse>(`${this.USER_TRACKER_URL}wallet?address=${id}`);
    }

    editDeposit(data: IEditDepositRequest): Observable<IDepositResponse> {
        return this._http.patch<IDepositResponse>(`${this.USER_TRACKER_URL}flexible-deposit`, data);
    }

    editEndDateDeposit(data: IEditEndDateDepositRequest): Observable<IEndDateDepositResponse> {
        return this._http.patch<IEndDateDepositResponse>(`${this.USER_TRACKER_URL}end-date-deposit`, data);
    }

    editWithdraw(data: IEditWithdrawRequest): Observable<IWithdrawResponse> {
        return this._http.patch<IDepositResponse>(`${this.USER_TRACKER_URL}flexible-withdraw`, data);
    }  

    deleteDeposit(wallet: string, id: number): Observable<IDepositResponse> {
        return this._http.delete<IDepositResponse>(`${this.USER_TRACKER_URL}flexible-deposit?address=${wallet}&id=${id}`);
    }

    deleteWithdraw(wallet: string, id: number): Observable<IWithdrawResponse> {
        return this._http.delete<IDepositResponse>(`${this.USER_TRACKER_URL}flexible-withdraw?address=${wallet}&id=${id}`);
    }

    getBalances(userAccount: string): Observable<IAccountInfoResponse> {
        return this._http.get<IAccountInfoResponse>(`${this.USER_TRACKER_URL}balances?userAccount=${userAccount}`);
    }

    addRedeem(data: IAddRedeemRequest): Observable<IRedeemResponse> {
        return this._http.post<IRedeemResponse>(`${this.USER_TRACKER_URL}redeems`, data);
    }

    getForgotPasswordFilteredList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IForgotPasswordResponse>> {
        return this._http.get<IPaginationResponse<IForgotPasswordResponse>>(`${this.USER_TRACKER_URL}forgot-pin`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    deleteForgotPassword(address: string, id: number): Observable<IForgotPasswordResponse> {
        return this._http.delete<IForgotPasswordResponse>(`${this.USER_TRACKER_URL}forgot-pin?address=${address}&id=${id}`);
    }

    getTransferLogsFilteredList(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<ITransferLogResponse>> {
        return this._http.get<IPaginationResponse<ITransferLogResponse>>(`${this.USER_TRACKER_URL}transfer-logs`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    addFlexibleDeposit(data: IAddFlexibleDepositAdminRequest): Observable<IDepositResponse> {
        return this._http.post<IDepositResponse>(`${this.USER_TRACKER_URL}flexible-deposit`, data);
    }

    addEndDateDeposit(data: IAddEndDateDepositAdminRequest): Observable<IEndDateDepositResponse> {
        return this._http.post<IEndDateDepositResponse>(`${this.USER_TRACKER_URL}end-date-deposit`, data);
    }

}
