export interface ILoadPaginatedDataResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    // pageCount: number;
    itemsCount: number;
}
