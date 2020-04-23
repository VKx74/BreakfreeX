import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {catchError, tap} from "rxjs/operators";

export interface IInfinityLoaderServiceLoadParams {
    skip: number;
    take: number;
}

export type LoadMoreDataHandler<T> = (skip: number, take: number) => Observable<T[]>;

@Injectable()
export abstract class InfinityLoaderService<T> {
    items: T[];
    isLoading: boolean;
    isFulfilled: boolean;


    loadMoreData(): Observable<any> {
        if (this.isLoading || this.isFulfilled) {
            return of(null);
        }

        this.isLoading = true;
        const loadingParams = this.getLoadingParams();

        return this.loadMoreDataHandler(loadingParams)
            .pipe(
                tap({
                    next: (items: T[]) => {
                        this.isLoading = false;

                        if (!this.items) {
                            this.items = [];
                        }

                        this.items = [].concat(...this.items, items);
                        this.isFulfilled = this.checkIfIsFullfiled(loadingParams, items);
                    },
                    error: () => this.isLoading = false
                }),
                catchError(() => {
                    return of(null);
                })
            );
    }

    getLoadingParams(): IInfinityLoaderServiceLoadParams {
        return {
            skip: this.items ? this.items.length : 0,
            take: 20
        };
    }

    getItemsAsArray(): T[] {
        return this.items;
    }

    checkIfIsFullfiled(params: IInfinityLoaderServiceLoadParams, items: T[]): boolean {
        return items.length === 0;
    }

    abstract loadMoreDataHandler(params: IInfinityLoaderServiceLoadParams): Observable<any>;
}


// export abstract class BaseLoadableService<T> implements ILoadableService<T> {
//     private _processId = 0;
//
//     private _actualProcessId: number;
//
//     protected __items: T[];
//
//     get items(): T[] {
//         return this.__items || [];
//     }
//
//     get isItemsEmpty() {
//         return this.__items && this.__items.length === 0;
//     }
//
//     get length(): number {
//         return this.__items ? this.__items.length : 0;
//     }
//
//     private _loadingChange = new EventEmitter<boolean>();
//
//     get loadingChange(): EventEmitter<boolean> {
//         return this._loadingChange;
//     }
//
//     private _loading: boolean;
//
//     get loading(): boolean {
//         return this._loading;
//     }
//
//     set loading(value: boolean) {
//         this._loading = value;
//         this.loadingChange.emit(value);
//     }
//
//     private _isFulfilled: boolean;
//
//     get isFulfilled(): boolean {
//         return this._isFulfilled;
//     }
//
//     set isFulfilled(value: boolean) {
//         this._isFulfilled = value;
//     }
//
//     protected get loadingItemsCount(): number {
//         return 10;
//     }
//
//     protected abstract async _getItems(params: BaseGetParams): Promise<T[]>;
//
//     async loadMore(take?: number): Promise<T[]> {
//         if (this.loading || this.isFulfilled) {
//             return [];
//         }
//
//         const processId = this._processId++;
//         this._actualProcessId = processId;
//
//         const skip = this.__items ? this.__items.length : 0;
//         let items;
//
//         if (!take) {
//             take = this.loadingItemsCount;
//         }
//
//         items = await this._load(() => this._getItems({skip, take}));
//
//         if (processId !== this._actualProcessId) {
//             return items;
//         }
//
//         if (!this.__items) {
//             this.__items = [];
//             this.isFulfilled = false;
//         }
//
//         this.__items.push(...items);
//
//         this.isFulfilled = items.length === 0;
//
//         return items;
//     }
//
//     protected clear() {
//         this.__items = null;
//         this._actualProcessId = null;
//         this._isFulfilled = false;
//     }
//
//     protected unshift(...items: T[]) {
//         if (isArray(this.__items)) {
//             this.__items.unshift(...items);
//         }
//     }
//
//     protected delete(...items: T[]) {
//         if (!isArray(this.__items)) {
//             return;
//         }
//
//         for (const item of items) {
//             const index = this.__items.findIndex((_item) => _item === item);
//
//             this.deleteElement(index);
//         }
//     }
//
//     protected deleteElement(index: number) {
//         if (!isArray(this.__items || index === -1 || index == null)) {
//             return;
//         }
//
//         this.__items.splice(index, 1);
//     }
//
//     protected async _load(fn: () => Promise<T[]>): Promise<T[]> {
//         let data = [];
//         try {
//             this.loading = true;
//             data = await fn();
//             this.loading = false;
//         } catch (e) {
//             this.loading = false;
//         }
//
//         return data;
//     }
// }
