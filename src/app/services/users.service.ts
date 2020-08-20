import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {
    ResetPasswordBySupportModel,
    UpdateUserModel,
    UserModel
} from "../models/auth/auth.models";
import {AppConfigService} from "./app.config.service";
import { IPaginationResponse, PaginationParams, PaginationResponse } from '@app/models/pagination.model';
import { QueryParamsConstructor } from 'modules/Admin/data/models';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private _httpOptions = {
        withCredentials: true
    };

    constructor(private _http: HttpClient) {
    }

    public activateUser(user: UserModel): Observable<any> {
        return this._http.patch(`${AppConfigService.config.apiUrls.identityUrl}User/activate/${user.id}`, null, this._httpOptions);
    }

    public deactivateUser(user: UserModel): Observable<any> {
        return this._http.patch(`${AppConfigService.config.apiUrls.identityUrl}User/deactivate/${user.id}`, null, this._httpOptions);
    }


    public deleteUser(id: string): Observable<any> {
        return this._http.delete(`${AppConfigService.config.apiUrls.identityUrl}User/${id}`, this._httpOptions);
    }


    public getUsers(paginationParams = new PaginationParams(0, 50), filtrationParams = {}): Observable<IPaginationResponse<UserModel>> {
        return this._http.get(`${AppConfigService.config.apiUrls.identityUrl}User`, {
            params: QueryParamsConstructor.fromObjects(paginationParams.toSkipTake(), filtrationParams), withCredentials: true
        }).pipe(
            map((r: any) => {
                return new PaginationResponse(r.data, r.count);
            })
        );
    }

    public getUser(id: string): Observable<UserModel> {
        return this._http.get<UserModel>(`${AppConfigService.config.apiUrls.identityUrl}User/${id}`, this._httpOptions);
    }

    public getUserByIds(ids: string[]): Observable<UserModel[]> {
        let params = new HttpParams();

        for (let id of ids) {
            params = params.append('ids', id);
        }

        const httpOptions = {
            withCredentials: true,
            params: params
        };

        return this._http.get<UserModel[]>(`${AppConfigService.config.apiUrls.identityUrl}User/ids`, httpOptions);
    }

    public disable2FactorAuth(email: string): Observable<any> {
        return this._http.post<any>(`${AppConfigService.config.apiUrls.identityUrl}2fa/support/disable`, {email: email},  this._httpOptions);
    } 
    
    public confirmUserEmail(user_id: string): Observable<any> {
        return this._http.post<any>(`${AppConfigService.config.apiUrls.identityUrl}User/ApproveEmail`, {user_id: user_id},  this._httpOptions);
    }

    public refreshPassword(resetPasswordModel: ResetPasswordBySupportModel): Observable<any> {
        return this._http.patch<any>(`${AppConfigService.config.apiUrls.identityUrl}Profile/password/support/change`, resetPasswordModel,  this._httpOptions);
    }

    public resetPassword(user: UserModel): Observable<any> {
        return this._http.patch(`${AppConfigService.config.apiUrls.identityUrl}User/ResetPassword/${user.id}`, null, this._httpOptions);
    }

    public updateUser(user: UpdateUserModel): Observable<UserModel> {
        return this._http.put<UserModel>(`${AppConfigService.config.apiUrls.identityUrl}User`, user, this._httpOptions);
    }

}