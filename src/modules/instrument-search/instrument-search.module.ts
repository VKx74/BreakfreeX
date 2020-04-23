import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InstrumentSearchComponent} from "./components/instrument-search/instrument-search.component";
import {LocalizationModule} from "Localization";

@NgModule({
    declarations: [
        InstrumentSearchComponent
    ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        LocalizationModule
    ],
    exports: [
        InstrumentSearchComponent
    ]
})
export class InstrumentSearchModule {
}
