import {IRSSFeed, IRSSFeedConfig} from "../models/models";
import {Observable, of, Subject} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";

@Injectable({
    providedIn: "root"
})
export class NewsConfigService {

    private availableFeeds: IRSSFeed[] = [];
    private selectedFeed: IRSSFeed;

    public onDefaultFeedChanged: Subject<IRSSFeed> = new Subject<IRSSFeed>();

    constructor(private _http: HttpClient) {
        this.availableFeeds.push({
            id: '0',
            link: `${AppConfigService.apiUrls.cointelegraphRssFeedREST}`,
            name: 'Cointelegraph'
        },
        {
            id: '1',
            link: `${AppConfigService.apiUrls.coindeskRssFeedREST}`,
            name: 'Coindesk'
        });
    }

    getAvailableFeeds(): Observable<IRSSFeed[]> {

        // todo: if needs check is feed alive
        return of(this.availableFeeds);
    }

    getSelectedFeed(): IRSSFeed {
        return this.selectedFeed ? this.selectedFeed : this.availableFeeds[0];
    }

    setDefaultFeed(feed: IRSSFeed) {
        // todo: validate feed
        let exists = false;
        for (let i = 0; i < this.availableFeeds.length; i++) {
            if (this.availableFeeds[i].link === feed.link && this.availableFeeds[i].name === feed.name) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            return;
        }

        if (this.selectedFeed && this.selectedFeed.link === feed.link) {
            return;
        }

        this.selectedFeed = feed;
        this.onDefaultFeedChanged.next(this.selectedFeed);
    }

    saveState(): IRSSFeedConfig {
        return {
            defaultFeed: this.selectedFeed
        };
    }

    loadState(state: IRSSFeedConfig) {
        if (state && state.defaultFeed) {
            this.setDefaultFeed(state.defaultFeed);
        }
    }

}
