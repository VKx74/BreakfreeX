import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IUserWalletResponse, IWalletBalanceChange } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';

@Component({
    selector: 'companion-wallet-balance-item',
    templateUrl: './companion-wallet-balance-item.component.html',
    styleUrls: ['./companion-wallet-balance-item.component.scss']
})
export class CompanionWalletBalanceItemComponent {
    @Input() symbol: IUserWalletResponse;
    @Input() data: IWalletBalanceChange[] = [];

    loading = false;

    constructor(private _route: ActivatedRoute,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _dialog: MatDialog) {
    }

    ngAfterViewInit() {
    }

    isDeposit(index: number): boolean {
        if (!this.data[index + 1]) {
            return true;
        }

        return this.data[index].amount > this.data[index + 1].amount;
    }

    getDate(date: number): Date {
        return new Date(date * 1000);
    }

    getFrom(item: IWalletBalanceChange): string {
        if (item.splDetails) {
            return item.splDetails.from.owner;
        }

        if (item.solDetails) {
            return item.solDetails.details.src;
        }

        return "Unknown";
    }

    getTo(item: IWalletBalanceChange): string {
        if (item.splDetails) {
            return item.splDetails.to.owner;
        }

        if (item.solDetails) {
            return item.solDetails.details.dst;
        }

        return "Unknown";
    }
    
    showFromDetails(item: IWalletBalanceChange) {
        let object = null;
        if (item.splDetails) {
            object = item.splDetails.from;
        }

        if (item.solDetails) {
            object = item.solDetails.details;
        }

        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Transaction Details',
                json: object,
            }
        });
    }

    showToDetails(item: IWalletBalanceChange) {
        let object = null;
        if (item.splDetails) {
            object = item.splDetails.to;
        }

        if (item.solDetails) {
            object = item.solDetails.details;
        }

        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Transaction Details',
                json: object,
            }
        });
    }
}
