import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IUserWalletResponse } from 'modules/Companion/models/models';

@Component({
    selector: 'companion-wallet-details',
    templateUrl: './companion-wallet-details.component.html',
    styleUrls: ['./companion-wallet-details.component.scss']
})
export class CompanionWalletDetailsComponent implements OnInit {
    wallet: IUserWalletResponse;

    constructor(private _route: ActivatedRoute,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngOnInit() {
        this.wallet = this._route.snapshot.data['wallet'] as IUserWalletResponse;
    }
}
