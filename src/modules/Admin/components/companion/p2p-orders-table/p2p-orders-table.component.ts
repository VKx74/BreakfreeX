import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { AlertService } from '@alert/services/alert.service';
import { IP2POrderResponse } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';
import { P2PEditOrderComponent } from '../p2p-edit-order/p2p-edit-order.component';
import { debug } from 'console';
import { ConfirmModalComponent } from 'UI';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

@Component({
    selector: 'p2p-orders-table',
    templateUrl: './p2p-orders-table.component.html',
    styleUrls: ['./p2p-orders-table.component.scss']
})
export class P2POrdersTableComponent implements OnInit {
    @Input() items: IP2POrderResponse[];
    @Output() reloadNeeded = new EventEmitter<void>();

    loading = false;

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _companionP2PService: CompanionP2PService,
        private _alertService: AlertService,
        private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    details(item: IP2POrderResponse) {
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Info',
                json: item
            }
        });
    }

    deleteItem(item: IP2POrderResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Delete order',
                message: `Are you sure you want to delete order '${item.id}'?`,
                onConfirm: () => {
                    this._companionP2PService.deleteOrder(item.id).subscribe((_) => {
                        if (_) {
                            this._alertService.success("Order removed");
                        } else {
                            this._alertService.error("Failed to remove order");
                        }
                        this.reloadNeeded.next();
                    });
                }
            }
        });
    }

    edit(item: IP2POrderResponse) {
        this._matDialog.open<P2PEditOrderComponent, IP2POrderResponse>(P2PEditOrderComponent, {
            data: item
        })
            .afterClosed()
            .subscribe((value: IP2POrderResponse) => {
                if (value) {
                    for (let i = 0; i < this.items.length; i++) {
                        if (this.items[i].id === value.id) {
                            this.items[i].status = value.status;
                            this.items[i].paymentDetails = value.paymentDetails;
                            this.items[i].comment = value.comment;
                            this.items[i].currency = value.currency;
                            this.items[i].paymentMethod = value.paymentMethod;
                            this.items[i].transactionId = value.transactionId;
                            this.items[i].lockTransactionId = value.lockTransactionId;
                            this.items[i].cancelTransactionId = value.cancelTransactionId;
                            this.items[i].price = value.price;
                            this.items[i].amount = value.amount;
                        }
                    }

                    this.items = [...this.items];
                }
                this.reloadNeeded.next();
            });
    }

    cancelOrder(item: IP2POrderResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Cancel order',
                message: `Are you sure you want to cancel order '${item.id}'? Founds will be unlocked and returned to users.`,
                onConfirm: () => {
                    this._companionP2PService.cancelOrder(item.id).subscribe((_) => {
                        if (_) {
                            this._alertService.success("Order canceled");
                        } else {
                            this._alertService.error("Failed to cancel order");
                        }
                        this.reloadNeeded.next();
                    });
                }
            }
        });
    }

    releaseCoins(item: IP2POrderResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Release order founds',
                message: `Are you sure you want to release order '${item.id}' founds? Order will be completed.`,
                onConfirm: () => {
                    this._companionP2PService.cancelOrder(item.id).subscribe((_) => {
                        if (_) {
                            this._alertService.success("Order completed");
                        } else {
                            this._alertService.error("Failed to complete order");
                        }
                        this.reloadNeeded.next();
                    });
                }
            }
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
}
