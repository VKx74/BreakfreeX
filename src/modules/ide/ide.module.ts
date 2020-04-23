import {InjectionToken, Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IdeComponent} from './components/ide/ide.component';
import {MonacoEditorModule} from "ngx-monaco-editor";
import {monacoConfig} from "./monacoConfig";
import {FormsModule} from "@angular/forms";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {IdeTranslateService} from "./localization/token";
import {ThemeService} from "@app/services/theme.service";
import {Theme} from "@app/enums/Theme";
import {IDEConfig, IDEConfigToken} from "./ide-config";
import {BehaviorSubject} from "rxjs";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MonacoEditorModule.forRoot(
            monacoConfig.fintatechConfig
        ),
        LocalizationModule
    ],
    declarations: [
        IdeComponent
    ],
    exports: [
        IdeComponent
    ],
    providers: [
        {
            provide: IdeTranslateService,
            useFactory: TranslateServiceFactory('ide'),
            deps: [Injector]
        },
        {
            provide: IDEConfigToken,
            useFactory: (themeService: ThemeService) => {
                const themeSubject = new BehaviorSubject(themeService.getActiveTheme());

                themeService.activeThemeChange$
                    .subscribe((theme: Theme) => {
                        themeSubject.next(theme);
                    });

                return {
                    theme$: themeSubject
                } as IDEConfig;
            },
            deps: [ThemeService]
        }
    ]
})
export class IDEModule {
}
