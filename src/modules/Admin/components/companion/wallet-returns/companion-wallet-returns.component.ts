import {Component, Injector, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {PaginationComponent, IPaginationResponse} from "@app/models/pagination.model";
import {Observable, of} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import { IBalancesChangeItem, IReturnChangeItem } from 'modules/Companion/models/models';

class CompanionWalletReturnsParams {
    endDate: string;
    startDate: string;

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}

interface InfoViewModel {
    amount: number;
    total: number;
    time: number;
    isDeposit?: boolean;
    isWithdraw?: boolean;
    isEarning?: boolean;
}

export interface IReturnAndBalanceData {
    returns: IReturnChangeItem[];
    balances: IBalancesChangeItem[];
    token: string;
}

@Component({
    selector: 'companion-wallet-returns',
    templateUrl: './companion-wallet-returns.component.html',
    styleUrls: ['./companion-wallet-returns.component.scss']
})
export class CompanionWalletReturnsComponent extends PaginationComponent<InfoViewModel> {
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
    data: IReturnAndBalanceData;
    allItems: InfoViewModel[] = [];
    list: InfoViewModel[];

    constructor(injector: Injector) {
        super();
        this.dialogRef = injector.get(MatDialogRef);
        this.data = injector.get(MAT_DIALOG_DATA);

        for (let r of this.data.returns) {
            this.allItems.push({
                amount: r.amount,
                time: r.time,
                total: r.total,
                isEarning: true
            });
        }
        
        for (let b of this.data.balances) {
            this.allItems.push({
                amount: b.changeAmount,
                time: b.time,
                total: 0,
                isDeposit: b.changeAmount > 0,
                isWithdraw: b.changeAmount < 0
            });
        }

        this.allItems = this.allItems.sort((a, b) => b.time - a.time);

        for (let i = this.allItems.length - 1; i >= 0; i--) {
            let currentItem = this.allItems[i];
            let prevItem = this.allItems[i + 1];

            if (currentItem.total === 0) {
                currentItem.total = prevItem ? prevItem.total + currentItem.amount : currentItem.amount;
            }
        }

        this.list = this.allItems.slice(this.paginationParams.skip, this.paginationParams.skip + this.paginationParams.pageSize);
        this.token = this.data.token;
        this.setPaginationHandler({
            items: this.list,
            total: this.allItems.length
           });
    }

    close() {
        this.dialogRef.close();
    }
    
    getItems(): Observable<IPaginationResponse<InfoViewModel>> {
        let startDate = 0;
        let endDate = Infinity;
        if (this.filtrationParams.startDate) {
            startDate = new Date(this.filtrationParams.startDate).getTime() / 1000;
        }
        if (this.filtrationParams.endDate) {
            endDate = new Date(this.filtrationParams.endDate).getTime() / 1000;
        }

        let filtered = this.allItems.filter((_) => _.time >= startDate && _.time <= endDate);
        let res = filtered.slice(this.paginationParams.skip, this.paginationParams.skip + this.paginationParams.pageSize);
        return of({
            items: res,
            total: filtered.length
        });
    }

    responseHandler(response: [IPaginationResponse<InfoViewModel>, PageEvent]): void {
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
