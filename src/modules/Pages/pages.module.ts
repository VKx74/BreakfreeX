import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import { PagesRootComponent } from './components/root/pages-root.component';
import { SuccessCheckoutPageComponent } from './components/success-checkout-page/success-checkout-page.component';
import { PagesRoutingModule } from './pages.router';

@NgModule({
    declarations: [
        PagesRootComponent,
        SuccessCheckoutPageComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        SharedModule,
        PagesRoutingModule
    ],
    providers: [
    ],
    entryComponents: []
})
export class PagesModule {
}
