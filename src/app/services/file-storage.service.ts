import {
    HttpClient,
    HttpEvent,
    HttpEventType,
    HttpHeaders,
    HttpParams,
    HttpProgressEvent,
    HttpRequest,
    HttpResponse
} from "@angular/common/http";
import {Observable, Observer, of} from "rxjs";
import {AppConfigService} from "./app.config.service";
import {
    Base64File,
    FileInfo,
    FileSettings,
    ImageSize,
    RequestProgressHandler,
    UploadFileResponceDTO
} from "../models/storage/models";
import {Injectable} from "@angular/core";
import {map, mergeMap} from "rxjs/operators";
import {AuthInterceptorSkipHeader} from "./auth/constants";
import {DomSanitizer} from "@angular/platform-browser";
import {UploadFile} from "../../modules/file-uploader/data/UploadFIle";
import {FileType} from "../../modules/file-uploader/data/FileType";

export const DefaultFileSettings: FileSettings = {
    lifeTime: 0
};

@Injectable({
    providedIn: 'root'
})
export class FileStorageService {
    static FormDataFileKey = 'uploadedFile';
    static ChatThreadDefaultPhotoId = '00000000-0000-0000-0000-000000000000';

    private _cache: { [symbol: string]: string; } = {};

    private _baseUrl: string = AppConfigService.config.apiUrls.fileStorageREST;

    get storageApiKey(): string {
        return AppConfigService.config.fileStorageApiKey;
    }

    get _headers(): HttpHeaders {
        return new HttpHeaders({
            ApiKey: this.storageApiKey,
            [AuthInterceptorSkipHeader]: ''
        });
    }

    static fileToFormData(file: File): FormData {
        const formData: FormData = new FormData();
        formData.append(FileStorageService.FormDataFileKey, file, file.name);
        return formData;
    }

    constructor(private _http: HttpClient,
                private _domSanitized: DomSanitizer) {
    }

    getFile(id: string): Observable<Blob> {
        return this._http.get(`${this._baseUrl}${id}`, {
            responseType: 'blob'
        });
    }

    getImageBase64(id: string): Observable<string> {
        if (this._cache[id]) {
            return of(this._cache[id]);
        }
        
        return this.getFile(id)
            .pipe(
                mergeMap((blob: Blob) => this._blobToBase64(blob).pipe(map((data) => {
                    this._cache[id] = data;
                    return data;
                })))
            );
    }

    getFileObjectUrl(id: string): Observable<string> {
        return this.getFile(id)
            .pipe(
                map((blob: Blob) => this._domSanitized.bypassSecurityTrustUrl(URL.createObjectURL(blob)) as string)
            );
    }

    getFileInfo(id: string): Observable<UploadFileResponceDTO> {
        return this._http.get<UploadFileResponceDTO>(`${this._baseUrl}${id}/Info`);
    }

    deleteFile(id: string): Observable<any> {
        return this._http.delete(`${this._baseUrl}${id}`);
    }

    uploadRawFile(file: File, settings: FileSettings = DefaultFileSettings, progressHandler?: RequestProgressHandler): Observable<FileInfo> {
        const formData: FormData = new FormData();
        formData.append(FileStorageService.FormDataFileKey, file, file.name);

        let params: HttpParams = new HttpParams();
        params = params.set('lifeTime', settings.lifeTime.toString());

        const request = new HttpRequest<FormData>('POST', `${this._baseUrl}Upload`, formData, {
            headers: this._headers,
            params: params,
            reportProgress: true
        });

        return this._progressRequest<FileInfo>(request, progressHandler);
    }

    uploadFile(file: UploadFile, settings: FileSettings = DefaultFileSettings, progressHandler?: RequestProgressHandler): Observable<FileInfo> {
        switch (file.type) {
            case FileType.File:
                return this.uploadRawFile(file.file, settings, progressHandler);
            case FileType.Image:
                return this.uploadImage(FileStorageService.fileToFormData(file.file), settings, progressHandler);
            case FileType.Video:
                return this.uploadRawFile(file.file, settings, progressHandler);
        }
    }

    uploadFileFormData(formData: FormData, settings: FileSettings = DefaultFileSettings, progressHandler?: RequestProgressHandler): Observable<FileInfo> {
        if (!settings)
            settings = DefaultFileSettings;
        let params: HttpParams = new HttpParams();
        params = params.set('lifeTime', settings.lifeTime.toString());

        const request = new HttpRequest<FormData>('POST', `${this._baseUrl}Upload`, formData, {
            // headers: this._headers,
            params: params,
            reportProgress: true
        });

        return this._progressRequest<FileInfo>(request, progressHandler);
    }

    uploadImage(file: FormData, settings?: FileSettings, progressHandler?: RequestProgressHandler): Observable<FileInfo> {

        const request = new HttpRequest<any>('POST', `${this._baseUrl}UploadImage`, file, {
            params: settings as HttpParams,
            reportProgress: true
        });

        return this._progressRequest(request, progressHandler);
    }

    uploadBase64(file: Base64File, settings?: FileSettings, progressHandler?: RequestProgressHandler): Observable<FileInfo> {
        const request = new HttpRequest<Base64File>('POST', `${this._baseUrl}UploadBase64`, file, {
            params: settings as HttpParams,
            reportProgress: true
        });

        return this._progressRequest(request, progressHandler);
    }

    getImageUrl(id: string, size: ImageSize = ImageSize.Original): string {
        if (id == null) {
            return '';
        }

        return `${this._baseUrl}${id}${size ? '/' + size : ''}`;
    }

    getSmallImageUrl(id: string): string {
        return this.getImageUrl(id, ImageSize.Small);
    }

    getMiddleImageUrl(id: string): string {
        return this.getImageUrl(id, ImageSize.Middle);
    }

    getLargeImageUrl(id: string): string {
        return this.getImageUrl(id, ImageSize.Large);
    }

    private _progressRequest<T>(request: HttpRequest<any>, progressHandler?: RequestProgressHandler): Observable<T> {
        return new Observable((observer: Observer<any>) => {
            this._http.request(request)
                .subscribe({
                    next: (event: HttpEvent<any>) => {
                        if ((event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response)
                            && progressHandler) {
                            progressHandler(event as HttpProgressEvent);
                        }

                        if (event.type === HttpEventType.Response) {
                            const body: UploadFileResponceDTO = (event as HttpResponse<UploadFileResponceDTO>).body;

                            observer.next(body.data as FileInfo);
                            observer.complete();
                        }
                    },
                    error: error => {
                        observer.error(error);
                        observer.complete();
                    }
                });
        });
    }

    private _blobToBase64(blob: Blob): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = () => {
                observer.next(reader.result as string);
                observer.complete();
            };

            reader.onerror = (e) => {
                console.log('reader error');

                observer.error(e);
                observer.complete();
            };
        });
    }
}
