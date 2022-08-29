import {Component, Input, OnInit} from '@angular/core';
import { IEndDateDepositResponse, IUserWalletResponse } from 'modules/Companion/models/models';

@Component({
    selector: 'companion-wallet-end-date-deposit',
    templateUrl: './companion-wallet-end-date-deposit.component.html',
    styleUrls: ['./companion-wallet-end-date-deposit.component.scss']
})
export class CompanionWalletEndDateDepositComponent implements OnInit {
    @Input() set wallet(value: IUserWalletResponse) {
        this.endDateDeposits = value.endDateDeposits.slice();
        this.endDateDeposits = this.endDateDeposits.sort((a, b) => this.getDate(b.date).getTime() - this.getDate(a.date).getTime());
    }

    endDateDeposits: IEndDateDepositResponse[] = [];

    loading = false;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    getDate(date: string): Date {
        return new Date(date);
    }
}
