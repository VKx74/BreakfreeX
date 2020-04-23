import {Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {NewsComponent} from "./components/news/news.component";
import {NewsRestService} from "./services/news.rest.service";
import {UIModule} from "UI";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {SharedModule} from "Shared";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {MatTabsModule} from "@angular/material/tabs";
import {PaginatorModule} from "@paginator/paginator.module";
import {NewsRouterModule} from "./news.router";
import {RouterModule} from "@angular/router";
import {ForumSharedModule} from "../ForumShared/forum-shared.module";
import {NewsManagerResolver} from "../Admin/resolvers/news-manager.resolver";
import {NewsResolver} from "../Admin/resolvers/news.resolver";
import {MarkdownModule} from "../Markdown/markdown.module";
import {LastNewsResolver} from "../Admin/resolvers/last-news.resolver";
import {SharedTranslateService} from "@app/localization/shared.token";
import {NewsPopularTagsResolver} from "../Admin/resolvers/news-popular-tags.resolver";
import { CustomNewsComponent } from './components/custom-news/custom-news.component';
import {DatatableModule} from "../datatable/datatable.module";
import { NewsRootComponent } from './components/news-root/news-root.component';
import {BrokerModule} from "../broker/broker.module";
import {WrapperModule} from "../ViewModules/wrapper/wrapper.module";
import {NewsConfigService} from "./services/news.config.service";
import {NewsTranslateService} from "./localization/news.token";
import {LoaderModule} from "../loader/loader.module";
import {TimeZonesModule} from "TimeZones";
import {sharedProviderResolver} from "../popup-window/functions";
import {MatTableModule} from "@angular/material/table";
import {LandingNewsModule} from "../landing-news/landing-news.module";
import {LoadingModule} from "ngx-loading";
import { NewsWidgetComponent } from './components/news-widget/news-widget.component';

export function sharedNewsConfigService() {
    return sharedProviderResolver('newsConfigService');
}

@NgModule({
    declarations: [
        NewsComponent,
        CustomNewsComponent,
        NewsRootComponent,
        NewsWidgetComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        UIModule,
        LocalizationModule,
        EducationalTipsModule,
        SharedModule,
        MatTabsModule,
        PaginatorModule,
        ForumSharedModule,
        MarkdownModule,
        DatatableModule,
        NewsRouterModule,
        BrokerModule,
        WrapperModule,
        LoaderModule,
        TimeZonesModule,
        MatTableModule,
        LoadingModule,
    ],
    exports: [
        NewsComponent,
        RouterModule,
    ],
    entryComponents: [
        NewsRootComponent,
        NewsWidgetComponent
    ],
    providers: [
        NewsManagerResolver,
        NewsResolver,
        LastNewsResolver,
        NewsRestService,
        NewsPopularTagsResolver,
        {
            provide: NewsTranslateService,
            useFactory: TranslateServiceFactory('news'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class NewsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NewsModule,
            providers: [
                NewsConfigService
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: NewsModule,
            providers: [
                {
                    provide: NewsConfigService,
                    useFactory: sharedNewsConfigService
                }
            ]
        };
    }
}
