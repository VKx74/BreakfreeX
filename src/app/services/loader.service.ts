import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private _loadings = [];
    private _loadingsCount = 0;
    private _loading$ = new BehaviorSubject(false);
    public loading$ = this._loading$.asObservable();

    get loading() {
        return this._loadings.length !== 0;
    }

    constructor() {
    }

    show() {
        this._loading$.next(!!++this._loadingsCount);
    }

    hide() {
        // this._loadingsCount--;
        // if (!this._loadingsCount) {
            this._loading$.next(false);
        // }
    }
}
