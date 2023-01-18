import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AlertService } from '@alert/services/alert.service';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

export interface IKYCStatusChangeData {
    id: number;
    isApproving: boolean;
}

@Component({
    selector: 'p2p-kyc-status-change',
    templateUrl: './p2p-kyc-status-change.component.html',
    styleUrls: ['./p2p-kyc-status-change.component.scss']
})
export class KYCStatusChangeComponent {
    dialogRef: MatDialogRef<any>;
    loading: boolean = false;
    comment: string;
    data: IKYCStatusChangeData;

    constructor(injector: Injector,
        private _alertService: AlertService,
        private _p2pService: CompanionP2PService) {
        this.dialogRef = injector.get(MatDialogRef);
        this.data = injector.get(MAT_DIALOG_DATA);
    }

    close() {
        this.dialogRef.close();
    }

    add() {
        if (!this.comment) {
            this._alertService.error("Please set comment");
            return;
        }

        if (this.data.isApproving) {
            this.approve();
        } else {
            this.reject();
        }
    }

    approve() {
        this.loading = true;
        this._p2pService.approveKyc(this.data.id, this.comment).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("KYC Approved");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed to approve KYC");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed to approve KYC");
        });
    }

    reject() {
        this.loading = true;
        this._p2pService.rejectKyc(this.data.id, this.comment).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("KYC Rejected");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed to reject KYC");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed to reject KYC");
        });
    }
}
