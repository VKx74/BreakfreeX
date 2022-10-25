import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IWithdrawResponse } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'add-redeem',
    templateUrl: './add-redeem.component.html',
    styleUrls: ['./add-redeem.component.scss']
})
export class AddRedeemComponent {
    dialogRef: MatDialogRef<any>;
    loading: boolean = false;
    email: string;
    tx: string;
    tokens: number;
    rate: number;

    constructor(injector: Injector,
        private _alertService: AlertService,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        this.dialogRef = injector.get(MatDialogRef);
    }

    close() {
        this.dialogRef.close();
    }

    add() {
        if (!this.email || !this.tx || !this.tokens || !this.rate) {
            this._alertService.error("Incorrect data");
            return;
        }
        const emailProcessed = this.email.trim();
        const txProcessed = this.tx.trim();

        if (!emailProcessed || !txProcessed) {
            this._alertService.error("Incorrect data");
            return;
        }

        this.loading = true;
        this._companionUserTrackerService.addRedeem({
            email: emailProcessed,
            tx: txProcessed,
            tokens: this.tokens,
            rate: this.rate
        }).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("Redeem added");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed to add redeem");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed to add redeem");
        });
    }
}
