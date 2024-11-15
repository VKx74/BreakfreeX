import {Injector, ModuleWithProviders, NgModule} from "@angular/core";
import {NotificationWidgetComponent} from "./components/notification-widget/notification-widget.component";
import {TranslateModule} from "@ngx-translate/core";
import {TranslateServiceFactory} from "Localization";
import {NotificationsTranslateService} from "./localization/token";
import {SystemNotificationsComponent} from "./components/system-notifications/system-notifications.component";
import {InviteNotificationsComponent} from './components/invite-notifications/invite-notifications.component';
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import {MarkdownModule} from "../Markdown/markdown.module";
import {CommonModule} from "@angular/common";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import { SystemPopUpNotificationsService } from "./services/system-popup-notifications.service";

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        UIModule,
        MarkdownModule,
        EducationalTipsModule,
        SharedModule
    ],
    declarations: [
        NotificationWidgetComponent,
        SystemNotificationsComponent,
        InviteNotificationsComponent
    ],
    exports: [
        NotificationWidgetComponent
    ],
    providers: [
        SystemPopUpNotificationsService,
        {
            provide: NotificationsTranslateService,
            useFactory: TranslateServiceFactory('notifications'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class NotificationsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NotificationsModule,
            providers: [
                SystemPopUpNotificationsService
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: NotificationsModule,
            providers: [
                SystemPopUpNotificationsService
            ]
        };
    }
}
