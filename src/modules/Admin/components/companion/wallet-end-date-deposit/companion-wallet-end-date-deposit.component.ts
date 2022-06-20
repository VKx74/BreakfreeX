import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IEndDateDepositResponse, IUserWalletResponse } from 'modules/Companion/models/models';
import { CompanionEditWalletDepositComponent } from '../edit-wallet-deposit/companion-edit-wallet-deposit.component';
import { ConfirmModalComponent } from 'modules/UI/components';
import { AlertService } from '@alert/services/alert.service';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';

@Component({
    selector: 'companion-wallet-end-date-deposit',
    templateUrl: './companion-wallet-end-date-deposit.component.html',
    styleUrls: ['./companion-wallet-end-date-deposit.component.scss']
})
export class CompanionWalletEndDateDepositComponent implements OnInit {
    @Input() set wallet(value: IUserWalletResponse) {
        this.endDateDeposits = value.endDateDeposits.slice();
        this.endDateDeposits = this.endDateDeposits.sort((a, b) => this.getDate(b.date).getTime() - this.getDate(a.date).getTime());
    }

    endDateDeposits: IEndDateDepositResponse[] = [];

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

    edit(deposit: IEndDateDepositResponse) {
        this._matDialog.open<CompanionEditWalletDepositComponent, IEndDateDepositResponse>(CompanionEditWalletDepositComponent, {
            data: deposit
        }).afterClosed().subscribe((_) => {
            if (_) {
                deposit.processed = _.processed;
            }
        });
    }

    details(deposit: IEndDateDepositResponse) {
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Deposit Details',
                json: deposit
            }
        });
    }

    remove(deposit: IEndDateDepositResponse) {
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
                            let index = this.endDateDeposits.findIndex((_) => _.id = deposit.id);
                            this.endDateDeposits.splice(index, 1);
                            this.endDateDeposits = [...this.endDateDeposits];
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
