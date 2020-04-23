import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";
import {LastNewsResolver} from "../Admin/resolvers/last-news.resolver";
import {NewsPopularTagsResolver} from "../Admin/resolvers/news-popular-tags.resolver";
import {NewsComponent} from "./components";
import {NewsRootComponent} from "./components";
import {CustomNewsComponent} from "./components";

const routes: Routes = [
    {
        path: '',
        component: NewsRootComponent,
        resolve: {
            assets: MarkdownInputResolver,
            lastNews: LastNewsResolver,
            popularTags: NewsPopularTagsResolver,
        },
        children: [
            {
                path: '',
                redirectTo: 'rss'
            },
            {
                path: 'rss',
                component: NewsComponent
            },
            {
                path: 'custom',
                component: CustomNewsComponent
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class NewsRouterModule {
}
