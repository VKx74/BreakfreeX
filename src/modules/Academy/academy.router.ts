import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import { AcademyPageComponent } from "./components/academy-page/academy-page.component";
import { AcademyRootComponent } from "./components/root/academy-root.component";


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AcademyRootComponent,
                children: [
                    {
                        path: "",
                        component: AcademyPageComponent
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
