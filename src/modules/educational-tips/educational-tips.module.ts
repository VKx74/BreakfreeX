import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EducationalTipsComponent} from "./components/educational-tips/educational-tips.component";
import {LocalizationModule} from "Localization";

@NgModule({
    declarations: [
        EducationalTipsComponent
    ],
    imports: [
        CommonModule,
        LocalizationModule,
    ],
    entryComponents: [
        EducationalTipsComponent
    ],
    exports: [
        EducationalTipsComponent
    ],
    providers: [
    ]
})
export class EducationalTipsModule {
}
