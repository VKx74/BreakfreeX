import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WrapperComponent} from "./wrapper.component";
import {RouterModule} from "@angular/router";
import {MatTabsModule} from "@angular/material/tabs";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    declarations: [
        WrapperComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatTabsModule,
        TranslateModule,
    ],

    exports: [
        WrapperComponent,
    ]
})
export class WrapperModule {
}
