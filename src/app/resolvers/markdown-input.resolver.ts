import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {FileLazyLoader} from "../services/file-lazy-loader.service";
import {LazyLoaderConfig} from "../../lazy-loader.config";
import {fromPromise} from "rxjs/internal-compatibility";

@Injectable({
    providedIn: 'root'
})
export class MarkdownInputResolver implements Resolve<any> {
    constructor(private _fileLazyLoader: FileLazyLoader) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return fromPromise(
            this._fileLazyLoader.loadScripts(
                LazyLoaderConfig.Markdown.scripts
            )
        );
    }
}
