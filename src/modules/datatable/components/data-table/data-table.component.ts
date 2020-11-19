import {
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter, Inject,
    Input, Optional,
    Output,
    QueryList,
    Renderer2,
    SimpleChange,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatSort} from '@angular/material/sort';
import {DataTableCellComponent} from "../data-table-cell/data-table-cell.component";
import {DataTableHeaderCellComponent} from "../data-table-header-cell/data-table-header-cell.component";
import {map, takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {Sort} from "@angular/material/typings/sort";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {DataTableViewMode} from "../../viewmode";
import {DataTableViewModeToken} from "../../data-table-view-mode.token";
import { DataTableMenuItemComponent } from '../data-table-menu-item/data-table-menu-item.component';
import { MatMenuTrigger } from '@angular/material/menu';

export interface IColumnsWidth {
    [columnName: string]: number;
}

export interface IColumnsDimensions {
    [columnName: string]: {
        flexGrow: number;
    };
}


export type ColumnSortDataAccessor = ((item: any, columnName: string) => string | number);
export type ColumnCaption = (columnName: string) => Observable<string>;

const ResizeHandleClass = 'resize-handle';

@Component({
    selector: 'data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class DataTableComponent {
    @Input() rows: any[];
    @Input() groupingField: string;
    @Input() groups: string[];
    @Input() selectedRow: any;
    @Input() selectable: boolean = false;
    @Input() trackByIndex: boolean = true;
    @Input() trackByName: string;

    @Input() expandOnClick = true;
    @Input() maxExpandedRows: number = 1;
    @Input() expandDetailsTemplate: TemplateRef<any>;


    @Input() minColumnWidth: number = 50;
    @Input() preferredInitColumnsWidth: number;
    @Input() sortHandler: (data: Sort) => any;
    @Input() excludedColumns: string[] = [];
    @Input() hiddenColumns: string[] = [];

    @Input() allowColumnsVisibilityChange: boolean = false;
    @Input() columnCaption: ColumnCaption;

    @Output() onRowSelect = new EventEmitter();
    @Output() onDoubleClick = new EventEmitter();
    @Output() onContextMenuSelected = new EventEmitter<any>();
    viewMode: DataTableViewMode = DataTableViewMode.Default;
    DataTableViewMode = DataTableViewMode;

    columns$ = new BehaviorSubject<string[]>([]);
    hiddenColumns$ = new BehaviorSubject<string[]>([]);
    visibleColumns$ = new BehaviorSubject<string[]>([]);
    sortableColumnsObj: { [columnName: string]: boolean } = {};

    @ViewChild("trigger", {static: false}) contextMenu: MatMenuTrigger;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    @ViewChild(MatTable, {read: ElementRef, static: false}) table: ElementRef;

    @ContentChildren(DataTableHeaderCellComponent) headerCells: QueryList<DataTableHeaderCellComponent>;
    @ContentChildren(DataTableCellComponent) cells: QueryList<DataTableCellComponent>;
    @ContentChildren(DataTableMenuItemComponent) menuItems: QueryList<DataTableMenuItemComponent>;
    dataSource: MatTableDataSource<any>;

    headerCellsObj: { [columnName: string]: DataTableHeaderCellComponent } = {};
    columnCellTemplates: { [columnName: string]: TemplateRef<any> } = {};
    menuItemsComponents: DataTableMenuItemComponent[] = [];
    columnHeaderCellTemplates: { [columnName: string]: TemplateRef<any> } = {};

    pressed = false;
    currentResizeColumn: string;
    startX: number;
    startWidth: number;
    contextMenuPosition = { x: '0px', y: '0px' };
    resizableMousemove: () => void;
    resizableTouchMove: () => void;
    resizableMouseup: () => void;
    resizableToucheEnd: () => void;
    private _originSortingDataAccessor: ((data: any, sortHeaderId: string) => string | number);
    private _columnsDimensions: IColumnsDimensions = {};
    private _expandedRows: any[] = [];
    private _needSetDimensions: boolean = false;
    private _initialized: boolean = false;
    private _prevRowClicked: any = null;

    get expandable(): boolean {
        return this.expandDetailsTemplate != null;
    }

    constructor(private elRef: ElementRef,
                private renderer: Renderer2,
                private _cdr: ChangeDetectorRef,
                @Inject(DataTableViewModeToken) @Optional() viewMode: DataTableViewMode) {

        if (viewMode != null) {
            this.viewMode = viewMode;
        }

        this.dataSource = new MatTableDataSource([]);
    }

    trackBy(index: number, item: any) {
        if (this.trackByName && item[this.trackByName]) {
            return item[this.trackByName];
        }  
        
        if (this.trackByIndex) {
            return index;
        }

        return item;
    }

    ngOnInit() {
        if (this.sortHandler) {
            this.sort.sortChange
                .subscribe(d => {
                    this.sortHandler(d);
                });
        } else {
            this.dataSource.sort = this.sort;
        }

        this._originSortingDataAccessor = this.dataSource.sortingDataAccessor;

        this.sort.sortChange
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this._cdr.detectChanges(); // fix index sorting
            });
    }

    ngAfterContentInit() {
        this.columnCellTemplates = this.cells.reduce((acc, cell: DataTableCellComponent) => {
            acc[cell.columnName] = cell.template;
            return acc;
        }, {});
        
        this.menuItemsComponents = [];
        this.menuItems.forEach((item: DataTableMenuItemComponent) => {
            this.menuItemsComponents.push(item);
        });

        this.columnHeaderCellTemplates = this.headerCells.reduce((acc, cell: DataTableHeaderCellComponent) => {
            acc[cell.columnName] = cell.template;
            return acc;
        }, {});

        this.headerCellsObj = this.headerCells.reduce((acc, c) => {
            acc[c.columnName] = c;

            return acc;
        }, {});

        if (this.groupingField) {
            this.dataSource.sortData = (data: any[], sort: MatSort): any[] => {
                if (!sort.active) {
                    return data;
                }
                // debugger
                // for (let i = 0; i < data.length; i++) {
                //     // removing groups
                //     if (data[i].group !== undefined) {
                //         data.splice(i, 1);
                //         i--;
                //     }
                // }
                
                const newArray = this.rows.sort((a, b) => {
                    let aVal, bVal;
                    const accessor = this._getColumnSortDataAccessor(sort.active);
                    if (accessor) {
                        aVal = accessor(a, sort.active);
                        bVal = accessor(b, sort.active);
                    } else {
                        aVal = this._originSortingDataAccessor(a, sort.active);
                        bVal = this._originSortingDataAccessor(b, sort.active);
                    }

                    if (typeof aVal === "number") {
                        if (sort.direction === 'asc') {
                            return aVal - bVal;
                        } else {
                            return bVal - aVal;
                        }
                    } else {
                        if (sort.direction === 'asc') {
                            return aVal.toString().localeCompare(bVal.toString());
                        } else {
                            return bVal.toString().localeCompare(aVal.toString());
                        }
                    }
                });
                return this._toGroup(newArray);
            };
        } else {
            this.dataSource.sortingDataAccessor = (data: any, columnName: string): string | number => {
                const accessor = this._getColumnSortDataAccessor(columnName);

                if (accessor) {
                    return accessor(data, columnName);
                } else {
                    return this._originSortingDataAccessor(data, columnName);
                }
            };
        }

        // this.minColumnWidth = Math.min(
        //     this.minColumnWidth,
        //     ...this.headerCells.map(c => c.columnWidth == null ? Number.MAX_SAFE_INTEGER : c.columnWidth)
        // );

        this.columns$ = new BehaviorSubject(this.headerCells.map(c => c.columnName).filter(name => !this.excludedColumns.includes(name)));
        this.hiddenColumns$ = new BehaviorSubject(this.hiddenColumns);

        combineLatest(
            this.columns$,
            this.hiddenColumns$
        )
            .pipe(
                map(([columns, hiddenColumns]: [string[], string[]]) => {
                    return columns.filter(name => !hiddenColumns.includes(name));
                })
            )
            .subscribe(this.visibleColumns$);

        this.visibleColumns$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((columns: string[]) => {
                this._columnsDimensions = columns.reduce((acc, c) => {
                    acc[c] = {
                        flexGrow: 1
                    };

                    return acc;
                }, {});

                this._needSetDimensions = true;
            });
    }

    ngAfterViewInit() {
        this._columnsDimensions = this.headerCells.reduce((acc, c) => {
            acc[c.columnName] = {
                flexGrow: 1
            };

            return acc;
        }, {});

        this.setColumnsDimensions(this._columnsDimensions);

        setTimeout(() => { // timeout to fix ExpressionChangedAfterItHasBeenCheckedError
            this.sortableColumnsObj = this.headerCells.reduce((acc, c: DataTableHeaderCellComponent) => {
                if (c.sortable) {
                    acc[c.columnName] = true;
                }
                return acc;
            }, {});
        });

        this._initialized = true;
    }

    isGroup(index, item): boolean {
        return item.group !== undefined;
    }

    isNotGroup(index, item): boolean {
        return item.group === undefined;
    }

    updateDataSource() {
        this.dataSource.data = this._toGroup(this.rows);
    }

    ngOnChanges(changes: SimpleChanges) {
        const rowChanges: SimpleChange = changes['rows'];

        if (rowChanges) {
            this.dataSource.data = this._toGroup(rowChanges.currentValue);
            this._needSetDimensions = true;
        }

        if (changes.excludedColumns && this.headerCells) {
            this.columns$ = new BehaviorSubject(this.headerCells.map(c => c.columnName).filter(name => !this.excludedColumns.includes(name)));
            this.hiddenColumns$ = new BehaviorSubject(this.hiddenColumns);

            combineLatest(
                this.columns$,
                this.hiddenColumns$
            )
                .pipe(
                    map(([columns, hiddenColumns]: [string[], string[]]) => {
                        return columns.filter(name => !hiddenColumns.includes(name));
                    })
                )
                .subscribe(this.visibleColumns$);
        }
    }

    ngAfterViewChecked() {
        if (this._needSetDimensions) {
            if (this._columnsDimensions) {
                this.setColumnsDimensions(this._columnsDimensions);
                this._needSetDimensions = false;
            }
        }
    }

    onResizeColumn(event: any, columnName: string) {
        this.currentResizeColumn = columnName;
        this.pressed = true;
        this.startX = this._getEventPageX(event);
        this.startWidth = this.getColumnWidth(columnName);
        event.preventDefault();
        this.mouseMove(columnName);
        this.sort.disabled = true;
    }

    getColumnWidth(columnName: string): number {
        const columnEls = Array.from(this.elRef.nativeElement.getElementsByClassName(this._getColumnCellClass(columnName)));
        return (columnEls[0] as any).clientWidth;
    }

    mouseMove(columnName: string) {
        const moveListener = (event) => {
            if (this.pressed) {
                const pageX = this._getEventPageX(event);
                const dx = (pageX - this.startX);
                const width = this.startWidth + dx;
                const prevWidth = this.getColumnWidth(columnName);

                if (this.currentResizeColumn === columnName) {
                    this.handleColumnResize(columnName, width, prevWidth);
                }
            }
        };

        const moveEndListener = (event) => {
            if (this.pressed) {
                this.pressed = false;
                this.currentResizeColumn = null;
                this.resizableMousemove();
                this.resizableTouchMove();
                this.resizableMouseup();
                this.resizableToucheEnd();
            }

            setTimeout(() => {
                this.sort.disabled = false;
            });
        };

        this.resizableMousemove = this.renderer.listen('document', 'mousemove', moveListener);
        this.resizableTouchMove = this.renderer.listen('document', 'touchmove', moveListener);
        this.resizableMouseup = this.renderer.listen('document', 'mouseup', moveEndListener);
        this.resizableToucheEnd = this.renderer.listen('document', 'touchend', moveEndListener);
    }

    handleColumnResize(columnName: string, width: number, prevWidth: number) {
        const dx = width - prevWidth;

        if (dx !== 0) {
            const newWidth = width;
            const minWidth = this.headerCellsObj[columnName].columnMinWidth || this.minColumnWidth;

            if (newWidth < minWidth) {
                return;
            }

            const ratio = width / prevWidth;
            const widthDiff = width - prevWidth;
            const prevFlexGrow = this._columnsDimensions[columnName].flexGrow;
            const newFlexGrow = prevFlexGrow * ratio;
            if (this._getColumnSpecifiedWidth(columnName) != null) {
                this.headerCellsObj[columnName].columnWidth += widthDiff;
            } else {
                this._columnsDimensions[columnName].flexGrow = newFlexGrow;
            } 

            this.setColumnsDimensions(this._columnsDimensions);
        }
    }

    private _updateColumnsDimensions(columnsWidth: IColumnsWidth, columnWidth: number): IColumnsDimensions {
        return Object.keys(columnsWidth).reduce((acc, cName) => {
            const isColumnHasSpecifiedWidth = this._getColumnSpecifiedWidth(cName) != null;

            acc[cName] = {
                flexGrow: isColumnHasSpecifiedWidth ? 1 : columnsWidth[cName] / columnWidth
            };

            return acc;
        }, {});
    }

    private _getColumnsWidth(): IColumnsWidth {
        const columnWidth = {};

        this.visibleColumns$.getValue().reduce((acc, columnName) => {
            const elements = this.elRef.nativeElement.getElementsByClassName(`header-cell ${this._getColumnCellClass(columnName)}`);
            
            acc[columnName] = elements[0].clientWidth;

            return acc;
        }, columnWidth);

        return columnWidth;
    }

    private _getColumnSpecifiedWidth(columnName: string): number {
        return this.headerCellsObj[columnName].columnWidth;
    }

    private _getHeaderCell(columnName: string): DataTableHeaderCellComponent {
        return this.headerCellsObj[columnName];
    }

    private _getNextColumnName(columnName: string): string {
        const visibleColumns = this.visibleColumns$.getValue();
        const index = visibleColumns.findIndex(c => c === columnName);

        if (index === visibleColumns.length - 1) {
            return null;
        } else {
            return visibleColumns[index + 1];
        }
    }

    setColumnsDimensions(dimensions: IColumnsDimensions) {
        Object.keys(dimensions)
            .forEach((columnName: string) => {
                this.setColumnDimension(columnName, dimensions);
            });
    }

    setColumnDimension(columnName: string, dimensions: IColumnsDimensions) {
        const columnEls = Array.from(this.elRef.nativeElement.getElementsByClassName(this._getColumnCellClass(columnName)));

        const minWidth = this.headerCellsObj[columnName].columnMinWidth || this.minColumnWidth;
        if (this.headerCellsObj[columnName].columnWidth != null) {
            columnEls.forEach((el: HTMLDivElement) => {
                el.style.flexGrow = "0";
                el.style.flexShrink = "1";
                el.style.flexBasis = `${this.headerCellsObj[columnName].columnWidth}px`;
                el.style.minWidth = `${minWidth}px`;
            });
        } else {
            columnEls.forEach((el: HTMLDivElement) => {
                el.style.flexGrow = dimensions[columnName].flexGrow.toString();
                el.style.flexShrink = "1";
                el.style.flexBasis = "0";
                el.style.minWidth = `${minWidth}px`;
            });
        }
    }

    handleRowSelected(row: any, event: any) {
        const target = event.target;

        if (target.classList.contains(ResizeHandleClass)) { // resize handle clicked
            return;
        }

        if (this.expandOnClick) {
            if (this.isRowExpanded(row)) {
                this._collapseRow(row);
            } else {
                this._expandRow(row);
            }
        }

        this.onRowSelect.emit(row);

        if (this._prevRowClicked === row) {
            this.onDoubleClick.emit(row);
        } else {
            this._prevRowClicked = row
        }

        setTimeout(() => {
            this._prevRowClicked = null;
        }, 600);
    }

    handleRowDoubleClick(row: any, event: any) {
        const target = event.target;
        this._prevRowClicked = null;

        if (target.classList.contains(ResizeHandleClass)) { // resize handle clicked
            return;
        }

        this.onDoubleClick.emit(row);
    }

    isRowExpanded(row): boolean {
        return this._expandedRows.indexOf(row) !== -1;
    }

    isColumnVisible(column: string): boolean {
        return this.hiddenColumns$.getValue().indexOf(column) === -1;
    }

    toggleColumn(column: string) {
        let hiddenColumns = this.hiddenColumns$.getValue();
        const visibleColumns = this.visibleColumns$.getValue();

        if (this.isColumnVisible(column)) {
            if (visibleColumns.length === 1) {
                return;
            }

            hiddenColumns.push(column);
        } else {
            hiddenColumns = hiddenColumns.filter(c => c !== column);
            this._columnsDimensions[column] = {
                flexGrow: this._getColumnSpecifiedWidth(column) == null ? 1 : 0
            };
        }

        this.hiddenColumns$.next(hiddenColumns);
    }

    expandRow(rowIndex: number) {
        const row = this.rows[rowIndex];

        if (!this.isRowExpanded(row)) {
            this._expandRow(row);
        }
    }

    collapseRow(rowIndex: number) {
        const row = this.rows[rowIndex];

        if (this.isRowExpanded(row)) {
            this._collapseRow(row);
        }
    }

    onContextMenu(row: any, event: MouseEvent) {
        event.preventDefault();
        this.handleRowSelected(row, event);

        if (!this.menuItemsComponents || !this.menuItemsComponents.length) {
            return;
        }

        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        // this.contextMenu.menuData = { 'item': item };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
    }

    onContextMenuAction(id: any) {
        if (id) {
            this.onContextMenuSelected.next(id);
        }
    }

    private _expandRow(row: any) {
        this._expandedRows.unshift(row);
        this._expandedRows.length = Math.min(this._expandedRows.length, this.maxExpandedRows);
    }

    private _collapseRow(row: any) {
        this._expandedRows = this._expandedRows.filter(r => r !== row);
    }

    private _getColumnCellClass(columnName: string): string {
        return `mat-column-${columnName.replace('*', '-').replace('!', '-').replace(' ', '-').replace('(', '-').replace(')', '-').replace('%', '-')}`;
    }

    private _getColumnSortDataAccessor(columnName: string): ColumnSortDataAccessor {
        return this.headerCells.find(c => c.columnName === columnName).dataAccessor;
    }

    private _getEventPageX(event: any): number {
        return event.touches ? event.touches[0].pageX : event.pageX;
    }

    private _toGroup(rows: any[]): any[] {
        if (!this.groupingField || !this.groups || !this.groups.length) {
            return rows;
        }
        const res = [];
        this.groups.forEach(group => {
            const filteredRows = [];
            rows.forEach(row => {
                if (row[this.groupingField] === group) {
                    filteredRows.push(row);
                }
            });

            if (filteredRows.length) {
                res.push({
                    group: group
                });
                filteredRows.forEach(_ => res.push(_));
            }
        });
        return res;
    }

    ngOnDestroy() {
    }
}
