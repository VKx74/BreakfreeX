import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router } from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { AlertService } from '@alert/services/alert.service';
import { IP2PUserResponse } from 'modules/Companion/models/models';
import { IJSONViewDialogData, JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';

@Component({
    selector: 'p2p-accounts-table',
    templateUrl: './p2p-accounts-table.component.html',
    styleUrls: ['./p2p-accounts-table.component.scss']
})
export class P2PAccountsTableComponent implements OnInit {
    @Input() items: IP2PUserResponse[];

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

    details(item: IP2PUserResponse) {
        this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Info',
                json: item
            }
        });
    }

    viewDetails(item: IP2PUserResponse) {
        this._router.navigateByUrl(`admin/companion/p2p-account-details/${item.id}/${item.wallet}`);
    }
}
