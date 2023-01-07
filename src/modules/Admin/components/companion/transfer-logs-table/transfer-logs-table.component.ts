import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { AlertService } from '@alert/services/alert.service';
import { ITransferLogResponse } from 'modules/Companion/models/models';

@Component({
    selector: 'transfer-logs-table',
    templateUrl: './transfer-logs-table.component.html',
    styleUrls: ['./transfer-logs-table.component.scss']
})
export class TransferLogsTableComponent implements OnInit {
    @Input() items: ITransferLogResponse[];

    loading = false;

    constructor(private _route: ActivatedRoute,
                private _alertService: AlertService,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }
}
