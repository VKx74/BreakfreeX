import {NgModule} from '@angular/core';
import {LoaderComponent} from "./loader/loader.component";
import {LoadingModule} from "ngx-loading";
import { BFTLoaderComponent } from './bft-loader/bft-loader.component';
import { BFTLoaderBlockComponent } from './bft-loader-block/bft-loader-block.component';

@NgModule({
  declarations: [LoaderComponent, BFTLoaderComponent, BFTLoaderBlockComponent],
    imports: [
        LoadingModule.forRoot({
            backdropBackgroundColour: 'inherit',
            primaryColour: '#3d61cc',
            secondaryColour: '#3d61cc',
            tertiaryColour: '#3d61cc'
        })
    ],
  exports: [LoaderComponent, BFTLoaderComponent, BFTLoaderBlockComponent]
})
export class LoaderModule { }
