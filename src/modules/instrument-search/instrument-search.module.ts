import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InstrumentSearchComponent} from "./components/instrument-search/instrument-search.component";
import {LocalizationModule} from "Localization";
import { InstrumentSearchDialogComponent } from './components/instrument-search-dialog/instrument-search-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LoaderModule } from 'modules/loader/loader.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [
        InstrumentSearchComponent,
        InstrumentSearchDialogComponent
    ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        LocalizationModule,
        DragDropModule,
        LoaderModule
    ],
    exports: [
        InstrumentSearchComponent,
        InstrumentSearchDialogComponent
    ],
    entryComponents: [
        InstrumentSearchDialogComponent
    ]
})
export class InstrumentSearchModule {
}
