import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import { MatMenuModule } from "@angular/material/menu";
import { LoaderModule } from "modules/loader/loader.module";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RTDPageRootComponent } from "./components/root/rtd-page-root.component";
import { RTDPageComponent } from "./components/rtd-page/rtd-page.component";
import { RTDPageRoutingModule } from "./rtd-page.router";

@NgModule({
    declarations: [
        RTDPageRootComponent,
        RTDPageComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        SharedModule,
        MatMenuModule,
        LoaderModule,
        MatSidenavModule,
        RTDPageRoutingModule
    ],
    providers: [
    ],
    entryComponents: [],
    exports: [
    ]
})
export class RTDPageModule {
}
