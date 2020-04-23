import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {INews} from "../../../News/models/models";

interface ResolvedData {
    news: INews;
}

@Component({
    selector: 'news-item-full',
    templateUrl: './news-item-full.component.html',
    styleUrls: ['./news-item-full.component.scss']
})
export class NewsItemFullComponent implements OnInit {
    news: INews;

    get markdown() {
        return this.news ? this.news.content : '';
    }

    constructor(private _route: ActivatedRoute,
                private _router: Router) {
    }

    ngOnInit() {
        this._route.data.subscribe((data: ResolvedData) => {
            if (data.news) {
                this.news = data.news;
            } else {
                this._router.navigate(['/landing/news']);
            }
        });
    }

}
