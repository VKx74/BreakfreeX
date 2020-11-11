import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./services/auth/auth.guard";
import {AppRoutes} from "./app.routes";
import {IRoleGuardConfig, RoleGuard} from "./services/role/role.guard";
import {Roles} from "@app/models/auth/auth.models";
import {UnauthorizedGuard} from "@app/services/auth/unauthorized.guard";
import {ComponentsGuard} from "@app/guards/components.guard";
import {AppComponent} from "@app/app.component";
import {PopupWindowGuard} from "../modules/popup-window/popup-window.guard";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";

const routes: Routes = [
    {
        path: '',
        component: AppComponent,
        resolve: {
            userSettings: UserSettingsResolver
        },
        children: [
            {
                path: 'popup-window',
                loadChildren: () => import('../modules/popup-window/popup-window.module').then(m => m.PopupWindowModule),
                canLoad: [ComponentsGuard],
                canActivate: [PopupWindowGuard],
                canDeactivate: [PopupWindowGuard],
            },
            {
                path: AppRoutes.Landing,
                loadChildren: () => import('../modules/Landing/landing.module').then(m => m.LandingModule),
                canLoad: [ComponentsGuard],
                canActivate: [AuthGuard]
            },
            {
                path: AppRoutes.ClearSession,
                pathMatch: 'full',
                loadChildren: () => import('../modules/platform/platform.module').then(m => m.PlatformModule),
                canLoad: [AuthGuard, ComponentsGuard],
                canActivate: [AuthGuard]
            },
            {
                path: AppRoutes.Platform,
                // pathMatch: 'full',
                loadChildren: () => import('../modules/platform/platform.module').then(m => m.PlatformModule),
                canLoad: [AuthGuard, ComponentsGuard],
                canActivate: [AuthGuard]
            },
            {
                path: AppRoutes.Pages,
                // pathMatch: 'full',
                loadChildren: () => import('../modules/Pages/pages.module').then(m => m.PagesModule),
                // canLoad: [ComponentsGuard],
                // canActivate: [AuthGuard]
            },
            {
                path: AppRoutes.Admin,
                loadChildren: () => import('../modules/Admin/admin.module').then(m => m.AdminModule),
                canLoad: [AuthGuard, ComponentsGuard],
                canActivate: [AuthGuard, RoleGuard],
                data: {
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.KYCOfficer,
                            Roles.SocialMediaOfficer,
                            Roles.SystemMonitoringOfficer,
                            Roles.NewsOfficer,
                            Roles.SupportOfficer,
                        ],
                        redirectUrl: `/${AppRoutes.Platform}`
                    } as IRoleGuardConfig
                },
            },
            {
                path: AppRoutes.Auth,
                loadChildren: () => import('../modules/Auth/auth.module').then(m => m.AuthModule),
                canActivate: [UnauthorizedGuard]
            },
            {
                path: '**',
                redirectTo: AppRoutes.Auth
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true, enableTracing: false})],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
