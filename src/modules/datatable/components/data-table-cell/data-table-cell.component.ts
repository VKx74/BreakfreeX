import {Component, ContentChild, ElementRef, Input, OnInit, TemplateRef} from '@angular/core';

@Component({
    selector: 'data-table-cell',
    templateUrl: './data-table-cell.component.html',
    styleUrls: ['./data-table-cell.component.scss']
})
export class DataTableCellComponent implements OnInit {
    @Input() columnName: string;
    @ContentChild(TemplateRef, {static: false}) template: TemplateRef<any>;

    constructor(public el: ElementRef) {
    }

    ngOnInit() {
    }

}
