import {Component, Input, OnInit} from '@angular/core';
import { IEndDateDepositResponse, IUserWalletResponse } from 'modules/Companion/models/models';
import { MatDialog } from "@angular/material/dialog";
import { AddEndDateDepositComponent } from '../add-end-date-deposit/add-end-date-deposit.component';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';

@Component({
    selector: 'companion-wallet-end-date-deposit',
    templateUrl: './companion-wallet-end-date-deposit.component.html',
    styleUrls: ['./companion-wallet-end-date-deposit.component.scss']
})
export class CompanionWalletEndDateDepositComponent implements OnInit {
    private _wallet: IUserWalletResponse;

    @Input() set wallet(value: IUserWalletResponse) {
        this._wallet = value;
        this.endDateDeposits = value.endDateDeposits.slice();
        this.endDateDeposits = this.endDateDeposits.sort((a, b) => this.getDate(b.date).getTime() - this.getDate(a.date).getTime());
    }

    endDateDeposits: IEndDateDepositResponse[] = [];

    loading = false;

    constructor(private _matDialog: MatDialog, private _companionUserTrackerService: CompanionUserTrackerService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    addEndDateDeposit() {
        this._matDialog.open<AddEndDateDepositComponent>(AddEndDateDepositComponent).afterClosed().subscribe((_) => {
            if (_) {
                this._reload();
            }
        });
    }

    private _reload() {
        this._companionUserTrackerService.getWalletDetailsList(this._wallet.address).subscribe((data) => {
            this.wallet = data;
        });
    }
}
