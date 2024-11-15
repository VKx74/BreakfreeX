import {Component, OnInit} from '@angular/core';
import {
    PaginationComponent,
    PaginationParams,
    IPaginationResponse,
    SkipTakeQueryParams
} from "@app/models/pagination.model";
import {Observable, of} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {MatDialog} from "@angular/material/dialog";
import {SearchHandler} from "UI";
import {ActivatedRoute} from "@angular/router";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";
import {AppRoutes} from "AppRoutes";
import { XPDashboardItem, XPDashboardItemDTO } from 'modules/Admin/data/xp-dashboard/models';
import { XPDashboardService } from 'modules/Admin/services/xp-dashboard.service';
import { HttpParams } from '@angular/common/http';
import { UsersService } from '@app/services/users.service';
import { Roles, UserModel } from '@app/models/auth/auth.models';
import { IdentityService } from '@app/services/auth/identity.service';
import { PersonalInfoStatus } from '@app/services/personal-info/personal-info.service';
import { AppMemberInfoComponent, AppMemberInfoComponentConfig } from '../app-member-info/app-member-info.component';

export interface IXPDashboardRequestParams {
    from?: string;
    to?: string;
}

class XPDashboardFiltrationParams extends FiltrationParams<IXPDashboardRequestParams> implements IXPDashboardRequestParams {
    from;
    to;

    constructor() {
        super();
    }

    clearDateParams() {
        this.from = '';
        this.to = '';
    }

    toObject(): IXPDashboardRequestParams {
        return {
            from: this.toJSON(this.from),
            to: this.toJSON(this.to)
        };
    }
}

interface ResolverData {
    discussions: Observable<IPaginationResponse<XPDashboardItemDTO>>;
}

@Component({
    selector: 'xp-dashboard',
    templateUrl: './xp-dashboard.component.html',
    styleUrls: ['./xp-dashboard.component.scss']
})
export class XPDashboardComponent extends PaginationComponent<XPDashboardItemDTO> implements OnInit {
    items: XPDashboardItem[];
    dashboardItems: XPDashboardItemDTO[];
    requestParams = new XPDashboardFiltrationParams();
    userDataCache: {[key: string]: UserModel} = {};

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    get from() {
        return this.requestParams.from;
    }

    set from(value) {
        this.requestParams.from = value;
    }

    get to() {
        return this.requestParams.to;
    }

    set to(value) {
        this.requestParams.to = value;
    }

    constructor(private _xpService: XPDashboardService,
                private _userService: UsersService,
                private _identityService: IdentityService,
                private _dialog: MatDialog,
                private _activatedRoute: ActivatedRoute) {
        super();
        this.pageSize = 50;
    }

    ngOnInit() {
        const resolvedDiscussions = ((this._activatedRoute.snapshot.data as ResolverData).discussions);
        resolvedDiscussions.subscribe(this.setPaginationHandler.bind(this));
    }

    getItems(): Observable<IPaginationResponse<XPDashboardItemDTO>> {
        return this._xpService.getXPDashboard(this.paginationParams);
    }

    responseHandler(response: [IPaginationResponse<XPDashboardItemDTO>, PageEvent]): void {
        this.dashboardItems = response[0].items;
        this.items = [];
        for (const profile of this.dashboardItems) {
            this.items.push({
                email: null,
                profile: profile
            });
        }
        this._loadUsers();
    }  
    
    showToggleMenu(item: XPDashboardItem): boolean {
        const member = this._getUserFromCache(item);
        if (!member) {
            return false;
        }

        const role = this._identityService.role;
        if (role === Roles.Admin || role === Roles.SupportOfficer) {
            return true;
        }
        return member.kycStatus !== PersonalInfoStatus.None;
    }

    showUserInfo(item: XPDashboardItem) {
        const user = this._getUserFromCache(item);
        if (!user) {
            return false;
        }

        this._dialog.open<any, AppMemberInfoComponentConfig>(AppMemberInfoComponent, {
            data: {
                user: user,
                statusChangeHandler: (status: PersonalInfoStatus) => {
                    user.kycStatus = status;
                }
            }
        });
    }

    private _getUserFromCache(search: XPDashboardItem): UserModel {
       return this.userDataCache[search.profile.userId];
    }

    private _loadUsers() {
        let ids: string[] = [];
        for (const item of this.items) {
            if (!item.email) {
                const cachedData = this.userDataCache[item.profile.userId];
                if (cachedData) {
                    item.email = cachedData.email;
                    continue;
                }
                
                ids.push(item.profile.userId);
                if (ids.length >= 25) {
                    break;
                }
            }
        }

        if (!ids.length) {
            return;
        }

        this._userService.getUserByIds(ids).subscribe((data: UserModel[]) => {
            if (!data || !data.length) {
                return;
            }

            for (const userInfo of data) {
                this.userDataCache[userInfo.id] = userInfo; 
                for (const item of this.items) {
                    if (userInfo.id === item.profile.userId) {
                        item.email = userInfo.email;
                    }
                }
            }

            this._loadUsers();
        });
    }
}