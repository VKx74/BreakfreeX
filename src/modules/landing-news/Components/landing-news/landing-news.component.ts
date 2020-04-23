import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {NewsService} from "../../../Admin/services/news.service";
import {INews, INewsPopularTag} from "../../../News/models/models";
import {IPaginationResponse} from "@app/models/pagination.model";
import {TitleManager} from "../title-manager";
import {filter} from "rxjs/operators";

export interface IResolvedData {
  lastNews: IPaginationResponse<INews>;
  popularTags: INewsPopularTag[];
}

@Component({
  selector: 'landing-news',
  templateUrl: './landing-news.component.html',
  styleUrls: ['./landing-news.component.scss']
})
export class LandingNewsComponent implements OnInit {
  lastNews: INews[];
  popularTags: INewsPopularTag[];

  get getTitle() {
    return TitleManager.title;
  }


  constructor(private _router: ActivatedRoute,
              private _route: Router
              ,
              ) { }

  ngOnInit() {
    const resolvedData = this._router.snapshot.data as IResolvedData;
    this.lastNews = resolvedData.lastNews ? resolvedData.lastNews.items : [];
    this.popularTags = resolvedData.popularTags ? resolvedData.popularTags : [];

    this._route.events
        .pipe(
            filter(e => e instanceof NavigationEnd)
        )
        .subscribe((params: RouterEvent) => {
          // The ЖОСТКИЙ КОСТИЛЬ
          // TODO: Rewrite по-людськи
          if (params.url.split('/').length > 2) {
            TitleManager.reset();
          }
        });

  }

}
