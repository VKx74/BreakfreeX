import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from './components/data-table/data-table.component';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {DataTableCellComponent} from './components/data-table-cell/data-table-cell.component';
import {DataTableHeaderCellComponent} from './components/data-table-header-cell/data-table-header-cell.component';
import {MatRippleModule} from "@angular/material/core";
import {CdkDetailRowDirective} from "./components/data-table/cdk-detail-row.directive";
import { ColumnsVisibilityToggleComponent } from './components/columns-visibility-toggle/columns-visibility-toggle.component';
import { ColumnsVisibilityToggleActivatorDirective } from './components/data-table/columns-visibility-toggle-activator.directive';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatMenuModule} from "@angular/material/menu";
import {LocalizationModule} from "Localization";

@NgModule({
    declarations: [
        DataTableComponent,
        DataTableCellComponent,
        DataTableHeaderCellComponent,
        CdkDetailRowDirective,
        ColumnsVisibilityToggleComponent,
        ColumnsVisibilityToggleActivatorDirective
    ],
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatRippleModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatMenuModule,
        LocalizationModule
    ],
    exports: [
        DataTableComponent,
        DataTableCellComponent,
        DataTableHeaderCellComponent,
        ColumnsVisibilityToggleComponent
    ]
})
export class DatatableModule {
}
