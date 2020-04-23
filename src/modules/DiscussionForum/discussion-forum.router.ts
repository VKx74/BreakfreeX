import {Route, RouterModule, Routes} from "@angular/router";
import {RootComponent} from "./components/root/root.component";
import {NgModule} from "@angular/core";
import {DiscussionsForumRoutes} from "./discussion-forum.routes";
import {DiscussionsComponent} from "./components/discussions/discussions.component";
import {DiscussionsResolver} from "./resolvers/discussions.resolver";
import {DiscussionDetailedComponent} from "./components/discussion-detailed/discussion-detailed.component";
import {DiscussionDetailedResolver} from "./resolvers/discussion-detailed.resolver";
import {CreateDiscussionComponent} from "./components/create-discussion/create-discussion.component";
import {MarkdownInputResolver} from "../../app/resolvers/markdown-input.resolver";
import {EditDiscussionComponent} from "./components/edit-discussion/edit-discussion.component";
import {ForumType} from "./enums/enums";
import {SearchDiscussionsComponent} from "./components/search-discussions/search-discussions.component";
import {SearchDiscussionsResolver} from "./resolvers/search-discussions.resolver";
import {CategoriesComponent} from "./components/categories/categories.component";
import {CategoriesResolver} from "./resolvers/categories.resolver";
import {CreateUpdateDiscussionResolver} from "./resolvers/create-update-discussion.resolver";
import {ForumsComponent} from "./components/forums/forums.component";
import {EditDiscussionResolver} from "./resolvers/edit-discussion.resolver";
import {ForumsPageResolver} from "./resolvers/forums-page.resolver";

const forumRoutes = [
    {
        path: DiscussionsForumRoutes.Discussions,
        component: DiscussionsComponent,
        resolve: {
            resolverData: DiscussionsResolver
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange'
    },
    {
        path: `${DiscussionsForumRoutes.Discussions}/create`,
        component: CreateDiscussionComponent,
        resolve: {
            resolverData: CreateUpdateDiscussionResolver
        }
    },
    {
        path: `${DiscussionsForumRoutes.Discussions}/:id`,
        component: DiscussionDetailedComponent,
        resolve: {
            resolverData: DiscussionDetailedResolver
        },
        data: {
            reuse: false
        },
        runGuardsAndResolvers: "always"
    },
    {
        path: `${DiscussionsForumRoutes.Discussions}/edit/:id`,
        component: EditDiscussionComponent,
        resolve: {
            resolverData: EditDiscussionResolver
        }
    },
    {
        path: '',
        redirectTo: DiscussionsForumRoutes.Discussions
    }
] as Route[];

const routes: Routes = [
    {
        path: '',
        component: RootComponent,
        resolve: {
            assets: MarkdownInputResolver
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: ForumsComponent,
                resolve: {
                    resolverData: ForumsPageResolver
                }
            },
            {
                path: 'investor',
                children: forumRoutes,
                data: {
                    forumType: ForumType.Investor
                }
            },
            {
                path: 'basic-trader',
                children: forumRoutes,
                data: {
                    forumType: ForumType.BasicTrader
                }
            },
            {
                path: 'advanced-trader',
                children: forumRoutes,
                data: {
                    forumType: ForumType.AdvancedTrader
                }
            },
            {
                path: 'institutional',
                children: forumRoutes,
                data: {
                    forumType: ForumType.Institutional
                }
            },
            {
                path: DiscussionsForumRoutes.Search,
                component: SearchDiscussionsComponent,
                resolve: {
                    resolverData: SearchDiscussionsResolver
                },
                data: {
                    reuse: false
                },
                runGuardsAndResolvers: 'paramsOrQueryParamsChange'
            },
            {
                path: DiscussionsForumRoutes.Categories,
                component: CategoriesComponent,
                resolve: {
                    resolverData: CategoriesResolver
                },
                data: {
                    reuse: false
                },
                runGuardsAndResolvers: 'paramsOrQueryParamsChange'
            },
            {
                path: '**',
                redirectTo: ''
            }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DiscussionForumRouter {
}
