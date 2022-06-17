import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IUserWalletResponse, IWithdrawResponse } from 'modules/Companion/models/models';
import { CompanionEditWalletWithdrawComponent } from '../edit-wallet-withdraw/companion-edit-wallet-withdraw.component';
import { ConfirmModalComponent } from 'modules/UI/components';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'companion-wallet-withdraw',
    templateUrl: './companion-wallet-withdraw.component.html',
    styleUrls: ['./companion-wallet-withdraw.component.scss']
})
export class CompanionWalletWithdrawComponent implements OnInit {
    @Input() wallet: IUserWalletResponse;
    withdrawRequest: IWithdrawResponse[];

    loading = false;

    constructor(private _route: ActivatedRoute,
                private _alertService: AlertService,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    edit(withdraw: IWithdrawResponse) {
        this._matDialog.open<CompanionEditWalletWithdrawComponent, IWithdrawResponse>(CompanionEditWalletWithdrawComponent, {
            data: withdraw
        }).afterClosed().subscribe((_) => {
            if (_) {
                withdraw.processed = _.processed;
                withdraw.tx = _.tx;
            }
        });
    }
    
    remove(withdraw: IWithdrawResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Delete withdraw',
                message: `Are you sure you want to delete withdraw #${withdraw.id}?`,
                onConfirm: () => {
                    this.loading = true;
                    this._companionUserTrackerService.deleteWithdraw(withdraw.userWalletAddress, withdraw.id).subscribe((response) => {
                        this.loading = false;
                        if (response) {
                            this._alertService.success("Withdraw removed");
                            let index = this.wallet.withdraws.findIndex((_) => _.id = withdraw.id);
                            this.wallet.withdraws.splice(index, 1);
                            this.wallet.withdraws = [...this.wallet.withdraws];
                            return;
                        }
                        this._alertService.error("Failed removed withdraw");
                    }, (error) => {
                        this.loading = false;
                        this._alertService.error("Failed removed withdraw");
                    });
                }
            }
        });
    }
}
