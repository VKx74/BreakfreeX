import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import { AcademyPageComponent } from "./components/academy-page/academy-page.component";
import { AcademyRoutingModule } from "./academy.router";
import { AcademyRootComponent } from "./components/root/academy-root.component";

@NgModule({
    declarations: [
        AcademyPageComponent,
        AcademyRootComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        SharedModule,
        AcademyRoutingModule
    ],
    providers: [
    ],
    entryComponents: []
})
export class AcademyModule {
}
