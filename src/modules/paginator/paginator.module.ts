import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaginatorComponent} from "./components/paginator/paginator.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import {PaginatorContainerComponent} from "./components/paginator-container/paginator-container.component";

@NgModule({
    declarations: [
        PaginatorComponent,
        PaginatorContainerComponent
    ],
    imports: [
        CommonModule,
        MatPaginatorModule
    ],
    exports: [
        PaginatorComponent,
        PaginatorContainerComponent
    ]
})
export class PaginatorModule {
}
