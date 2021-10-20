import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {BreakfreeTradingSocialTranslateService} from "./localization/token";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {TimeZonesModule} from "TimeZones";
import {MatDialogModule} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import {HistoryService} from "@app/services/history.service";
import {SharedModule} from "Shared";
import { UIModule } from 'UI';
import { FormsModule } from '@angular/forms';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { MatInputModule } from '@angular/material/input';
import { LoaderModule } from 'modules/loader/loader.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { StorageModule } from 'modules/Storage/storage.module';
import { SonarFeedComponent } from './components/sonar-feed/sonar-feed.component';
import { SonarFeedWallComponent } from './components/sonar-feed-wall/sonar-feed-wall.component';
import { SonarFeedWidgetComponent } from './components/sonar-feed-widget/sonar-feed-widget.component';
import { SonarFeedCardComponent } from './components/sonar-feed-card/sonar-feed-card.component';
import { SonarChartComponent } from './components/sonar-chart/sonar-chart.component';
import { DataFeedBase } from '@chart/datafeed/DataFeedBase';
import { SonarChartDataFeed } from '@chart/datafeed/SonarChartDataFeed';
import { SonarChartIndicatorDataProviderService } from '@chart/services/indicator-data-provider.service';
import { SonarFeedService } from './services/sonar.feed.service';
import { SonarFeedSocketService } from './services/sonar.feed.socket.service';
import { SonarFeedCommentComponent } from './components/sonar-feed-comment/sonar-feed-comment.component';
import { InstrumentCacheService } from './services/instrument.cache.service';
import { SocialReactionsService } from './services/social.reactions.service';
import { SonarTimeFilterComponent } from './components/sonar-time-filter/sonar-time-filter.component';

@NgModule({
    // components here
    declarations: [
        SonarFeedWallComponent,
        SonarFeedComponent,
        SonarFeedWidgetComponent,
        SonarFeedCardComponent,
        SonarChartComponent,
        SonarFeedCommentComponent,
        SonarTimeFilterComponent
    ],
    imports: [
        CommonModule,
        StorageModule,
        LocalizationModule,
        EducationalTipsModule,
        MatDialogModule,
        TimeZonesModule,
        MatMenuModule,
        MatInputModule,
        SharedModule,
        MatTabsModule,
        UIModule,
        FormsModule,
        LoaderModule,
        MatFormFieldModule,
        MatSelectModule
    ],
    // components here
    entryComponents: [
        SonarFeedWidgetComponent,
        SonarFeedComponent
    ],
    // components here
    exports: [
        SonarFeedWidgetComponent,
        SonarFeedComponent,
        SonarFeedWallComponent
    ],
    providers: [
        SonarChartIndicatorDataProviderService,
        {
            provide: BreakfreeTradingSocialTranslateService,
            useFactory: TranslateServiceFactory('BreakfreeTradingSocial'),
            deps: [Injector, SharedTranslateService]
        },
        {
            provide: DataFeedBase,
            useClass: SonarChartDataFeed
        }
    ]
})
export class BreakfreeTradingSocialModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: BreakfreeTradingSocialModule,
            providers: [
                SonarFeedService,
                SonarFeedSocketService,
                InstrumentCacheService,
                SocialReactionsService
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: BreakfreeTradingSocialModule,
            providers: [
            ]
        };
    }
}
