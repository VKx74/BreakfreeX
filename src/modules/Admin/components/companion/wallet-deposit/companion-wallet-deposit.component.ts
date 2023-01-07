import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IUserWalletResponse } from 'modules/Companion/models/models';
import { CompanionEditWalletDepositComponent } from '../edit-wallet-deposit/companion-edit-wallet-deposit.component';
import { ConfirmModalComponent } from 'modules/UI/components';
import { AlertService } from '@alert/services/alert.service';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';
import { AddFlexibleDepositComponent } from '../add-flexible-deposit/add-flexible-deposit.component';

@Component({
    selector: 'companion-wallet-deposit',
    templateUrl: './companion-wallet-deposit.component.html',
    styleUrls: ['./companion-wallet-deposit.component.scss']
})
export class CompanionWalletDepositComponent implements OnInit {
    private _wallet: IUserWalletResponse;

    @Input() set wallet(value: IUserWalletResponse) {
        this._wallet = value;
        this.flexibleDeposits = value.flexibleDeposits.slice();
        this.flexibleDeposits = this.flexibleDeposits.sort((a, b) => this.getDate(b.date).getTime() - this.getDate(a.date).getTime());
    }

    flexibleDeposits: IDepositResponse[] = [];

    loading = false;

    constructor(private _route: ActivatedRoute,
                private _alertService: AlertService,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
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

    details(deposit: IDepositResponse) {
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Deposit Details',
                json: deposit
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
                            let index = this.flexibleDeposits.findIndex((_) => _.id = deposit.id);
                            this.flexibleDeposits.splice(index, 1);
                            this.flexibleDeposits = [...this.flexibleDeposits];
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

    addFlexibleDeposit() {
        this._matDialog.open<AddFlexibleDepositComponent>(AddFlexibleDepositComponent).afterClosed().subscribe((_) => {
            if (_) {
               this._reload();
            }
        });
    }

    private _reload() {
        this._companionUserTrackerService.getWalletDetailsList(this._wallet.address).subscribe((data) => {
            this.wallet = data;
        });
    }
}
