import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {flatMap, map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";

export interface IUserTag {
    id: string;
    name: string;
}

export interface ISetUserTagsParams {
    userEmail: string;
    tags: string[];
}

export interface IAttachUserTagsParams {
    userEmail: string;
    tags: string[];
}

export interface IDetachUserTagsParams {
    userEmail: string;
    tags: string[];
}


@Injectable()
export class UserTagsService {
    constructor(private _http: HttpClient) {
    }

    getTags(): Observable<IUserTag[]> {
        return this._http.get<IUserTag[]>(`${AppConfigService.config.apiUrls.identityUrl}UserTag`, {
            params: {
                limit: '100'
            },
            withCredentials: true
        });
    }

    searchTags(query: string): Observable<IUserTag[]> {
        query = query.toLowerCase();

        return this.getTags()
            .pipe(
                map((tags: IUserTag[]) => tags.filter((tag) => tag.name.toLocaleLowerCase().indexOf(query) === 0))
            );
    }

    createTag(tagName: string): Observable<IUserTag> {
        return this._http.post<IUserTag>(`${AppConfigService.config.apiUrls.identityUrl}userTag`, {
            tag: tagName
        }, {
            withCredentials: true
        });
    }

    deleteTag(id: string): Observable<any> {
        return this._http.delete<any>(`${AppConfigService.config.apiUrls.identityUrl}userTag/${id}`, {
            withCredentials: true
        });
    }

    setUserTags(params: ISetUserTagsParams): Observable<any> {
        return this._http.patch<any>(`${AppConfigService.config.apiUrls.identityUrl}userTag/set`, params, {
            withCredentials: true
        });
    }

    attachUserTags(params: IAttachUserTagsParams): Observable<any> {
        return this._http.patch<any>(`${AppConfigService.config.apiUrls.identityUrl}userTag/attach`, params, {
            withCredentials: true
        });
    }

    detachUserTags(params: IDetachUserTagsParams): Observable<any> {
        return this._http.patch<any>(`${AppConfigService.config.apiUrls.identityUrl}userTag/detach`, params, {
            withCredentials: true
        });
    }
}
