import {Injectable} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {merge, Observable, Subject, of} from "rxjs";
import {UserModel} from "@app/models/auth/auth.models";
import {JsUtil} from "../../../../utils/jsUtil";
import {AppMemberModel, AppMemberModelFactory} from "./app-member";
import {PersonalInfoStatus} from "@app/services/personal-info/personal-info.service";
import {PageEvent} from "@angular/material/paginator";
import {UsersService} from "@app/services/users.service";
import {map, switchMap, tap} from "rxjs/operators";
import {IPaginatedDataLoadingResult} from "../../data/models";
import {PaginationHandler, IPaginationResponse, PaginationParams} from "@app/models/pagination.model";

export enum PersonalInfoStatusFilter {
    All,
    None,
    Pending,
    Approve,
    Rejected
}

@Injectable()
export class AppMembersVM {
    paginationHandler: PaginationHandler = new PaginationHandler();
    private _allUsers: UserModel[] = [];
    private pageSize = 50;
    private query: string;
    items: AppMemberModel[] = [];

    filters: PersonalInfoStatusFilter[] = JsUtil.numericEnumToArray(PersonalInfoStatusFilter);
    activeFilter: PersonalInfoStatusFilter = PersonalInfoStatusFilter.All;
    processing: boolean = false;
    search$ = new Subject<string>();
    filterChange$ = new Subject<PersonalInfoStatusFilter>();

    constructor(private _route: ActivatedRoute,
                private _usersService: UsersService,
                private _vmFactory: AppMemberModelFactory) {

        this._init();
    }

    search(query: string) {
        this.search$.next(query);
    }

    changeFilter(filter: PersonalInfoStatusFilter) {
        this.activeFilter = filter;
        this.filterChange$.next(filter);
    }

    deleteUser(member: AppMemberModel): Observable<any> {
        const user = member.user;

        return this._usersService.deleteUser(user.id)
            .pipe(
                map(() => {
                    this._allUsers = this._allUsers.filter(u => u.id !== user.id);
                    this.items = this.items.filter(m => m.user.id !== user.id);
                })
            );
    }

    private _init() {
        (this._route.snapshot.data['users'] as Observable<IPaginationResponse<UserModel>>)
            .subscribe({
                next: (users: IPaginationResponse<UserModel>) => {
                    this._allUsers = users.items;
                    this.items = this._getFilteredMembers(this._allUsers);
                    this.paginationHandler.setPaginationData({
                        pageIndex: 0,
                        itemsCount: users.total,
                        pageSize: this.pageSize
                    });
                }
            });


        merge(
            this.paginationHandler.onPageChange$
                .pipe(
                    map((e: PageEvent) => this._loadItems(e))
                ),
            this.search$
                .pipe(
                    map((query: string) => this._search(query))
                ),

            this.filterChange$
                .pipe(
                    map(() => this._loadItems())
                )
        )
            .pipe(
                tap(() => this.processing = true),
                switchMap((obs: Observable<any>) => obs)
            )
            .subscribe((result: IPaginatedDataLoadingResult<UserModel>) => {
                this.processing = false;
                this._allUsers = result.items;
                this.items = this._getFilteredMembers(this._allUsers);

                this.paginationHandler.setPaginationData({
                    pageIndex: result.pageIndex,
                    itemsCount: result.itemsCount,
                    pageSize: result.pageSize
                });
            });
    }

    private _getFilteredMembers(allUsers: UserModel[]): AppMemberModel[] {
        let filteredUsers = null;

        if (this.activeFilter === PersonalInfoStatusFilter.All) {
            filteredUsers = allUsers;
        } else {
            const personalInfoStatus = this._filterToPersonalInfoStatus(this.activeFilter);
            filteredUsers = allUsers.filter(u => u.kycStatus === personalInfoStatus);
        }

        return this._vmFactory.createMultiple(filteredUsers);
    }

    private _filterToPersonalInfoStatus(statusFilter: PersonalInfoStatusFilter): PersonalInfoStatus {
        switch (statusFilter) {
            case PersonalInfoStatusFilter.Approve:
                return PersonalInfoStatus.Approve;
            case PersonalInfoStatusFilter.None:
                return PersonalInfoStatus.None;
            case PersonalInfoStatusFilter.Pending:
                return PersonalInfoStatus.Pending;
            case PersonalInfoStatusFilter.Rejected:
            default:
                return PersonalInfoStatus.Rejected;
        }
    }

    private _search(query: string): Observable<IPaginatedDataLoadingResult<UserModel>> {
        this.query = query;
        return this._loadItems();
    }

    private _loadItems(event?: PageEvent): Observable<IPaginatedDataLoadingResult<UserModel>> {
        const pageIndex = event ? event.pageIndex : 0;
        const pageSize = event ? event.pageSize : this.pageSize;
        const skip = pageIndex * pageSize;
        return this._usersService.getUsers(new PaginationParams(skip, pageSize), { selectQuery: this.query})
            .pipe(
                map((users: IPaginationResponse<UserModel>) => {
                    return {
                        itemsCount: users.total,
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                        items: users.items
                    };
                })
            );
    }
}
