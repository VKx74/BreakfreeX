import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LandingRouterModule} from "./landing.router";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {NavigationModule} from "../navigation/navigation.module";
import {LandingNavComponent} from './components/landing-nav/landing-nav.component';
import {LandingContainerSidebarComponent} from "./components/landing-container-sidebar/landing-container-sidebar.component";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {LandingComponent} from "./components/landing/landing.component";
import {SidebarModule} from "../sidebar/sidebar.module";
import {SettingsTranslateService} from "../broker/localization/token";
import {TranslateServiceFactory} from "Localization";
import {SharedTranslateService} from "@app/localization/shared.token";
import {BrokerModule} from "../broker/broker.module";
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
    declarations: [
        LandingContainerSidebarComponent,
        LandingNavComponent,
        LandingComponent,
    ],
    imports: [
        CommonModule,
        LandingRouterModule,
        NavigationModule,
        SidebarModule,
        BrokerModule,
        MatFormFieldModule,
        MatInputModule
    ],
    providers: [
        UserSettingsResolver,
    ]
})
export class LandingModule {
}
