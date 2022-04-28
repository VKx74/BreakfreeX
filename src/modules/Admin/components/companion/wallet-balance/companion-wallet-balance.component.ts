import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IUserWalletResponse, IWalletBalanceChange, IWalletReturnResponse } from 'modules/Companion/models/models';
import { CompanionWalletReturnsComponent, IReturnData } from '../wallet-returns/companion-wallet-returns.component';

interface IWalletBalanceChangeViewModel {
    token: string;
    balance: number;
    return: number;
    data: IWalletBalanceChange[];
    returns: IWalletReturnResponse[];
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
            for (const key in response) {
                if (!response[key]) {
                    continue;
                }
                response[key].balances.reverse();
                response[key].returns.reverse();
                let balance = response[key].balances[0];
                let returnItem = response[key].returns[0];
                this.data.push({
                    token: key,
                    balance: balance ? balance.amount : 0,
                    return: returnItem ? returnItem.total : 0,
                    data: response[key].balances,
                    returns: response[key].returns
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

        this._matDialog.open<CompanionWalletReturnsComponent, IReturnData>(CompanionWalletReturnsComponent, {
            data: {
                data: item.returns,
                token: item.token
            }
        });
    }
}
