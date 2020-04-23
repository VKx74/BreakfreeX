import {NgModule} from '@angular/core';
import {LoaderComponent} from "./loader/loader.component";
import {LoadingModule} from "ngx-loading";

@NgModule({
  declarations: [LoaderComponent],
    imports: [
        LoadingModule.forRoot({
            backdropBackgroundColour: 'inherit',
            primaryColour: '#3d61cc',
            secondaryColour: '#3d61cc',
            tertiaryColour: '#3d61cc'
        })
    ],
  exports: [LoaderComponent]
})
export class LoaderModule { }
