import { Component, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IDepositResponse, IP2PChangeOrderRequest, IP2POrderResponse } from 'modules/Companion/models/models';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

@Component({
    selector: 'p2p-edit-order',
    templateUrl: './p2p-edit-order.component.html',
    styleUrls: ['./p2p-edit-order.component.scss']
})
export class P2PEditOrderComponent {
    order: IP2POrderResponse;
    changeData: IP2PChangeOrderRequest;
    dialogRef: MatDialogRef<any>;
    loading: boolean = false;
    statusList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    constructor(injector: Injector,
        private _companionP2PService: CompanionP2PService,
        private _alertService: AlertService) {
        this.dialogRef = injector.get(MatDialogRef);
        this.order = injector.get(MAT_DIALOG_DATA);
        this.changeData = {
            id: this.order.id,
            paymentDetails: {
                ...this.order.paymentDetails
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
        this._companionP2PService.changeOrder(this.changeData).subscribe((response) => {
            this.loading = false;
            if (response) {
                this._alertService.success("Order updated");
                this.dialogRef.close(response);
                return;
            }
            this._alertService.error("Failed updated order");
        }, (error) => {
            this.loading = false;
            this._alertService.error("Failed updated order");
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
            case 3: return "UserAccepted";
            case 4: return "UserRejected";
            case 5: return "UserCanceled";
            case 6: return "UserPaymentSent";
            case 7: return "UserReleaseCoins";
            case 8: return "SystemCompleted";
            case 9: return "UserDispute";
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
