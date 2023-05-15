import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import { RTDPageRootComponent } from "./components/root/rtd-page-root.component";
import { RTDPageComponent } from "./components/rtd-page/rtd-page.component";


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: RTDPageRootComponent,
                children: [
                    {
                        path: "",
                        component: RTDPageComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class RTDPageRoutingModule {

}
