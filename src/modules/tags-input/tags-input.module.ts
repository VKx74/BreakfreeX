import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {TagsInputComponent} from "./components/tags-input/tags-input.component";
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
    declarations: [
        TagsInputComponent
    ],
    imports: [
        CommonModule,
        MatChipsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatIconModule,
        MatFormFieldModule
    ],
    exports: [
        TagsInputComponent
    ]
})
export class TagsInputModule {
}
