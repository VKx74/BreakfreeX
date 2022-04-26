import {Component, Inject, OnInit} from '@angular/core';
import {NewsService} from "../../../services/news.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {Observable} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {ConfirmModalComponent, IConfirmModalConfig} from "UI";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";
import {INews} from "../../../../News/models/models";
import { IDepositResponse, IUserWalletResponse, IWithdrawResponse } from 'modules/Companion/models/models';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { QaModuleBasePath } from 'modules/Qa/BasePath';

interface INewsManagerFiltrationParams {
    search: string;
    endDate: string;
    startDate: string;
}

class CompanionWalletsFiltrationParams extends FiltrationParams<INewsManagerFiltrationParams> implements INewsManagerFiltrationParams {
    endDate: string;
    search: string;
    startDate: string;

    toObject(): INewsManagerFiltrationParams {
        return {
            endDate: this.toUTCDayEndSecondsString(this.endDate),
            search: this.search,
            startDate: this.toUTCSecondsString(this.startDate)
        };
    }

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}

@Component({
    selector: 'companion-wallets',
    templateUrl: './companion-wallets.component.html',
    styleUrls: ['./companion-wallets.component.scss']
})
export class CompanionWalletsComponent extends PaginationComponent<IUserWalletResponse> implements OnInit {
    loading = false;
    list: IUserWalletResponse[];
    ComponentIdentifier = ComponentIdentifier;
    filtrationParams = new CompanionWalletsFiltrationParams();

    get startDate() {
        return this.filtrationParams.startDate;
    }

    set startDate(value: string) {
        this.filtrationParams.startDate = value;
    }

    get endDate() {
        return this.filtrationParams.endDate;
    }

    set endDate(value: string) {
        this.filtrationParams.endDate = value;
    }

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
        super();
    }

    ngOnInit() {
        const wallets = this._route.snapshot.data['wallets'] as IPaginationResponse<IUserWalletResponse>;

        if (wallets) {
            this.setPaginationHandler(wallets);
        }
    }

    getItems(): Observable<IPaginationResponse<IUserWalletResponse>> {
        return this._companionUserTrackerService.getWalletsList(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IUserWalletResponse>, PageEvent]): void {
        this.list = response[0].items;
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    clearDatePickers() {
        this.filtrationParams.clearDateParams();
        this.resetPagination();
    }

    onSearchValueChange(term: string) {
        this.filtrationParams.search = term;
        this.resetPagination();
    }

    getCount(request: IDepositResponse[] | IWithdrawResponse[]): string {
        let unprocessedCount = request.filter((_) => !_.processed).length;
        return `Total ${request.length} (Unprocessed ${unprocessedCount})`;
    }

    viewDetails(item: IUserWalletResponse) {
        this._router.navigateByUrl(`admin/companion/wallet-details/${item.address}`);
    }

    // createNews() {
    //     this._matDialog.open(CreateNewsComponent).beforeClosed().subscribe(() => {
    //             this.updateNewsList();
    //     });
    // }

    // modalEditNews(news: INews) {
    //     this._matDialog.open(CreateNewsComponent, {
    //         data: news.id,
    //     }).beforeClosed().subscribe(() => {
    //             this.updateNewsList();
    //     });

    // }

    // updateNewsList() {
    //     this.getItems().subscribe(news => {
    //          this.newsList = news.items;
    //     });
    // }

    // deleteNews(news: INews) {
    //     this._matDialog.open<ConfirmModalComponent, IConfirmModalConfig>(ConfirmModalComponent, {
    //         data: {
    //             title: 'Delete Confirm',
    //             message: 'Are you confirm delete news?',
    //             onConfirm: () => this._newsManagerService.deleteNews(news.id)
    //                 .subscribe(res => {
    //                     // this.newsList = this.newsList.filter(n => n.id !== res.id);
    //                     this.resetPagination();
    //                 }, (err) => console.log('error happened ', err)),
    //         }
    //     });
    // }
}
