import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlatformComponent} from "./components/platform/platform.component";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";
import {DashboardComponent} from "@platform/components/dashboard/dashboard.component";
import {DashboardResolver} from "@app/resolvers/dashboard.resolver";
import { AppRoutes } from '@app/app.routes';

const routes: Routes = [
    {
        path: '',
        component: PlatformComponent,
        resolve: {
            userSettings: UserSettingsResolver,
            data: DashboardResolver,
        },
        children: [
            {
                path: '',
                component: DashboardComponent,
                resolve: {
                    assets: MarkdownInputResolver,
                },
            },
            {
                path: 'settings',
                loadChildren: () => import('../user-settings/user-settings.module').then(m => m.UserSettingsModule),
            },
            {
                path: 'tools',
                loadChildren: () => import('../tools/tools.module').then(m => m.ToolsModule),
            },
            {
                path: 'scripting',
                loadChildren: () => import('../scripting-page/scripting-page.module').then(m => m.ScriptingPageModule),
            },
            {
                path: AppRoutes.Academy,
                loadChildren: () => import('../Academy/academy.module').then(m => m.AcademyModule)
            },
            {
                path: AppRoutes.Academy + '/:id',
                loadChildren: () => import('../Academy/academy.module').then(m => m.AcademyModule)
            },
            {
                path: AppRoutes.SocialFeed,
                loadChildren: () => import('../SocialFeed/social-feed.module').then(m => m.SocialFeedModule)
            },
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
export class PlatformRoutingModule {
}

