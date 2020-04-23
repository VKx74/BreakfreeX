import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AppConfigService} from "../app.config.service";

@Injectable({
    providedIn: 'root',
})
export class RolesService {

    private _httpOptions = {
        withCredentials: true
    };

    constructor(private _http: HttpClient) {
    }

    public getRoles(): Observable<any> {
        return this._http.get(`${AppConfigService.config.apiUrls.identityUrl}Roles?take=20`, this._httpOptions);
    }
}
