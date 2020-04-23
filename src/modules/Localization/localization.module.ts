import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";
import {LocalizationService} from "./services/localization.service";
import {TranslateViaServicePipe} from "./pipes/translate-via-service.pipe";
import {sharedProviderResolver} from "../popup-window/functions";

export function sharedLocalizationService() {
    return sharedProviderResolver('localizationService');
}

@NgModule({
    declarations: [
        TranslateViaServicePipe
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        TranslateViaServicePipe,
        TranslateModule
    ],
    entryComponents: []
})
export class LocalizationModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: LocalizationModule,
            providers: [
                LocalizationService
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: LocalizationModule,
            providers: [
                {
                    provide: LocalizationService,
                    useFactory: sharedLocalizationService
                }
            ]
        };
    }
}
