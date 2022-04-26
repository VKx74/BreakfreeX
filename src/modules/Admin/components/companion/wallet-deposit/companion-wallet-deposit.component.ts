import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IUserWalletResponse } from 'modules/Companion/models/models';
import { CompanionEditWalletDepositComponent } from '../edit-wallet-deposit/companion-edit-wallet-deposit.component';
import { ConfirmModalComponent } from 'modules/UI/components';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'companion-wallet-deposit',
    templateUrl: './companion-wallet-deposit.component.html',
    styleUrls: ['./companion-wallet-deposit.component.scss']
})
export class CompanionWalletDepositComponent implements OnInit {
    @Input() wallet: IUserWalletResponse;

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

    edit(deposit: IDepositResponse) {
        this._matDialog.open<CompanionEditWalletDepositComponent, IDepositResponse>(CompanionEditWalletDepositComponent, {
            data: deposit
        }).afterClosed().subscribe((_) => {
            if (_) {
                deposit.processed = _.processed;
            }
        });
    }

    remove(deposit: IDepositResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Delete deposit',
                message: `Are you sure you want to delete deposit #${deposit.id}?`,
                onConfirm: () => {
                    this.loading = true;
                    this._companionUserTrackerService.deleteDeposit(deposit.userWalletAddress, deposit.id).subscribe((response) => {
                        this.loading = false;
                        if (response) {
                            this._alertService.success("Deposit removed");
                            let index = this.wallet.depositRequest.findIndex((_) => _.id = deposit.id);
                            this.wallet.depositRequest.splice(index, 1);
                            this.wallet.depositRequest = [...this.wallet.depositRequest];
                            return;
                        }
                        this._alertService.error("Failed removed deposit");
                    }, (error) => {
                        this.loading = false;
                        this._alertService.error("Failed removed deposit");
                    });
                }
            }
        });
    }
}
