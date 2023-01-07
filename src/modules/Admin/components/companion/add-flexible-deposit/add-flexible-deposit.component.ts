import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IWithdrawResponse } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'add-flexible-deposit',
    templateUrl: './add-flexible-deposit.component.html',
    styleUrls: ['./add-flexible-deposit.component.scss']
})
export class AddFlexibleDepositComponent {
    dialogRef: MatDialogRef<any>;
    loading: boolean = false;
    publicKey: string;
    tx: string;
    token: string;
    amount: number;

    constructor(injector: Injector,
        private _alertService: AlertService,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        this.dialogRef = injector.get(MatDialogRef);
    }

    close() {
        this.dialogRef.close();
    }

    add() {
        if (!this.publicKey || !this.token || !this.amount) {
            this._alertService.error("Incorrect data");
            return;
        }

        this.publicKey = this.publicKey.trim();
        this.token = this.token.trim();

        if (!this.publicKey || !this.token || this.amount <= 0) {
            this._alertService.error("Incorrect data");
            return;
        }

        this.loading = true;
        this._companionUserTrackerService.addFlexibleDeposit({
            amount: this.amount,
            publicKey: this.publicKey,
            token: this.token,
            tx: this.tx,
        }).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("Item added");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed to add item");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed to add item");
        });
    }
}
