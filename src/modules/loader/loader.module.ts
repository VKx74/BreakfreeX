import {NgModule} from '@angular/core';
import {LoaderComponent} from "./loader/loader.component";
import {LoadingModule} from "ngx-loading";
import { BFTLoaderComponent } from './bft-loader/bft-loader.component';

@NgModule({
  declarations: [LoaderComponent, BFTLoaderComponent],
    imports: [
        LoadingModule.forRoot({
            backdropBackgroundColour: 'inherit',
            primaryColour: '#3d61cc',
            secondaryColour: '#3d61cc',
            tertiaryColour: '#3d61cc'
        })
    ],
  exports: [LoaderComponent, BFTLoaderComponent]
})
export class LoaderModule { }
