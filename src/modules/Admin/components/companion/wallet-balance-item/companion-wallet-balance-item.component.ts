import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IBalancesChangeItem, IUserWalletResponse } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';

@Component({
    selector: 'companion-wallet-balance-item',
    templateUrl: './companion-wallet-balance-item.component.html',
    styleUrls: ['./companion-wallet-balance-item.component.scss']
})
export class CompanionWalletBalanceItemComponent {
    @Input() userWallet: IUserWalletResponse;
    @Input() data: IBalancesChangeItem[] = [];

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

    getFrom(): string {
        return this.userWallet.address;
    }

    getTo(item: IBalancesChangeItem): string {
        return "Root wallet";
    }

    details(item: IBalancesChangeItem) {
        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Transaction Details',
                json: item
            }
        });
    }
}
