import {BehaviorSubject, forkJoin, Observable, of, Subject, Subscription, throwError} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {catchError, filter, map, mergeMap, startWith, switchMap, tap} from "rxjs/operators";
import {IGetQuestionsParams} from "../../modules/Qa/data/api";


export const PAGINATION_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 2147483647; // Int32 max

export interface IPaginationData {
    pageIndex: number;
    itemsCount: number;
    pageSize: number;
}

export interface IPaginationHandler {
    paginationDataChange$: Subject<IPaginationData>;
    getPaginationData: () => IPaginationData;
    onPageChange: (event: PageEvent) => void;
}

export class PaginationHandler implements IPaginationHandler {
    private _paginationData: IPaginationData = {
        pageIndex: 0,
        pageSize: PAGINATION_PAGE_SIZE,
        itemsCount: 0
    };
    paginationDataChange$ = new Subject<IPaginationData>();
    onPageChange$ = new Subject<PageEvent>();

    get paginationData(): IPaginationData {
        return this._paginationData;
    }

    get pageIndex() {
        return this.paginationData.pageIndex;
    }


    get isLastPage() {
        const {pageIndex, itemsCount, pageSize} = this.paginationData;
        return itemsCount <= (pageIndex + 1) * pageSize;
    }

    get isFirstPage() {
        return !this.paginationData.pageIndex;
    }

    getPaginationData(): IPaginationData {
        return this._paginationData;
    }

    setPaginationData(data: IPaginationData) {
        this._paginationData = data;
        this.paginationDataChange$.next(data);
    }

    onPageChange(event: PageEvent) {
        this._paginationData = Object.assign({}, this._paginationData, {
            pageIndex: event.pageIndex
        });

        this.onPageChange$.next(event);
    }
}

export interface SkipTakeQueryParams {
    skip: number;
    take: number;
}

export interface OffsetLimitQueryParams {
    offset: number;
    limit: number;
    page?: number;
}

export interface SkipLimitQueryParams {
    skip: number;
    limit: number;
}

export enum PaginationParamsType {
    SkipTake,
    OffsetLimit,
    PagePageSize,
    SkipLimit,
}

export interface IPaginationParams<T = any> {
    skip?: number;
    pageSize: number;
    page?: number;
}

type PaginationParamsTypes = SkipTakeQueryParams | OffsetLimitQueryParams | IGetQuestionsParams | SkipLimitQueryParams;

export interface IPaginationParamsConverterMap {
    [key: number]: (params: IPaginationParams) => PaginationParamsTypes;
}

export const PaginationParamsConverterMap: IPaginationParamsConverterMap = {
    [PaginationParamsType.SkipTake]: function (params: IPaginationParams): SkipTakeQueryParams {
        const {skip, pageSize, ...rest} = params;
        return {skip, take: pageSize};
    },
    [PaginationParamsType.OffsetLimit]: function (params: IPaginationParams): OffsetLimitQueryParams {
        const {skip, pageSize, page, ...rest} = params;
        // TODO: Remove
        // let page = (skip === 0 ? 0 : pageSize / skip) + 1;
        // let page = (skip === 0 ? 0 : Math.ceil(pageSize / skip)) + 1;

        return {offset: 0, limit: pageSize, page};
    },
    // TODO: Remove
    [PaginationParamsType.PagePageSize]: function (params: IPaginationParams): IGetQuestionsParams {
        const {page, pageSize} = params;
        // let page = (skip === 0 ? 0 : Math.ceil(skip / pageSize)) + 1;
        return {page, pageSize};
    },
    [PaginationParamsType.SkipLimit]: function (params: IPaginationParams): SkipLimitQueryParams {
        const {skip, pageSize} = params;
        return {skip, limit: pageSize};
    }

};

export class PaginationParams implements IPaginationParams {
    pageSize: number;
    skip: number;
    page?: number;

    static fromObject(params: IPaginationParams): PaginationParams {
        return new PaginationParams(params.skip, params.pageSize);
    }

    static ALL() {
        return new PaginationParams(0, MAX_PAGE_SIZE);
    }

    constructor(skip?: number, pageSize?: number) {
        this.skip = skip || 0;
        this.pageSize = pageSize || PAGINATION_PAGE_SIZE;
        this.page = this.skip === 0 ? 1 : (this.skip / this.pageSize) + 1;
    }

    toSkipTake(): SkipTakeQueryParams {
        return PaginationParamsConverterMap[PaginationParamsType.SkipTake](this) as SkipTakeQueryParams;
    }

    toOffsetLimit(): OffsetLimitQueryParams {
        return PaginationParamsConverterMap[PaginationParamsType.OffsetLimit](this) as OffsetLimitQueryParams;
    }

    toSkipLimit(): SkipLimitQueryParams {
        return PaginationParamsConverterMap[PaginationParamsType.SkipLimit](this) as SkipLimitQueryParams;
    }


    toPagePageSize(): IGetQuestionsParams {
        return PaginationParamsConverterMap[PaginationParamsType.PagePageSize](this) as IGetQuestionsParams;
    }

    toPaginationParams(type: PaginationParamsType): PaginationParamsTypes {
        const paramsHandler = PaginationParamsConverterMap[type];

        if (!paramsHandler) {
            throw new Error(`Provider for query params with key ${type} is not provided`);
        }

        return paramsHandler(this);
    }

}

export interface IPaginationComponent<T> {
    paginationParams: PaginationParams;
    paginationHandler: PaginationHandler;


    setPaginationHandler(params?: T): void;

    getItems(): Observable<T>;

    responseHandler(response: [T, PageEvent]): void;

    errorHandler(error: any): void;

    resetPagination(): void;
}

export abstract class PaginationComponent<K, ResponseType extends IPaginationResponse<K> = IPaginationResponse<K>> implements IPaginationComponent<ResponseType> {
    paginationParams = new PaginationParams();
    paginationHandler = new PaginationHandler();
    paginationSubscription: Subscription;
    paginationData: IPaginationData;

    get skip() {
        return this.paginationParams.skip;
    }

    set skip(value: number) {
        this.paginationParams.skip = value;
    }

    get pageSize() {
        return this.paginationParams.pageSize;
    }

    set pageSize(value: number) {
        this.paginationParams.pageSize = value;
    }

    get pageIndex() {
        return this.paginationParams.page;
    }

    set pageIndex(value: number) {
        this.paginationParams.page = value;
    }

    savePaginationData(event: IPaginationData) {
        this.paginationData = event;
        return event;
    }

    setPaginationHandler(response?: ResponseType, pageSize?: number,
                         // loadLastPageIfEmpty?: boolean
    ) {
        this.pageSize = pageSize ? pageSize : this.pageSize;
        if (response && response.items.length > this.pageSize) {
            response.items = response.items.slice(0, this.pageSize);
        }

        this.paginationSubscription = this.paginationHandler.onPageChange$
            .pipe(
                tap(this.onLoadingStart),
                startWith({
                    pageIndex: 0,
                    pageSize: this.pageSize
                } as PageEvent),
                switchMap((event: PageEvent) => {
                    this.skip = event.pageSize * event.pageIndex;
                    this.pageIndex = event.pageIndex + 1;
                    return forkJoin(
                        response ? of(response) : this.getItems(),
                        of(event)
                    ).pipe(
                        tap(() => response = null),
                        catchError(() => of(null))
                    );
                }),
                filter(v => !!v),
                // switchMap(res => loadLastPageIfEmpty ? this.getLastNonEmptyPage(res) : of(res)),
            )
            .subscribe(([res, pageEvent]: [ResponseType, PageEvent]) => {
                this.paginationHandler.setPaginationData(
                    this.savePaginationData({
                        pageIndex: pageEvent.pageIndex,
                        itemsCount: res.total,
                        pageSize: this.pageSize
                    }));

                this.responseHandler([res, pageEvent]);
            }, this.errorHandler.bind(this)).add(() => console.log('PAGINATION UNSUBSCRIBE'));

        return this.paginationSubscription;
    }

    resetPagination(pageIndex = 0): void {
        this.skip = pageIndex * this.pageSize;
        this.paginationHandler.onPageChange({pageIndex, pageSize: this.pageSize} as PageEvent);
    }

    repeatLastRequest() {
        this.paginationHandler.onPageChange({pageIndex: this.pageIndex - 1, pageSize: this.pageSize} as PageEvent);
    }

    errorHandler(error: any): void {
        console.log('Pagination error', error);
    }

    onLoadingStart(event: PageEvent) {
        console.log('Loading started', event);
    }

    abstract responseHandler(response: [ResponseType, PageEvent]): void;

    abstract getItems(): Observable<ResponseType>;

    // TODO: Review
    // private getLastNonEmptyPage(res: [ResponseType, PageEvent]) {
    //     const data = res[0];
    //     const pageData = res[1];
    //     this.paginationParams = new PaginationParams(this.skip, this.pageSize);
    //     return (pageData.pageSize * pageData.pageIndex) > data.total ? forkJoin(
    //         this.getItems(),
    //         of(pageData),
    //     ) : of(res);
    // }
}

// </editor-fold>
// <editor-fold desc="Pagination response handling">

export interface IPaginationResponse<T = any> {
    items: T[];
    total: number;
}

export enum CollectionResponseType {
    DataCount,
    DataPaging,
    DataTotal,
    ItemsTotal,
    ItemsCount,
}

interface ICollectionResponseConverterMap {
    [key: number]: (res) => PaginationResponse<any>;
}

export type PaginationResponseType<T> =
    IDataCountResponse<T>
    | IItemsTotalResponse<T>
    | IItemsTotalResponse<T>
    | IDataPagingResponse<T>
    | IDataTotalResponse<T>;

export interface IDataCountResponse<T = any> {
    data: T[];
    count: number;
}

export interface IDataPagingResponse<T = any> {
    data: T[];
    paging: {
        total: number;
    };
}

export interface IDataTotalResponse<T = any> {
    data: T[];
    total: number;
}

export interface IItemsCountResponse<T = any> {
    items: T[];
    count: number;
}

export interface IItemsTotalResponse<T = any> {
    items: T[];
    total: number;
}

export class PaginationResponse<T> implements IPaginationResponse {
    items: T[];
    total: number;

    static fromObject<T>(params: IPaginationResponse<T>): IPaginationResponse<T> {
        return new PaginationResponse(params.items, params.total);
    }

    static empty<T>() {
        return new PaginationResponse<T>([], 0);
    }

    constructor(items?: T[], total?: number) {
        this.items = items || [];
        this.total = total || 0;
    }

    toObservable() {
        return of(this);
    }

    toPaginationResponse(): IPaginationResponse<T> {
        return this;
    }
}

const ResponseConverterMap: ICollectionResponseConverterMap = {
    [CollectionResponseType.DataCount]: function <T>(res: IDataCountResponse<T>): PaginationResponse<T> {
        return new PaginationResponse<T>(res.data, res.count);
    },
    [CollectionResponseType.DataPaging]: function <T>(res: IDataPagingResponse<T>): PaginationResponse<T> {
        return new PaginationResponse<T>(res.data, res.paging.total);
    },
    [CollectionResponseType.DataTotal]: function <T>(res: IDataTotalResponse<T>): PaginationResponse<T> {
        return new PaginationResponse<T>(res.data, res.total);
    },
    [CollectionResponseType.ItemsCount]: function <T>(res: IItemsCountResponse<T>): PaginationResponse<T> {
        return new PaginationResponse<T>(res.items, res.count);
    },
    [CollectionResponseType.ItemsTotal]: function <T>(res: IItemsTotalResponse<T>): PaginationResponse<T> {
        return new PaginationResponse<T>(res.items, res.total);
    }
};

export const toBasePaginationResponse = <T>(fromType: CollectionResponseType) =>
    (source: Observable<PaginationResponseType<T>>): Observable<IPaginationResponse<T>> => source.pipe(
        mergeMap(res => {
            if (!res) {
                return new PaginationResponse<T>([], 0).toObservable();
            }

            const responseHandler = ResponseConverterMap[fromType];

            if (!responseHandler || typeof responseHandler !== 'function') {
                return throwError('Handler for this response type does not exist');
            } else {
                return of(responseHandler(res));
            }
        }),
    );

// </editor-fold>
