import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTabsModule} from "@angular/material/tabs";
import {ToolsRoutingModule} from "./tools.router";
import {ChatModule} from "../Chat/chat.module";
import {SharedModule} from "Shared";
import {WrapperModule} from "../ViewModules/wrapper/wrapper.module";
import {ToolsComponent} from "./components/tools/tools.component";
import {NewsModule} from "News";
import {CalendarEventsModule} from "@calendarEvents/calendar-events.module";
import {NotificationsModule} from "../Notifications/notifications.module";

@NgModule({
    declarations: [
        ToolsComponent,
    ],
    imports: [
        CommonModule,
        ToolsRoutingModule,
        MatTabsModule,
        ChatModule,
        CalendarEventsModule,
        SharedModule,
        WrapperModule,
        NewsModule,
        NotificationsModule,
    ],
})
export class ToolsModule {
}
