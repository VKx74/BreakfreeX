import {Injector} from "@angular/core";
import {
    MissingTranslationHandler, MissingTranslationHandlerParams,
    TranslateCompiler,
    TranslateParser,
    TranslateService,
    TranslateStore
} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {FileLoaderFactory} from "./file-translate-loader.factory";
import {LocalizationService} from "../services/localization.service";
import {Locale} from "../enums/locale";

export function TranslateServiceFactory(fileName: string) {
    return function (injector: Injector, parent?: TranslateService) {
        function createMissingTranslationHandler(service: TranslateService): MissingTranslationHandler {
            return {
                handle: (params: MissingTranslationHandlerParams): any => {
                    return service.get(params.key, params.interpolateParams);
                }
            } as MissingTranslationHandler;
        }

        function getMissingTranslationHandler(): MissingTranslationHandler {
            return parent ? createMissingTranslationHandler(parent) : injector.get(MissingTranslationHandler);
        }

        const localizationService = injector.get(LocalizationService);
        const translateLoader = FileLoaderFactory(fileName)(injector.get(HttpClient));
        const translateService = Injector.create({
            providers: [
                {
                    provide: TranslateService,
                    useFactory: () => {
                        return new TranslateService(
                            new TranslateStore(),
                            translateLoader,
                            injector.get(TranslateCompiler),
                            injector.get(TranslateParser),
                            getMissingTranslationHandler()
                        );
                    },
                    deps: []
                }
            ]
        }).get(TranslateService);

        translateService.use(localizationService.locale as string);
        localizationService.localeChange$
            .subscribe((locale: Locale) => {
                translateService.use(locale as string);
            });

        return translateService;
    };
}
