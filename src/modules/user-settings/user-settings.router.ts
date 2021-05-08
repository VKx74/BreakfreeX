import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RootComponent} from "./components/root/root.component";
import {ProfileUserComponent} from "./components/profile-user/profile-user.component";
import {ProfileActivitiesComponent} from "./components/new-profile-activities/profile-activities.component";
import {UserSettingsRoutes} from "./user-settings.routes";
import {ProfileActivitiesLoginComponent} from "./components/profile-activities-login/profile-activities-login.component";
import {IActivityResolver} from "./models/models";

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
