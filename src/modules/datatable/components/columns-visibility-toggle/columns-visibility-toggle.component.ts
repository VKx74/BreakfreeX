import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface ColumnVisibilityInfo {
    name: string;
    index: number;
    visible: boolean;
}

export class ColumnVisibilityInfo {
    constructor(public name: string, public index: number, public visible: boolean) {
    }

    toggleVisibility() {
        return this.visible = !this.visible;
    }
}


@Component({
    selector: 'columns-visibility-toggle',
    templateUrl: './columns-visibility-toggle.component.html',
    styleUrls: ['./columns-visibility-toggle.component.scss']
})
export class ColumnsVisibilityToggleComponent implements OnInit {
    columns: ColumnVisibilityInfo[];
    @Input() columnsNames: string[];
    @Input() excludedColumns: string[] = [];
    @Input() hiddenColumns: string[] = [];
    @Output() visibilityChange = new EventEmitter<ColumnVisibilityInfo>();

    constructor() {
    }

    ngOnInit() {
        console.log('[CVT] init', this.columnsNames);
        this.columns = this.columnsNames
            .filter(cn => !this.excludedColumns.includes(cn))
            .map((name, index) => new ColumnVisibilityInfo(name, index, !this.hiddenColumns.includes(name)));

        console.log('[CVT] columns', this.columns);
    }

    onVisibilityToggle(column: ColumnVisibilityInfo) {
        column.toggleVisibility();
        this.visibilityChange.emit(column);
    }

}
