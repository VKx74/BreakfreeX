import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {IThread} from "../../../Chat/models/thread";

@Injectable({
    providedIn: 'root'
})
export class ThreadManagerService implements OnInit {
    // TODO: If not required - remove id observable and subject
    private threadIdSubject$ = new BehaviorSubject<string>(null);
    private threadSubject$ = new BehaviorSubject<IThread>(null);
    public threadIdObservable = this.threadIdSubject$.asObservable();
    public threadObservable = this.threadSubject$.asObservable();

    constructor() {
    }

    get threadId() {
        const value = this.threadSubject$.value;
        return value ? value.id : null;
    }

    set threadId(value: string) {
        this.threadIdSubject$.next(value);
    }

    get currentThread() {
        if (this.threadSubject$.value) {
            return this.threadSubject$.value;
        }
    }

    set currentThread(value: IThread) {
        this.threadSubject$.next(value);
    }

    ngOnInit(): void {
    }
}
