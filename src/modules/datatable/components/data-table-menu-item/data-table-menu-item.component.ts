import {Component, ContentChild, ElementRef, Input, OnInit, TemplateRef} from '@angular/core';

@Component({
    selector: 'data-table-menu-item',
    templateUrl: './data-table-menu-item.component.html',
    styleUrls: ['./data-table-menu-item.component.scss']
})
export class DataTableMenuItemComponent implements OnInit {
    @Input() id: string;
    @ContentChild(TemplateRef, {static: false}) template: TemplateRef<any>;

    constructor(public el: ElementRef) {
    }

    ngOnInit() {
    }

}
