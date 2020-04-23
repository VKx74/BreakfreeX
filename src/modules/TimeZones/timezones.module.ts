import {Injector, ModuleWithProviders, NgModule} from "@angular/core";
import {TimeZoneManager} from "./services/timeZone.manager";
import {TranslateServiceFactory} from "Localization";
import {TimeZonesTranslateService} from "./localization/token";
import {TzUtils} from "./utils/TzUtils";
import {UtcToActiveTz} from "./pipes/utcToActiveTz.pipe";
import {sharedProviderResolver} from "../popup-window/functions";

export function sharedTzManager() {
    return sharedProviderResolver('timeZoneManager');
}

@NgModule({
    declarations: [
        UtcToActiveTz
    ],
    exports: [
        UtcToActiveTz
    ],
    providers: [
        {
            provide: TimeZonesTranslateService,
            useFactory: TranslateServiceFactory('timezones'),
            deps: [Injector]
        }
    ]
})
export class TimeZonesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: TimeZonesModule,
            providers: [
                TimeZoneManager,
                TzUtils
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: TimeZonesModule,
            providers: [
                {
                    provide: TimeZoneManager,
                    useFactory: sharedTzManager
                },
                TzUtils
            ]
        };
    }
}
