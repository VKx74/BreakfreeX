import {IChannel, INewsMessage, IRSSFeed} from "../models/models";
import {Observable, of, Subject} from "rxjs";
import {Injectable} from "@angular/core";
import {catchError, map} from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";
import {NewsConfigService} from "./news.config.service";
import {AuthInterceptorSkipHeader} from "@app/services/auth/constants";

@Injectable()
export class NewsRestService {

    private newsFeed: IRSSFeed;
    private subscription;
    private maxNewsCount = 14;

    protected get key(): string {
        return 'news';
    }


    public onReloadNeeded: Subject<void> = new Subject<void>();

    constructor(private _http: HttpClient,
                private _rssConfig: NewsConfigService) {
        this.newsFeed = this._rssConfig.getSelectedFeed();
        this.subscription = this._rssConfig.onDefaultFeedChanged.subscribe(value => {
            this.newsFeed = this._rssConfig.getSelectedFeed();
            this.onReloadNeeded.next();
        });
    }

    getNews(): Observable<IChannel> {
        return this._http.get(this.newsFeed.link, {
            responseType: 'text',
            headers: {
                [AuthInterceptorSkipHeader]: ""
            }

        }).pipe(
            catchError(error => {
                return of(error);
            }),
            map((response: any) => {
                return this._parseXML(response);
            })
        );
    }

    getNewsBySource(source: string): Observable<IChannel> {
        return this._http.get(source, {
            responseType: 'text',
            headers: {
                [AuthInterceptorSkipHeader]: ""
            }
        }).pipe(
            catchError(error => {
                return of(error);
            }),
            map((response: any) => {
                return this._parseXML(response);
            })
        );
    }

    private _parseXML(xmlString: string): IChannel {
        let resItems: INewsMessage[] = [];
        let res: IChannel = {
            items: resItems,
            description: 'RSS Feed',
            link: '',
            title: ''
        };

        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xmlString, "text/xml");

        let channel = xmlDoc.getElementsByTagName('channel')[0];
        if (channel) {
            const channelTitle = channel.getElementsByTagName('title')[0];
            const channelDescription = channel.getElementsByTagName('description')[0];
            const channelLink = channel.getElementsByTagName('link')[0];

            if (channelTitle) {
                res.title = channelTitle.textContent;
            }
            if (channelDescription) {
                res.description = channelDescription.textContent;
            }
            if (channelLink) {
                res.link = channelLink.textContent;
            }
        }

        let items = xmlDoc.getElementsByTagName('item');
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const title = item.getElementsByTagName('title')[0].textContent;
            const link = item.getElementsByTagName('link')[0].textContent;
            const pubDate = item.getElementsByTagName('pubDate')[0].textContent;
            const description = item.getElementsByTagName('description')[0].textContent;
            let imageSrc = null;

            if ( item.getElementsByTagName('enclosure')[0]) {
                imageSrc = item.getElementsByTagName('enclosure')[0].attributes.getNamedItem('url').value;
            }

            resItems.push({
                imageSrc,
                title: title,
                link: link,
                text: this._parseDescription(description),
                time: new Date(pubDate).getTime()
            });

            if (resItems.length >= this.maxNewsCount) {
                break;
            }

        }

        return res;
    }

    private _parseDescription(description: string): string {
        if (description.indexOf('<p>') === -1) {
            return description;
        }

        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(description, "text/xml");
        let pNode = xmlDoc.getElementsByTagName('p')[0];
        if (pNode) {
            return pNode.textContent;
        } else {
            const img = (/<img[^>]+>/);
            return description.replace(img, '');
        }

    }

}
