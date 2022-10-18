import {Component, Input, OnInit} from '@angular/core';
import { IUserWalletResponse, IWithdrawResponse } from 'modules/Companion/models/models';

@Component({
    selector: 'companion-wallet-withdraw',
    templateUrl: './companion-wallet-withdraw.component.html',
    styleUrls: ['./companion-wallet-withdraw.component.scss']
})
export class CompanionWalletWithdrawComponent implements OnInit {
    @Input() set wallet(value: IUserWalletResponse) {
        this.withdraws = value.withdraws.slice();
        this.withdraws = this.withdraws.sort((a, b) => this.getDate(b.date).getTime() - this.getDate(a.date).getTime());
    }

    withdraws: IWithdrawResponse[] = [];

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
