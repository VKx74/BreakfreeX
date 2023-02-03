import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { IP2PAdResponse, IP2PChangeAdRequest } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

@Component({
    selector: 'p2p-edit-ad',
    templateUrl: './p2p-edit-ad.component.html',
    styleUrls: ['./p2p-edit-ad.component.scss']
})
export class P2PEditAdComponent {
    ad: IP2PAdResponse;
    changeData: IP2PChangeAdRequest;
    dialogRef: MatDialogRef<any>;
    loading: boolean = false;
    statusList = [0, 1, 2, 3, 4];

    constructor(injector: Injector,
        private _companionP2PService: CompanionP2PService,
        private _alertService: AlertService) {
        this.dialogRef = injector.get(MatDialogRef);
        this.ad = injector.get(MAT_DIALOG_DATA);
        this.changeData = {
            id: this.ad.id,
            paymentDetails: {
                ...this.ad.paymentDetails
            }
        };
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
        if (this.changeData.paymentDetails) {
            if (!this.changeData.paymentDetails.bank) {
                this.changeData.paymentDetails.bank = undefined;
            }
            if (!this.changeData.paymentDetails.bankAccount) {
                this.changeData.paymentDetails.bankAccount = undefined;
            }
            if (!this.changeData.paymentDetails.accountHolder) {
                this.changeData.paymentDetails.accountHolder = undefined;
            }
            if (!this.changeData.paymentDetails.bic) {
                this.changeData.paymentDetails.bic = undefined;
            }
            if (!this.changeData.paymentDetails.bankAddress) {
                this.changeData.paymentDetails.bankAddress = undefined;
            }
            if (!this.changeData.paymentDetails.routing) {
                this.changeData.paymentDetails.routing = undefined;
            }
        }
        this._companionP2PService.changeAd(this.changeData).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("Ad updated");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed updated ad");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed updated ad");
        });
    }

    sideText(value: number) {
        if (value === 0) {
            return "Buy";
        }
        return "Sell";
    }

    statusText(value: number) {
        switch (value) {
            case 0: return "SystemCreated";
            case 1: return "SystemAccepted";
            case 2: return "SystemRejected";
            case 3: return "UserCanceled";
            case 4: return "SystemCompleted";
        }
        return "Unknown";
    }

    statusTextCaption = (value: number) => {
        return of(this.statusText(value));
    }

    statusSelected(status: number) {
        this.changeData.status = status;
    }
}
