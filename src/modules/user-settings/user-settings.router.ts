import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from "./components/root/root.component";
import {ProfileUserComponent} from "./components/profile-user/profile-user.component";
import {ProfileActivitiesComponent} from "./components/new-profile-activities/profile-activities.component";
import {DepositsComponent} from "./components/deposits-user/deposits.component";
import {WithdrawsComponent} from "./components/withdraws-user/withdraws.component";
import {TradesComponent} from "./components/trades/trades.component";
import {UserSettingsRoutes} from "./user-settings.routes";
import {TradesResolver} from "./resolvers/trades.resolver";
import {ProfileActivitiesLoginComponent} from "./components/profile-activities-login/profile-activities-login.component";
import {ProfileActivitiesResolver} from "./resolvers/profile-activities.resolver";
import {ProfileLoginActivitiesResolver} from "./resolvers/login-activities.resolver";
import {IActivityResolver} from "./models/models";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";

export const routes: Routes = [
    {
        path: '',
        component: RootComponent,
        children: [
            {
                path: '',
                redirectTo: UserSettingsRoutes.Profile
            },
            {
                path: UserSettingsRoutes.Profile,
                component: ProfileUserComponent
            },
            {
                path: UserSettingsRoutes.Trades,
                // resolve: {
                //     trades: TradesResolver
                // },
                component: TradesComponent,
            },
            {
                path: UserSettingsRoutes.Deposits,
                component: DepositsComponent
            },
            {
                path: UserSettingsRoutes.Withdraws,
                component: WithdrawsComponent
            },
            {
                path: UserSettingsRoutes.Activities,
                component: ProfileActivitiesComponent,
                resolve: {
                    // activities: ProfileActivitiesResolver
                } as IActivityResolver,
            },
            {
                path: UserSettingsRoutes.LoginActivities,
                component: ProfileActivitiesLoginComponent,
                resolve: {
                    // activities: ProfileLoginActivitiesResolver
                } as IActivityResolver,
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
export class UserSettingsRouterModule {
}
