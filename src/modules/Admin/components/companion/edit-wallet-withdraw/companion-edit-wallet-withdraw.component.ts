import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IWithdrawResponse } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'companion-edit-wallet-withdraw',
    templateUrl: './companion-edit-wallet-withdraw.component.html',
    styleUrls: ['./companion-edit-wallet-withdraw.component.scss']
})
export class CompanionEditWalletWithdrawComponent {
    withdraw: IWithdrawResponse;
    dialogRef: MatDialogRef<any>;
    processOptions: boolean[] = [true, false];
    isProcessed: boolean;
    txId: string;
    loading: boolean = false;

    constructor(injector: Injector,
        private _alertService: AlertService,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        this.dialogRef = injector.get(MatDialogRef);
        this.withdraw = injector.get(MAT_DIALOG_DATA);
        this.isProcessed = this.withdraw.processed;
        this.txId = this.withdraw.tx;
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
        this._companionUserTrackerService.editWithdraw({
            address: this.withdraw.userWalletAddress,
            id: this.withdraw.id,
            processed: this.isProcessed,
            tx: this.txId
        }).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("Withdraw updated");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed updated withdraw");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed updated withdraw");
        });
    }

    itemSelected(data: boolean) {
        this.isProcessed = data;
    }
}
