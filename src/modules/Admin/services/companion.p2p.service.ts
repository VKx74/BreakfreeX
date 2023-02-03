import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "@app/services/app.config.service";
import { PaginationParams, IPaginationResponse } from "@app/models/pagination.model";
import { QueryParamsConstructor } from "../data/models";
import { IP2PAdResponse, IP2PUserKYCResponse, IP2PUserResponse, IP2POrderResponse, P2PUserReviewResponse, IP2PChangeOrderRequest, IP2PChangeAdRequest } from 'modules/Companion/models/models';

@Injectable({
    providedIn: 'root'
})
export class CompanionP2PService {
    readonly USER_TRACKER_URL = `${AppConfigService.config.apiUrls.companionP2P}`;

    constructor(private _http: HttpClient) {
    }

    getP2PAccounts(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2PUserResponse>> {
        return this._http.get<IPaginationResponse<IP2PUserResponse>>(`${this.USER_TRACKER_URL}p2p-users`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PAccountsKYCAwaited(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2PUserResponse>> {
        return this._http.get<IPaginationResponse<IP2PUserResponse>>(`${this.USER_TRACKER_URL}p2p-kyc-awaited-users`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PAds(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2PAdResponse>> {
        return this._http.get<IPaginationResponse<IP2PAdResponse>>(`${this.USER_TRACKER_URL}p2p-ads`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PAdsHistory(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2PAdResponse>> {
        return this._http.get<IPaginationResponse<IP2PAdResponse>>(`${this.USER_TRACKER_URL}p2p-ads-history`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PUserAds(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2PAdResponse>> {
        return this._http.get<IPaginationResponse<IP2PAdResponse>>(`${this.USER_TRACKER_URL}p2p-user-ads`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PUserAdsHistory(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2PAdResponse>> {
        return this._http.get<IPaginationResponse<IP2PAdResponse>>(`${this.USER_TRACKER_URL}p2p-user-historical-ads`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PAdOrders(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2POrderResponse>> {
        return this._http.get<IPaginationResponse<IP2POrderResponse>>(`${this.USER_TRACKER_URL}p2p-ad-orders`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PDisputeOrders(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2POrderResponse>> {
        return this._http.get<IPaginationResponse<IP2POrderResponse>>(`${this.USER_TRACKER_URL}p2p-user-dispute-orders`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PUserOrders(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2POrderResponse>> {
        return this._http.get<IPaginationResponse<IP2POrderResponse>>(`${this.USER_TRACKER_URL}p2p-user-orders`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PUserHistoricalOrders(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<IP2POrderResponse>> {
        return this._http.get<IPaginationResponse<IP2POrderResponse>>(`${this.USER_TRACKER_URL}p2p-user-historical-orders`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PUserReview(params = new PaginationParams(), filtrationParams?: object): Observable<IPaginationResponse<P2PUserReviewResponse>> {
        return this._http.get<IPaginationResponse<P2PUserReviewResponse>>(`${this.USER_TRACKER_URL}p2p-user-review`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        });
    }

    getP2PAccountInfo(wallet: string): Observable<IP2PUserResponse> {
        return this._http.get<IP2PUserResponse>(`${this.USER_TRACKER_URL}p2p-user?address=${wallet}`);
    }

    getP2PAccountKYCDocs(wallet: string): Observable<string[]> {
        return this._http.get<string[]>(`${this.USER_TRACKER_URL}p2p-user-kyc-doc?address=${wallet}`);
    }

    approveKyc(id: number, comment: string): Observable<IP2PUserKYCResponse> {
        return this._http.post<IP2PUserKYCResponse>(`${this.USER_TRACKER_URL}p2p-approve-kyc`, {
            id: id,
            comment: comment
        });
    }

    rejectKyc(id: number, comment: string): Observable<IP2PUserKYCResponse> {
        return this._http.post<IP2PUserKYCResponse>(`${this.USER_TRACKER_URL}p2p-reject-kyc`, {
            id: id,
            comment: comment
        });
    }
    
    changeOrder(data: IP2PChangeOrderRequest): Observable<IP2POrderResponse> {
        return this._http.post<IP2POrderResponse>(`${this.USER_TRACKER_URL}p2p-change-order`, data);
    }

    changeAd(data: IP2PChangeAdRequest): Observable<IP2PAdResponse> {
        return this._http.post<IP2PAdResponse>(`${this.USER_TRACKER_URL}p2p-change-ad`, data);
    }

    deleteOrder(id: number): Observable<IP2POrderResponse> {
        return this._http.delete<IP2POrderResponse>(`${this.USER_TRACKER_URL}p2p-delete-order?id=${id}`);
    }

    deleteAd(id: number): Observable<IP2PAdResponse> {
        return this._http.delete<IP2PAdResponse>(`${this.USER_TRACKER_URL}p2p-delete-ad?id=${id}`);
    }
}
