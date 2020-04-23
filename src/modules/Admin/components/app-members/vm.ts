import {Injectable} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {merge, Observable, Subject} from "rxjs";
import {UserModel} from "@app/models/auth/auth.models";
import {JsUtil} from "../../../../utils/jsUtil";
import {AppMemberModel, AppMemberModelFactory} from "./app-member";
import {PersonalInfoStatus} from "@app/services/personal-info/personal-info.service";
import {PageEvent} from "@angular/material/paginator";
import {UsersService} from "@app/services/users.service";
import {map, switchMap, tap} from "rxjs/operators";
import {IPaginatedDataLoadingResult} from "../../data/models";
import {PaginationHandler} from "@app/models/pagination.model";

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
        (this._route.snapshot.data['users'] as Observable<UserModel[]>)
            .subscribe({
                next: (users: UserModel[]) => {
                    this._allUsers = users;
                    this.items = this._getFilteredMembers(users);
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
                    pageIndex: 0,
                    itemsCount: 10,
                    pageSize: 1
                });
            });

        this.paginationHandler.setPaginationData({
            pageIndex: 0,
            itemsCount: 10,
            pageSize: 1
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
        return this._usersService.searchUsers(query)
            .pipe(
                map((users: UserModel[]) => {
                    return {
                        itemsCount: users.length,
                        pageIndex: 0,
                        pageSize: 10,
                        items: users
                    };
                })
            );
    }

    private _loadItems(event?: PageEvent): Observable<IPaginatedDataLoadingResult<UserModel>> {
        return this._usersService.getUsers()
            .pipe(
                map((users: UserModel[]) => {
                    return {
                        itemsCount: users.length,
                        pageIndex: 0,
                        pageSize: event ? event.pageSize : 10,
                        items: users
                    };
                })
            );
    }
}
