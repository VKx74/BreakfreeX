import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IEndDateDepositResponse } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'companion-edit-wallet-end-date-deposit',
    templateUrl: './companion-edit-wallet-end-date-deposit.component.html',
    styleUrls: ['./companion-edit-wallet-end-date-deposit.component.scss']
})
export class CompanionEditEndDateWalletDepositComponent {
    deposit: IEndDateDepositResponse;
    dialogRef: MatDialogRef<any>;
    booleanOptions: boolean[] = [true, false];
    isProcessed: boolean;
    isCompleted: boolean;
    withdrawTx: string;
    txId: string;
    loading: boolean = false;
    

    constructor(injector: Injector,
        private _alertService: AlertService,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        this.dialogRef = injector.get(MatDialogRef);
        this.deposit = injector.get(MAT_DIALOG_DATA);
        this.isProcessed = this.deposit.processed;
        this.isCompleted = this.deposit.completed;
        this.withdrawTx = this.deposit.withdrawTxId;
        this.txId = this.deposit.tx;
    }

    @bind
    captionText(value: boolean) {
        if (value) {
            return of("True");
        }
        return of("False");
    } 

    close() {
        this.dialogRef.close();
    }

    edit() {
        this.loading = true;
        this._companionUserTrackerService.editEndDateDeposit({
            address: this.deposit.userWalletAddress,
            id: this.deposit.id,
            processed: this.isProcessed,
            completed: this.isCompleted,
            withdrawTxId: this.withdrawTx,
            tx: this.deposit.tx
        }).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("Deposit updated");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed updated deposit");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed updated deposit");
        });
    }

    isProcessedSelected(data: boolean) {
        this.isProcessed = data;
    }

    isCompletedSelected(data: boolean) {
        this.isCompleted = data;
    }
}
