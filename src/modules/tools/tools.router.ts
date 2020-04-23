import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PublicChatComponent} from "../Chat/components/public-chat/public-chat.component";
import {PrivateChatComponent} from "../Chat/components/private-chat/private-chat.component";
import {ToolsComponent} from "./components/tools/tools.component";
import {ToolsRoutes} from "./tools.routes";
import {EconomicCalendarComponent} from "@calendarEvents/components/economic-calendar/economic-calendar.component";
import {NotificationWidgetComponent} from "../Notifications/components/notification-widget/notification-widget.component";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";

const routes: Routes = [
    {
        path: '',
        component: ToolsComponent,
        children: [
            {
                path: '',
                redirectTo: ToolsRoutes.news
            },
            {
                path: ToolsRoutes.news,
                loadChildren: () => import('../News/news.module').then(m => m.NewsModule),
            },
            {
                path: ToolsRoutes.publicChat,
                component: PublicChatComponent
            },
            {
                path: ToolsRoutes.privateChat,
                component: PrivateChatComponent
            },
            {
                path: ToolsRoutes.trends,
                loadChildren: () => import('../trends/trends.module').then(m => m.TrendsModule)
            },
            {
                path: ToolsRoutes.alertsManager,
                loadChildren: () => import('../AutoTradingAlerts/auto-trading-alerts.module').then(m => m.AutoTradingAlertsModule),
            },
            {
                path: ToolsRoutes.economicCalendar,
                component: EconomicCalendarComponent
            },
            {
                path: ToolsRoutes.notifications,
                component: NotificationWidgetComponent,
                resolve: {
                    assets: MarkdownInputResolver
                },
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ToolsRoutingModule {
}
