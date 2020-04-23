import {HttpClient} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable} from "rxjs";

export const LocalesBasePath = 'assets/locales/';

export class FileTranslateLoader implements TranslateLoader {
    constructor(private _fileName: string,
                private _localesBasePath: string,
                private _http: HttpClient) {
    }

    getTranslation(lang: string): Observable<any> {
        return this._http.get(`${this._localesBasePath}${lang}/${this._fileName}.json`);
    }
}

export function FileLoaderFactory(fileName: string) {
    return function (http: HttpClient) {
        return new FileTranslateLoader(fileName, LocalesBasePath, http);
    };
}

