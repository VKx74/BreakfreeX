import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { AlertService } from '@alert/services/alert.service';
import { P2PUserReviewResponse } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';

@Component({
    selector: 'p2p-user-reviews-table',
    templateUrl: './p2p-user-reviews-table.component.html',
    styleUrls: ['./p2p-user-reviews-table.component.scss']
})
export class P2PUserReviewsTableComponent implements OnInit {
    @Input() items: P2PUserReviewResponse[];

    loading = false;

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _alertService: AlertService,
        private _companionUserTrackerService: CompanionUserTrackerService,
        private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    details(item: P2PUserReviewResponse) {
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Info',
                json: item
            }
        });
    }

    // sideText(value: number) {
    //     if (value == 0) {
    //         return "Buy";
    //     }
    //     return "Sell";
    // }

    // statusText(value: number) {
    //     switch (value) {
    //         case 0: return "SystemCreated";
    //         case 1: return "SystemAccepted";
    //         case 2: return "SystemRejected";
    //         case 3: return "UserAccepted";
    //         case 4: return "UserRejected";
    //         case 5: return "UserCanceled";
    //         case 6: return "UserPaymentSent";
    //         case 7: return "UserReleaseCoins";
    //         case 8: return "SystemCompleted";
    //         case 9: return "UserDispute";
    //     }
    //     return "Unknown";
    // }
}
