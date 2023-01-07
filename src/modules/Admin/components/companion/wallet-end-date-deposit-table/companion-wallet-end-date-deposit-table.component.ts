import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IEndDateDepositResponse } from 'modules/Companion/models/models';
import { ConfirmModalComponent } from 'modules/UI/components';
import { AlertService } from '@alert/services/alert.service';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';
import { CompanionEditEndDateWalletDepositComponent } from '../edit-wallet-end-date-deposit/companion-edit-wallet-end-date-deposit.component';

@Component({
    selector: 'companion-wallet-end-date-deposit-table',
    templateUrl: './companion-wallet-end-date-deposit-table.component.html',
    styleUrls: ['./companion-wallet-end-date-deposit-table.component.scss']
})
export class CompanionWalletEndDateDepositTableComponent implements OnInit {
    private _endDateDeposits;

    @Input() set endDateDeposits(value: IEndDateDepositResponse[]) {
        this._endDateDeposits = value;
    }

    get endDateDeposits(): IEndDateDepositResponse[] {
        return this._endDateDeposits;
    }

    loading = false;

    constructor(private _alertService: AlertService,
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
        this._matDialog.open<CompanionEditEndDateWalletDepositComponent, IEndDateDepositResponse>(CompanionEditEndDateWalletDepositComponent, {
            data: deposit
        }).afterClosed().subscribe((_) => {
            if (_) {
                deposit.processed = _.processed;
                deposit.completed = _.completed;
                deposit.withdrawTxId = _.withdrawTxId;
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
                    this._companionUserTrackerService.deleteEndDateDeposit(deposit.userWalletAddress, deposit.id).subscribe((response) => {
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

    isEnded(deposit: IEndDateDepositResponse) {
       let date = new Date(deposit.endDate);
       return date.getTime() < new Date().getTime();
    }

    getReturnAmount(deposit: IEndDateDepositResponse) {
        let yearReturn = deposit.amount / 100 * deposit.returnPercentage;
        let res = deposit.depositTerm / 365 * yearReturn;
        return res;
    }

    getTotalReturnAmount(deposit: IEndDateDepositResponse) {
        let returnAmount = this.getReturnAmount(deposit);
        return returnAmount + deposit.amount;
    }
}
