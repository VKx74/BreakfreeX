import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';

@Component({
    selector: 'p2p-account-details',
    templateUrl: './p2p-account-details.component.html',
    styleUrls: ['./p2p-account-details.component.scss']
})
export class P2PAccountDetailsComponent implements OnInit {
    accountId: number;
    accountWallet: string;

    constructor(private _route: ActivatedRoute,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngOnInit() {
        let account = this._route.snapshot.data['account'];
        this.accountId = account.id;
        this.accountWallet = account.wallet;
    }
}
