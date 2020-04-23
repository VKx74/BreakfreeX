import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShuftiproAccountManagerComponent} from "./components/shuftipro-account-manager/shuftipro-account-manager.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        ShuftiproAccountManagerComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    entryComponents: [
        ShuftiproAccountManagerComponent
    ],
    exports: [
        ShuftiproAccountManagerComponent
    ]
})
export class ShuftiproAccountManagerModule {
}
