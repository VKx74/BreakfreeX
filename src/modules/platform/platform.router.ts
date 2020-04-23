import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlatformComponent} from "./components/platform/platform.component";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";
import {DashboardComponent} from "@platform/components/dashboard/dashboard.component";
import {DashboardResolver} from "@app/resolvers/dashboard.resolver";

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
export class PlatformRoutingModule {
}

