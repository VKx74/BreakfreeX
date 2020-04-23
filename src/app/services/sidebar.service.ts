import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private _state$ = new BehaviorSubject<boolean>(false);
    public state$ = this._state$.asObservable();

    get shown() {
        return this._state$.value;
    }

    constructor() {
    }

    show() {
        this.setSidebarState(true);
    }

    hide() {
        this.setSidebarState(false);
    }

    toggle() {
        this.setSidebarState(!this.shown);
    }

    setSidebarState(value: boolean) {
        this._state$.next(value);
    }
}

