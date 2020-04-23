import {Injector, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingNewsRoutingModule } from './landing-news-routing.module';
import { LandingNewsComponent } from './Components/landing-news/landing-news.component';
import {ForumSharedModule} from "../ForumShared/forum-shared.module";
import {SidebarComponent} from "./Components/sidebar/sidebar.component";
import {SidebarModule} from "../sidebar/sidebar.module";
import {SharedModule} from "Shared";
import {NewsPopularTagsResolver} from "../Admin/resolvers/news-popular-tags.resolver";
import {NewsRestService} from "../News/services";
import {LastNewsResolver} from "../Admin/resolvers/last-news.resolver";
import {NewsResolver} from "../Admin/resolvers/news.resolver";
import {NewsManagerResolver} from "../Admin/resolvers/news-manager.resolver";
import {NewsTranslateService} from "../News/localization/news.token";
import {SharedTranslateService} from "@app/localization/shared.token";
import {TranslateServiceFactory} from "Localization";
import {NewsSummaryComponent} from "./Components/news-summary/news-summary.component";
import {NewsItemFullComponent} from "./Components/news-item-full/news-item-full.component";
import {PaginatorModule} from "@paginator/paginator.module";
import {MarkdownModule} from "../Markdown/markdown.module";
import {TimeZonesModule} from "TimeZones";

@NgModule({
  declarations: [
      LandingNewsComponent,
      SidebarComponent,
      NewsSummaryComponent,
      NewsItemFullComponent
  ],
    imports: [
        CommonModule,
        LandingNewsRoutingModule,
        ForumSharedModule,
        SidebarModule,
        SharedModule,
        PaginatorModule,
        MarkdownModule,
        TimeZonesModule,
    ],
  exports: [
      LandingNewsComponent
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
export class LandingNewsModule { }
