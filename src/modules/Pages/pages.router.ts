import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import { PagesRootComponent } from './components/root/pages-root.component';
import { PagesRoutes } from './pages.routes';
import { SuccessCheckoutPageComponent } from './components/success-checkout-page/success-checkout-page.component';
import { OAuthRegistrationFinishedComponent } from "./components/oauth-registration-finished/oauth-registration-finished.component";


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
                    },
                    {
                        path: PagesRoutes.OAuthRegistrationFinished,
                        component: OAuthRegistrationFinishedComponent
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
