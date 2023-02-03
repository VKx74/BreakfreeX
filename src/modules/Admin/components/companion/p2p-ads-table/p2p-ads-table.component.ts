import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { AlertService } from '@alert/services/alert.service';
import { IP2PAdResponse } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';
import { P2PEditAdComponent } from '../p2p-edit-ad/p2p-edit-ad.component';
import { ConfirmModalComponent } from 'UI';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

@Component({
    selector: 'p2p-ads-table',
    templateUrl: './p2p-ads-table.component.html',
    styleUrls: ['./p2p-ads-table.component.scss']
})
export class P2PAdsTableComponent implements OnInit {
    @Input() items: IP2PAdResponse[];
    @Output() reloadNeeded = new EventEmitter<void>();

    loading = false;

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _alertService: AlertService,
        private _companionP2PService: CompanionP2PService,
        private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    details(item: IP2PAdResponse) {
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Info',
                json: item
            }
        });
    }

    viewDetails(item: IP2PAdResponse) {
        this._router.navigateByUrl(`admin/companion/ad-details/${item.id}`);
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

    edit(item: IP2PAdResponse) {
        this._matDialog.open<P2PEditAdComponent, IP2PAdResponse>(P2PEditAdComponent, {
            data: item
        })
            .afterClosed()
            .subscribe((value: IP2PAdResponse) => {
                if (value) {
                    for (let i = 0; i < this.items.length; i++) {
                        if (this.items[i].id === value.id) {
                            this.items[i].status = value.status;
                            this.items[i].paymentDetails = value.paymentDetails;
                            this.items[i].comment = value.comment;
                            this.items[i].currency = value.currency;
                            this.items[i].paymentMethod = value.paymentMethod;
                            this.items[i].lockTransactionId = value.lockTransactionId;
                            this.items[i].cancelTransactionId = value.cancelTransactionId;
                            this.items[i].price = value.price;
                            this.items[i].amount = value.amount;
                            this.items[i].lockedAmount = value.lockedAmount;
                            this.items[i].leftAmount = value.leftAmount;
                            this.items[i].minAmount = value.minAmount;
                        }
                    }

                    this.items = [...this.items];
                }
            });
    }

    deleteItem(item: IP2PAdResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Delete ad',
                message: `Are you sure you want to delete ad '${item.id}'?`,
                onConfirm: () => {
                    this._companionP2PService.deleteAd(item.id).subscribe((_) => {
                        if (_) {
                            this._alertService.success("Ad removed");
                        } else {
                            this._alertService.error("Failed to remove ad");
                        }
                        this.reloadNeeded.next();
                    });
                }
            }
        });
    }
}
