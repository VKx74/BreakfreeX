import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import { PagesRootComponent } from './components/root/pages-root.component';
import { PagesRoutes } from './pages.routes';
import { SuccessCheckoutPageComponent } from './components/success-checkout-page/success-checkout-page.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PagesRootComponent,
                children: [
                    {
                        path: PagesRoutes.SuccessCheckout,
                        component: SuccessCheckoutPageComponent
                    }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class PagesRoutingModule {

}
