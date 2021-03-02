import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import { PagesRootComponent } from './components/root/pages-root.component';
import { SuccessCheckoutPageComponent } from './components/success-checkout-page/success-checkout-page.component';
import { PagesRoutingModule } from './pages.router';
import { OAuthRegistrationFinishedComponent } from "./components/oauth-registration-finished/oauth-registration-finished.component";
import { Angulartics2Facebook } from "angulartics2/facebook";
import { FBPixelTrackingService } from "@app/services/traking/fb.pixel.tracking.service";
import { GTMTrackingService } from "@app/services/traking/gtm.tracking.service";

@NgModule({
    declarations: [
        PagesRootComponent,
        SuccessCheckoutPageComponent,
        OAuthRegistrationFinishedComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        SharedModule,
        PagesRoutingModule
    ],
    providers: [
        Angulartics2Facebook,
        FBPixelTrackingService,
        GTMTrackingService
    ],
    entryComponents: []
})
export class PagesModule {
}
