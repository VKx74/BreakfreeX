import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from "rxjs/operators";
import { IdentityService } from '@app/services/auth/identity.service';
import { IChartTemplate } from './templates-data-provider.service';
import { AppConfigService } from '@app/services/app.config.service';

@Injectable()
export class TemplatesStorageService {

    private get _templatesURL(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}ChartTemplates`;        
    }

    constructor(private http: HttpClient,
        private _identity: IdentityService) { }

    public allTemplates(): Observable<IChartTemplate[]> {
        if (this._identity.isGuestMode) {
            return of([]);
        }

        return this.http.get<IChartTemplate[]>(`${this._templatesURL}/all`)
            .pipe(map((data: any) => {
                return data.map((value: any) => {
                    return {
                        id: value.templateId,
                        name: value.name,
                        state: JSON.parse(value.data)
                    } as IChartTemplate;
                });
            }));
    }

    public saveTemplate(template: IChartTemplate): Observable<any> {
        if (this._identity.isGuestMode) {
            return of({});
        }

        let postData = {
            TemplateId: template.id,
            Name: template.name,
            Data: template.state,
        };

        return this.http.post<IChartTemplate>(this._templatesURL, postData);
    }

    public editTemplate(id: string | number, name: string): Observable<any> {
        if (this._identity.isGuestMode) {
            return of({});
        }

        let patchData = {
            Id: id,
            PropertyName: "Name",
            NewValue: name
        };

        return this.http.patch(this._templatesURL, patchData);
    }

    public removeTemplate(id: string): Observable<any> {
        if (this._identity.isGuestMode) {
            return of({});
        }

        let params = new HttpParams();
        params = params.append("id", id);
        return this.http.delete(this._templatesURL, { params: params });
    }
}