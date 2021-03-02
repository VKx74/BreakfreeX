import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/typings/paginator";
import { ActivatedRoute } from "@angular/router";
import { ComponentIdentifier } from "@app/models/app-config";
import { IPaginationResponse, PaginationHandler, PaginationParams } from "@app/models/pagination.model";
import { IPaginatedDataLoadingResult } from "modules/Admin/data/models";
import { MTAccData, UserMTData } from "modules/Admin/data/tp-monitoring/TPMonitoringData";
import { MTAccountDTO, UserMTAccounts } from "modules/Admin/data/tp-monitoring/TPMonitoringDTO";
import { TPMonitoringService } from "modules/Admin/services/tp-monitoring.service";
import { merge } from "rxjs";
import { Observable, of, Subject } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { SearchHandler } from "UI";

@Component({
    selector: 'tp-monitoring',
    templateUrl: 'tp-monitoring.component.html',
    styleUrls: ['tp-monitoring.component.scss']
})
export class TPMonitoringComponent implements OnInit {
    showSpinner: boolean;
    paginationHandler: PaginationHandler = new PaginationHandler();
    searchHandler: SearchHandler;
    search$ = new Subject<string>();
    query: string;
    processing: boolean = false;
    pageSize = 50;

    constructor(private _tpMonitoringService: TPMonitoringService,
        private _activatedRoute: ActivatedRoute) {
        merge(
            this.paginationHandler.onPageChange$
                .pipe(map((e: PageEvent) => this._loadItems(e))),
            this.search$.pipe(map((query: string) => this._search(query)))
        )
            .pipe(
                tap(() => this.processing = true),
                switchMap((obs: Observable<any>) => obs)
            )
            .subscribe((result: IPaginatedDataLoadingResult<UserMTAccounts>) => {
                this.processing = false;
                this.MapUserData(result.items);

                this.paginationHandler.setPaginationData({
                    pageIndex: result.pageIndex,
                    itemsCount: result.itemsCount,
                    pageSize: result.pageSize
                });
            });
    }

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    public Users: Array<UserMTData> = new Array<UserMTData>();

    ngOnInit(): void {
        (this._activatedRoute.snapshot.data['users'] as Observable<IPaginationResponse<UserMTAccounts>>)
            .subscribe({
                next: (users: IPaginationResponse<UserMTAccounts>) => {
                    this.MapUserData(users.items);
                    this.paginationHandler.setPaginationData({
                        pageIndex: 0,
                        itemsCount: users.total,
                        pageSize: this.pageSize
                    });
                }
            });

        this.search$.pipe(
            map((query: string) => this._search(query))
        );

        this.searchHandler = {
            onSearch: (query: string) => {
                return this.handleSearch(query);
            },
            onSearchCompleted: (result: UserMTAccounts[]) => { },
            onSearchError: (error: any, query: string) => { }
        };
    }

    handleSearch(query: string): Observable<UserMTAccounts[]> {
        this.search(query);
        return of(null);
    }

    search(query: string) {
        this.search$.next(query);
    }

    private _search(query: string): Observable<IPaginatedDataLoadingResult<UserMTAccounts>> {
        this.query = query;
        return this._loadItems();
    }

    private _loadItems(event?: PageEvent): Observable<IPaginatedDataLoadingResult<UserMTAccounts>> {
        const pageIndex = event ? event.pageIndex : 0;
        const pageSize = event ? event.pageSize : this.pageSize;
        const skip = pageIndex * pageSize;
        this.showSpinner = true;
        return this._tpMonitoringService.getUsers(new PaginationParams(skip, pageSize), { selectQuery: this.query })
            .pipe(
                map((users: IPaginationResponse<UserMTAccounts>) => {
                    this.showSpinner = false;
                    return {
                        itemsCount: users.total,
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                        items: users.items
                    };
                })
            );
    }

    private MapUserData(userMTAccounts: Array<UserMTAccounts>) {
        let users = new Array<UserMTData>();
        userMTAccounts.forEach(item => {
            users.push(new UserMTData(item.userId, item.name, item.email, item.accounts));
        });
        this.Users = new Array<UserMTData>();
        this.Users = users;
    }
}