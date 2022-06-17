import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IUserWalletResponse, IBalancesChangeItem, IReturnChangeItem } from 'modules/Companion/models/models';
import { CompanionWalletReturnsComponent, IReturnAndBalanceData } from '../wallet-returns/companion-wallet-returns.component';

interface IWalletBalanceChangeViewModel {
    token: string;
    balance: number;
    return: number;
    balances: IBalancesChangeItem[];
    returns: IReturnChangeItem[];
}

@Component({
    selector: 'companion-wallet-balance',
    templateUrl: './companion-wallet-balance.component.html',
    styleUrls: ['./companion-wallet-balance.component.scss']
})
export class CompanionWalletBalanceComponent {
    @Input() wallet: IUserWalletResponse;
    data: IWalletBalanceChangeViewModel[] = [];

    loading = false;

    constructor(private _route: ActivatedRoute,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngAfterViewInit() {
        this._companionUserTrackerService.getBalances(this.wallet.address).subscribe((response) => {
            for (const key in response.flexibleDeposit) {
                if (!response.flexibleDeposit[key]) {
                    continue;
                }
                response.flexibleDeposit[key].balances.reverse();
                response.flexibleDeposit[key].returns.reverse();
                let balance = response.flexibleDeposit[key].amount;
                let returnAmount = 0;

                response.flexibleDeposit[key].returns.forEach((_) => returnAmount += _.amount);
                this.data.push({
                    token: key,
                    balance: balance,
                    return: returnAmount,
                    balances: response.flexibleDeposit[key].balances,
                    returns: response.flexibleDeposit[key].returns
                });
            }
        });
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    edit(deposit: IDepositResponse) {
    }

    viewDetails(item: IWalletBalanceChangeViewModel, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();

        this._matDialog.open<CompanionWalletReturnsComponent, IReturnAndBalanceData>(CompanionWalletReturnsComponent, {
            data: {
                returns: item.returns,
                balances: item.balances,
                token: item.token
            }
        });
    }
}
