import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { AlertService } from '@alert/services/alert.service';
import { IP2PAdResponse } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';

@Component({
    selector: 'p2p-ads-table',
    templateUrl: './p2p-ads-table.component.html',
    styleUrls: ['./p2p-ads-table.component.scss']
})
export class P2PAdsTableComponent implements OnInit {
    @Input() items: IP2PAdResponse[];

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
}
