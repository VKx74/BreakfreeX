import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {ExchangeUserModel} from "@app/models/exchange/models";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {QueryParamsConstructor} from "../data/models";
import {
    CollectionResponseType,
    PaginationParams,
    IPaginationResponse,
    toBasePaginationResponse
} from "@app/models/pagination.model";
import {IBaseExchangeMember, IExchangeMember} from "@app/models/exchange/exchange-members.models";


@Injectable()
export class ExchangeUsersService {
    constructor(private _http: HttpClient) {
    }

    getUsers(params = new PaginationParams(), ids?: string[]): Observable<IPaginationResponse<ExchangeUserModel>> {
        ids = ['1', '2', '3'];
        const paginationParams = params.toSkipTake();
        return this._http.get<IPaginationResponse<ExchangeUserModel>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}members`,
            {
                params: new HttpParams({
                    fromObject: {
                        skip: paginationParams.skip.toString(),
                        take: paginationParams.take.toString(),
                        id: ids || []
                    }
                })
            })
            .pipe(
                toBasePaginationResponse(CollectionResponseType.DataCount)
            );
    }

    getUser(userId: number): Observable<ExchangeUserModel> {
        return this._http.get<ExchangeUserModel>(`${AppConfigService.config.apiUrls.exchangeManagementREST}members/?id=${userId}`);
    }

    getMembers(paginationParams = new PaginationParams(), filtrationParams = {}): Observable<IPaginationResponse<IExchangeMember>> {
        return this._http.get<IPaginationResponse<IExchangeMember>>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Members`, {
            params: QueryParamsConstructor.fromObjects(paginationParams.toSkipTake(), filtrationParams)
        })
            .pipe(
                toBasePaginationResponse(CollectionResponseType.DataCount)
            );
    }

    createMember(memberModel: IBaseExchangeMember): Observable<IExchangeMember> {
        return this._http.post<IExchangeMember>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Members`, memberModel);
    }

    editMember(id: number, memberModel: IBaseExchangeMember): Observable<IExchangeMember> {
        return this._http.put<IExchangeMember>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Members/${id}`, memberModel);
    }

    deleteMember(id: number): Observable<IExchangeMember> {
        return this._http.delete<IExchangeMember>(`${AppConfigService.config.apiUrls.exchangeManagementREST}Members/${id}`);
    }
}
