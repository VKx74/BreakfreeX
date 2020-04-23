import {Injectable} from "@angular/core";
import {Observable, of, ReplaySubject, Subject} from "rxjs";
import {IdentityService} from "@app/services/auth/identity.service";
import {DataStorage} from "../../modules/Storage/services/data-storage";
import {IAppEducationalTipsLinks} from "@app/models/app-educational-tips-links";
import {HttpClient} from "@angular/common/http";
import {ComponentIdentifier} from "@app/models/app-config";
import {catchError, map, tap} from "rxjs/operators";
import {ProcessState, ProcessStateType} from "@app/helpers/ProcessState";

export const TipsFilePath = 'assets/links/educational-tips-links.json';

@Injectable()
export class EducationalTipsService {
    private _showTips = false;
    private _linksList$ = new ReplaySubject(1);
    private _initLinksListState: ProcessState = new ProcessState(ProcessStateType.None);
    showTipsChange$ = new Subject<boolean>();

    constructor(private _identityService: IdentityService,
                private _http: HttpClient) {
    }

    isTipsShown(): boolean {
        return this._showTips;
    }

    changeShowTips(show: boolean) {
        if (show !== this._showTips) {
            this._showTips = show;
            this.showTipsChange$.next(show);
        }
    }

    getLinksList(): Observable<IAppEducationalTipsLinks> {
        if (this._initLinksListState.isNone()) {
            this._initLinksListState.setPending();

            return this._http.get<IAppEducationalTipsLinks>(`${TipsFilePath}`)
                .pipe(
                    tap({
                        next: (links: IAppEducationalTipsLinks) => {
                            this._linksList$.next(links);
                            this._initLinksListState.setSucceeded();
                        },
                        error: (e) => {
                            this._linksList$.error(e);
                            this._initLinksListState.setFailed();
                        }
                    })
                );
        }

        return this._linksList$.asObservable() as Observable<IAppEducationalTipsLinks>;
    }

    getLinkForComponent(compName: ComponentIdentifier): Observable<any> {
        return this.getLinksList()
            .pipe(
                map((list: IAppEducationalTipsLinks) => {
                    return list[compName];
                }),
                catchError(() => {
                    return of(null);
                })
            );
    }
}
