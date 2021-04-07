import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import { AcademyPageComponent } from "./components/academy-page/academy-page.component";
import { AcademyRootComponent } from "./components/root/academy-root.component";
import { AcademyPageV2Component } from "./components/academy-page-v2/academy-page-v2.component";


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AcademyRootComponent,
                children: [
                    {
                        path: "old",
                        component: AcademyPageComponent
                    },
                    {
                        path: "",
                        component: AcademyPageV2Component
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class AcademyRoutingModule {

}
