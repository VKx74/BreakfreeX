import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {MarkdownInputResolver} from "../../app/resolvers/markdown-input.resolver";
import {LastNewsResolver} from "../Admin/resolvers/last-news.resolver";
import {NewsPopularTagsResolver} from "../Admin/resolvers/news-popular-tags.resolver";
import {TabsAlertsComponent} from "./components/tabs-alerts/tabs-alerts.component";
import {AlertWidgetComponent} from "./components/new-alert-widget/alert-widget.component";
import {AlertLogWidgetComponent} from "./components/alert-log-widget/alert-log-widget.component";
import {AutoTradingAlertsRoutes} from "./auto-trading-alerts.routes";


const routes: Routes = [
    {
        path: '',
        component: TabsAlertsComponent,
        children: [
            {
                path: '',
                redirectTo: AutoTradingAlertsRoutes.Alerts
            },
            {
                path: AutoTradingAlertsRoutes.Alerts,
                component: AlertWidgetComponent
            },
            {
                path: AutoTradingAlertsRoutes.AlertsLog,
                component: AlertLogWidgetComponent
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AutoTradingAlertsRouterModule {
}
