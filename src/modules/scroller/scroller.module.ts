import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScrollerComponent} from "./components/scroller/scroller.component";

@NgModule({
    declarations: [
        ScrollerComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ScrollerComponent
    ]
})
export class ScrollerModule {
}
