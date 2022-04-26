import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'companion-edit-wallet-deposit',
    templateUrl: './companion-edit-wallet-deposit.component.html',
    styleUrls: ['./companion-edit-wallet-deposit.component.scss']
})
export class CompanionEditWalletDepositComponent {
    deposit: IDepositResponse;
    dialogRef: MatDialogRef<any>;
    processOptions: boolean[] = [true, false];
    isProcessed: boolean;
    loading: boolean = false;

    constructor(injector: Injector,
        private _alertService: AlertService,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        this.dialogRef = injector.get(MatDialogRef);
        this.deposit = injector.get(MAT_DIALOG_DATA);
        this.isProcessed = this.deposit.processed;
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
        this._companionUserTrackerService.editDeposit({
            address: this.deposit.userWalletAddress,
            id: this.deposit.id,
            processed: this.isProcessed
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

    itemSelected(data: boolean) {
        this.isProcessed = data;
    }
}
