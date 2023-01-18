import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IUserWalletResponse } from 'modules/Companion/models/models';

@Component({
    selector: 'ad-details',
    templateUrl: './ad-details.component.html',
    styleUrls: ['./ad-details.component.scss']
})
export class AdDetailsComponent implements OnInit {
    adId: number;

    constructor(private _route: ActivatedRoute,
                private _companionUserTrackerService: CompanionUserTrackerService,
                private _matDialog: MatDialog) {
    }

    ngOnInit() {
        this.adId = this._route.snapshot.data['adId'];
    }
}
