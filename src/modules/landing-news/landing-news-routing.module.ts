import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LandingNewsComponent} from "./Components/landing-news/landing-news.component";
import {NewsPopularTagsResolver} from "../Admin/resolvers/news-popular-tags.resolver";
import {LastNewsResolver} from "../Admin/resolvers/last-news.resolver";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";
import {NewsResolver} from "../Admin/resolvers/news.resolver";
import {NewsManagerResolver} from "../Admin/resolvers/news-manager.resolver";
import {NewsSummaryComponent} from "./Components/news-summary/news-summary.component";
import {NewsItemFullComponent} from "./Components/news-item-full/news-item-full.component";

const routes: Routes = [
  {
    path: '',
    component: LandingNewsComponent,
    resolve: {
      assets: MarkdownInputResolver,
      lastNews: LastNewsResolver,
      popularTags: NewsPopularTagsResolver,
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    children: [
      {
        path: '',
        component: NewsSummaryComponent,
        resolve: {
          news: NewsManagerResolver,
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {
        path: ':id',
        component: NewsItemFullComponent,
        resolve: {
          news: NewsResolver
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingNewsRoutingModule { }
