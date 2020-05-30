import {InjectionToken, Injector, ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {SharedModule} from "Shared";
import {UIModule} from "UI";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {PlatformTranslateService} from "@platform/localization/token";
import {AppTranslateService} from "@app/localization/token";
import {UserActivitiesService} from "@app/services/user-activities.service";
import {ProfileActivitiesModuleMode, ProfileActivitiesModuleModeToken} from "./profile-activities-mode.token";
import {ProfileActivitiesLoginComponent} from "./components/profile-activities-login/profile-activities-login.component";
import {ProfileActivitiesComponent} from "./components/new-profile-activities/profile-activities.component";
import {DatatableModule} from "../datatable/datatable.module";
import {LoaderModule} from "../loader/loader.module";
import { UserSubscriptionsComponent } from './components/user-subscriptions/user-subscriptions.component';



@NgModule({
    declarations: [
        ProfileActivitiesComponent,
        UserSubscriptionsComponent,
        ProfileActivitiesLoginComponent
    ],
    imports: [
        CommonModule,
        LocalizationModule,
        SharedModule,
        UIModule,
        EducationalTipsModule,
        DatatableModule,
        LoaderModule
    ],
    entryComponents: [],
    exports: [
        ProfileActivitiesComponent,
        UserSubscriptionsComponent,
        ProfileActivitiesLoginComponent
    ],
    providers: [
        UserActivitiesService,
        {
            provide: PlatformTranslateService,
            useFactory: TranslateServiceFactory('platform'),
            deps: [Injector, AppTranslateService]
        }
    ]
})
export class ProfileActivitiesCoreModule {
}

export class ProfileActivitiesModule {
    static forPlatform(): ModuleWithProviders {
        return {
            ngModule: ProfileActivitiesCoreModule,
            providers: [
                {
                    provide: ProfileActivitiesModuleModeToken,
                    useValue: ProfileActivitiesModuleMode.Platform
                }
            ]
        };
    }

    static forAdminArea(): ModuleWithProviders {
        return {
            ngModule: ProfileActivitiesCoreModule,
            providers: [
                {
                    provide: ProfileActivitiesModuleModeToken,
                    useValue: ProfileActivitiesModuleMode.AdminArea
                }
            ]
        };
    }

    static forUsetSettingsArea(): ModuleWithProviders {
        return {
            ngModule: ProfileActivitiesCoreModule,
            providers: [
                {
                    provide: ProfileActivitiesModuleModeToken,
                    useValue: ProfileActivitiesModuleMode.UserSettings
                }
            ]
        };
    }
}
