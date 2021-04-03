import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import { AcademyPageComponent } from "./components/academy-page/academy-page.component";
import { AcademyRoutingModule } from "./academy.router";
import { AcademyRootComponent } from "./components/root/academy-root.component";
import { AcademyPageV2Component } from "./components/academy-page-v2/academy-page-v2.component";
import { MatMenuModule } from "@angular/material/menu";
import { WistiaService } from "./services/wistia.service";
import { LoaderModule } from "modules/loader/loader.module";

@NgModule({
    declarations: [
        AcademyPageComponent,
        AcademyRootComponent,
        AcademyPageV2Component
    ],
    imports: [
        CommonModule,
        UIModule,
        SharedModule,
        MatMenuModule,
        AcademyRoutingModule,
        LoaderModule
    ],
    providers: [
        WistiaService
    ],
    entryComponents: []
})
export class AcademyModule {
}
