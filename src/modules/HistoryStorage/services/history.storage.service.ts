import {Injectable} from "@angular/core";
import {IBarData} from "../../../app/models/common/barData";
import {Observable, throwError} from "rxjs";
import {
    DeleteHistoryStorageRequestDTO,
    EUploadHistoryDateFormat,
    EUploadHistoryNameProperty,
    HistoryStorageDataDTO,
    HistoryStorageDTO,
    UploadHistoryStorageRequestDTO,
    UploadHistoryTypeBarProperty
} from "../models/history.storage.dto";
import {HttpClient, HttpParams} from "@angular/common/http";
import {IdentityService} from "../../../app/services/auth/identity.service";
import {catchError, map} from "rxjs/operators";
import {AppConfigService} from "../../../app/services/app.config.service";

interface IUploadHistoryParamsBase {
    symbol: string;
    exchange: string;
    description: string;
    name: string;
}

export interface IUploadHistoryParams extends IUploadHistoryParamsBase {
    bars: IBarData[];
}

export interface IUploadHistoryFromCSVParams extends IUploadHistoryParamsBase {
    bars: string;
}


@Injectable()
export class HistoryStorageService {

    private _defaultMapping: UploadHistoryTypeBarProperty[] = [
        {Name: EUploadHistoryNameProperty.Open, Position: 0},
        {Name: EUploadHistoryNameProperty.High, Position: 1},
        {Name: EUploadHistoryNameProperty.Low, Position: 2},
        {Name: EUploadHistoryNameProperty.Close, Position: 3},
        {Name: EUploadHistoryNameProperty.Volume, Position: 4},
        {Name: EUploadHistoryNameProperty.Date, Position: 5},
    ];

    constructor(private _http: HttpClient, private _identity: IdentityService) {
    }

    public uploadHistory(params: IUploadHistoryParams): Observable<HistoryStorageDTO> {
        return this.uploadStringData(
            params.symbol,
            params.exchange,
            this.convertBarsToCSV(params.bars),
            params.description,
            params.name
        );
    }

    public uploadHistoryFromCSV(params: IUploadHistoryFromCSVParams): Observable<HistoryStorageDTO> {
        return this.uploadStringData(params.symbol, params.exchange, params.bars, params.description, params.name);
    }

    convertBarsToCSV(bars: IBarData[]): string {
        let barsString = '';
        bars.forEach(value => {
            barsString += value.open + ',';
            barsString += value.high + ',';
            barsString += value.low + ',';
            barsString += value.close + ',';
            barsString += value.volume + ',';
            barsString += (value.date.getTime() / 1000).toFixed(0) + '\r\n';
        });

        return barsString;
    }


    public uploadStringData(symbol: string, exchange: string, barsString: string, description: string, name: string): Observable<HistoryStorageDTO> {
        const request: UploadHistoryStorageRequestDTO = {
            Value: barsString,
            DateFormat: EUploadHistoryDateFormat.UnixSeconds,
            Description: description,
            Name: name,
            Mapping: this._defaultMapping,
            Separator: ',',
            Instrument: {
                Exchange: exchange,
                Name: symbol
            },
            UserId: this._identity.id
        };

        return this._http.post<HistoryStorageDTO>(`${AppConfigService.config.apiUrls.historystorageREST}upload`, request).pipe(catchError(error => {
            console.log('Failed to upload history to historystorage API');
            console.log(error);
            return throwError(error);
        }));
    }

    public getStorage(storageid: string): Observable<HistoryStorageDTO> {
        const params = new HttpParams()
            .append('userid', this._identity.id)
            .append('storageid', storageid);

        return this._http.get<HistoryStorageDTO>(`${AppConfigService.config.apiUrls.historystorageREST}storages/get`, {params: params}).pipe(catchError(error => {
            console.log('Failed to load history storage from historystorage API');
            console.log(error);
            return throwError(error);
        }));
    }

    public deleteStorage(storageid: string): Observable<HistoryStorageDTO> {
        const deleteStorageRequest: DeleteHistoryStorageRequestDTO = {
            StorageId: storageid,
            UserId: this._identity.id
        };

        return this._http.post<HistoryStorageDTO>(`${AppConfigService.config.apiUrls.historystorageREST}reset`, deleteStorageRequest).pipe(catchError(error => {
            console.log('Failed to delete history storage from historystorage API');
            console.log(error);
            return throwError(error);
        }));
    }

    // get close of each bar in storage history
    public getStorageSnapshot(storageid: string): Observable<number[]> {
        const params = new HttpParams()
            .append('userid', this._identity.id)
            .append('storageid', storageid);

        return this._http.get<any>(`${AppConfigService.config.apiUrls.historystorageREST}snapshot`, {params: params}).pipe(catchError(error => {
            console.log('Failed to load history storage snapshot from historystorage API');
            console.log(error);
            return throwError(error);
        }), map(response => response.data));
    }

    // get preview of storage data bars (first 100 bars) or specified count
    public getStorageData(storageid: string, count?: number): Observable<HistoryStorageDataDTO> {
        const params = new HttpParams()
            .append('userid', this._identity.id)
            .append('count', (count ? count : 100).toString())
            .append('storageid', storageid);

        return this._http.get<HistoryStorageDataDTO>(`${AppConfigService.config.apiUrls.historystorageREST}data`, { params: params }).pipe(catchError(error => {
            console.log('Failed to load history storage data from historystorage API');
            console.log(error);
            return throwError(error);
        }));
    }

    public getStorages(): Observable<HistoryStorageDTO[]> {
        const params = new HttpParams()
            .append('userid', this._identity.id);

        return this._http.get<HistoryStorageDTO[]>(`${AppConfigService.config.apiUrls.historystorageREST}storages`, {params: params}).pipe(catchError(error => {
            console.log('Failed to load history storages from historystorage API');
            console.log(error);
            return throwError(error);
        }));
    }
}
