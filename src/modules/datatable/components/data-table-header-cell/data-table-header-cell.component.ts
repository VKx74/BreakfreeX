import {Component, ElementRef, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColumnSortDataAccessor} from "../data-table/data-table.component";

@Component({
    selector: 'data-table-header-cell',
    templateUrl: './data-table-header-cell.component.html',
    styleUrls: ['./data-table-header-cell.component.scss']
})
export class DataTableHeaderCellComponent implements OnInit {
    @Input() columnName: string;
    @Input() columnWidth: number;
    @Input() sortable: boolean;
    @Input() dataAccessor: ColumnSortDataAccessor;
    @ViewChild(TemplateRef, {static: true}) template: TemplateRef<any>;

    constructor(public el: ElementRef) {
    }

    ngOnInit() {
    }

}
