import { Injectable } from '@angular/core';
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AppConfigService } from "@app/services/app.config.service";
import { QueryParamsConstructor } from "../../modules/Admin/data/models";
import {map, subscribeOn} from 'rxjs/operators';
import {IItemsTotalResponse, PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {IBaseUserModel, UserProfileModel} from "@app/models/auth/auth.models";

@Injectable({
    providedIn: 'root'
})
export class UsersProfileService {

    constructor(private _http: HttpClient) {
    }

    public getUsersProfilesByIds(userIds: string[], params = new PaginationParams()): Observable<IPaginationResponse<UserProfileModel>> {
        if (!userIds || !userIds.length) {
            return of({ items: [], total: 0 });
        }

        let queryParams = QueryParamsConstructor.fromObject({ filterItems: userIds, ...params.toOffsetLimit() });

        return this._http.get<IItemsTotalResponse<UserProfileModel>>(`${AppConfigService.config.apiUrls.userDataStoreREST}Profile/userids`, { params: queryParams });
    }

    getUsersProfileByIdsAsArray(userIds: string[]): Observable<UserProfileModel[]> {
        return this.getUsersProfilesByIds(userIds, new PaginationParams(0, 100000))
            .pipe(
                map((r) => r.items)
            );
    }


    public getAllUsersProfiles(params = new PaginationParams()): Observable<IPaginationResponse<UserProfileModel>> {
        return this._http.get<IPaginationResponse<UserProfileModel>>(`${AppConfigService.config.apiUrls.userDataStoreREST}Profile`,
            { params: QueryParamsConstructor.fromObject(params.toOffsetLimit()) });
    }

    public getUserProfileById(userId: string): Observable<UserProfileModel> {
        return this._http.get<UserProfileModel>(`${AppConfigService.config.apiUrls.userDataStoreREST}Profile/${userId}`);
    }

    public patchUserAvatar(userId: string, avatarId: string): Observable<any> {
        let data = {
            userId: userId,
            avatarId: avatarId
        };
        return this._http.patch(`${AppConfigService.config.apiUrls.userDataStoreREST}Profile/avatarId`, data);
    }

    public searchUsersProfileByUserName(userName: string, params = new PaginationParams(0, 15)): Observable<IPaginationResponse<UserProfileModel>> {
        if (!userName || !userName.length || !userName.trim().length) {
            return of({items: [], total: 0});
        }

        const paginationParams = QueryParamsConstructor.fromObjects({userNameFilter: userName}, params.toOffsetLimit());

        return this._http.get<IItemsTotalResponse<UserProfileModel>>(`${AppConfigService.config.apiUrls.userDataStoreREST}Profile/userNames/filter`, {params: paginationParams});
    }

    getUsersProfiles(ids: any[], params?: PaginationParams): Observable<IPaginationResponse<IBaseUserModel>> {
        return this.getUsersProfilesByIds(ids, params);
    }
}
