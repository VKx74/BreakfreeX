import {RouterModule, Routes} from "@angular/router";
import {LandingRoutes} from "./landing.routes";
import {LandingComponent} from "./components/landing/landing.component";
import {NgModule} from "@angular/core";
import {IForumRouteData, TagGuard} from "@app/services/role/tag.guard";
import {ComponentIdentifier} from "@app/models/app-config";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        resolve: {
            userSettings: UserSettingsResolver,
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: LandingRoutes.QA,
            },
            {
                path: LandingRoutes.News,
                loadChildren: () => import('../landing-news/landing-news.module').then(m => m.LandingNewsModule),
                canActivate: [TagGuard],
                data: {
                    identifier: ComponentIdentifier.news
                } as IForumRouteData,
            },
            {
                path: LandingRoutes.QA,
                loadChildren: () => import('../Qa/qa.module').then(m => m.QaModule),
                canActivate: [TagGuard],
                data: {
                    identifier: ComponentIdentifier.adminQA
                } as IForumRouteData,
            },
            {
                path: LandingRoutes.Forums,
                loadChildren: () => import('../DiscussionForum/discussions-forum.module').then(m => m.DiscussionsForumModule),
                canActivate: [TagGuard],
                data: {
                    identifier: ComponentIdentifier.forum
                } as IForumRouteData,
            },
            {
                path: '*',
                redirectTo: '',
            }
        ]
    },
    {
        path: '*',
        redirectTo: '',
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LandingRouterModule {
}
