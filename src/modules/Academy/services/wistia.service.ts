import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { Content, MediaData, MediaDetails } from '../models/dto';

@Injectable()
export class WistiaService {
    private apiUrl: string;
    private generalUrl: string;
    private key: string;

    constructor(private _http: HttpClient) {
        this.apiUrl = "https://api.wistia.com/v1/";
        this.generalUrl = "https://fast.wistia.net/embed/";
        this.key = "08c9bb06a2647ffe6af66de3fdca0440902b0dd089abf2e519a84bbc72cb9fed";
    }

    getContentByProject(project: string): Observable<Content[]> {
        return this._http.get<Content[]>(`${this.apiUrl}medias.json?access_token=${this.key}&project_id=${project}&sort_by=name`);
    }

    getVideoDetails(id: string): Observable<MediaDetails> {
        return this._http.get<MediaData>(`${this.generalUrl}batch_media_data?basic=true&episode_data=true&media_hashed_ids=${id}`).pipe(map(_ => {
            if (!_ || !_.medias)
            {
                return null;
            }

            return _.medias[id];
        }));
    }
}