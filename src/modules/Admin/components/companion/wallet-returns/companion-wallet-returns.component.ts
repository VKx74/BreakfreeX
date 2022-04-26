import {Component, Injector, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {Observable, of} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {FiltrationParams} from "@app/models/filtration-params";
import {ComponentIdentifier} from "@app/models/app-config";
import { IDepositResponse, IUserWalletResponse, IWalletReturnResponse, IWithdrawResponse } from 'modules/Companion/models/models';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';

class CompanionWalletReturnsParams {
    endDate: string;
    startDate: string;

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}

export interface IReturnData {
    data: IWalletReturnResponse[];
    token: string;
}

@Component({
    selector: 'companion-wallet-returns',
    templateUrl: './companion-wallet-returns.component.html',
    styleUrls: ['./companion-wallet-returns.component.scss']
})
export class CompanionWalletReturnsComponent extends PaginationComponent<IWalletReturnResponse> {
    filtrationParams = new CompanionWalletReturnsParams();

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

    dialogRef: MatDialogRef<any>;
    token: string;
    data: IReturnData;
    list: IWalletReturnResponse[];

    constructor(injector: Injector) {
        super();
        this.dialogRef = injector.get(MatDialogRef);
        this.data = injector.get(MAT_DIALOG_DATA);

        this.list = this.data.data.slice(this.paginationParams.skip, this.paginationParams.skip + this.paginationParams.pageSize);
        this.token = this.data.token;
        this.setPaginationHandler({
            items: this.list,
            total: this.data.data.length
           });
    }

    close() {
        this.dialogRef.close();
    }
    
    getItems(): Observable<IPaginationResponse<IWalletReturnResponse>> {
        let startDate = 0;
        let endDate = Infinity;
        if (this.filtrationParams.startDate) {
            startDate = new Date(this.filtrationParams.startDate).getTime() / 1000;
        }
        if (this.filtrationParams.endDate) {
            endDate = new Date(this.filtrationParams.endDate).getTime() / 1000;
        }

        let filtered = this.data.data.filter((_) => _.time >= startDate && _.time <= endDate);
        let res = filtered.slice(this.paginationParams.skip, this.paginationParams.skip + this.paginationParams.pageSize);
        return of({
            items: res,
            total: filtered.length
        });
    }

    isDeposit(item: IWalletReturnResponse): boolean {
        let list = this.data.data;
        let index = list.indexOf(item);
        if (!list[index + 1]) {
            return true;
        }

        if (list[index].balance === list[index + 1].balance) {
            return null;
        }

        return list[index].balance > list[index + 1].balance;
    }

    responseHandler(response: [IPaginationResponse<IWalletReturnResponse>, PageEvent]): void {
        this.list = response[0].items;
    }

    getDate(date: number): Date {
        return new Date(date * 1000);
    }

    clearDatePickers() {
        this.filtrationParams.clearDateParams();
        this.resetPagination();
    }

    onSearchValueChange(term: string) {
        this.resetPagination();
    }
}
