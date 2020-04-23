import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OnEnterDirective} from "./directives/on-enter.directive";

@NgModule({
    declarations: [OnEnterDirective],
    imports: [
        CommonModule
    ],
    exports: [OnEnterDirective]
})
export class OnEnterDirectiveModule {
}
