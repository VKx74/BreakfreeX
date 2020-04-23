import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfigService } from "app/services/app.config.service";
import { ComplexHistoryDto } from './common';
import { Observable } from 'rxjs';

@Injectable()
export class ComplexHistoryService {

    constructor(private http: HttpClient) { }

    getData(symbol: string,
        count: number,
        granularities: Array<Number>): Observable<ComplexHistoryDto> {

        const params = new HttpParams()
            .append('count', count.toString())
            .append('symbol', symbol)
            .append('granularities', granularities.join(','));

        let url = `${AppConfigService.config.apiUrls.coinigyREST}history/complex`;
        return this.http.get<ComplexHistoryDto>(url, { params });
    }
}