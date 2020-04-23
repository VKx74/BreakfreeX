import {Component, Input, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {IPaginationData, IPaginationHandler} from "../../../../app/models/pagination.model";

@Component({
    selector: 'paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent {
    @Input() handler: IPaginationHandler;
    @Input() showPageSize: boolean = true;
    @ViewChild('paginator', {static: false}) paginator: MatPaginator;

    private _paginationData: IPaginationData;

    get pageSize(): number {
        return this._paginationData.pageSize;
    }

    get itemsCount(): number {
        return this._paginationData.itemsCount;
    }

    get currentPage(): number {
        return this._paginationData.pageIndex;
    }

    get pageSizeOptions(): number[] {
        return [1, 5, 10, 15, 25];
    }

    ngOnInit() {
        this._paginationData = this.handler.getPaginationData();

        this.handler.paginationDataChange$.subscribe({
            next: (data: IPaginationData) => {
                this._paginationData = data;
                this.paginator.pageIndex = data.pageIndex;
            }
        });
    }

    handlePageChange(event: PageEvent) {
        this.handler.onPageChange(event);
    }
}
