import {Sort, SortDirection as MatSortDirection} from "@angular/material/typings/sort";

export enum SortDirection {
    asc = 0,
    desc = 1,
}

export type ISortHandler = (data: Sort) => any;

export class SortHandler implements Sort {
    active: string;
    direction: MatSortDirection;

    get descending(): boolean {
        return this.direction === '' ? null : !!SortDirection[this.direction];
    }

    get ascending() {
        return !this.descending;
    }

    constructor(sort: Sort) {
        this.active = sort.active;
        this.direction = sort.direction;
    }
}
