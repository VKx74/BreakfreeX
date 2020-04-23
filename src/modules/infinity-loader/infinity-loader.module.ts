import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InfinityLoaderComponent} from "./components/infinity-loader/infinity-loader.component";
import {InfiniteScrollModule} from "ngx-infinite-scroll";

@NgModule({
    declarations: [
        InfinityLoaderComponent
    ],
    imports: [
        CommonModule,
        InfiniteScrollModule
    ],
    exports: [
        InfinityLoaderComponent
    ]
})
export class InfinityLoaderModule {
}
