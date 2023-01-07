import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IRedeemResponse } from 'modules/Companion/models/models';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'redeems-table',
    templateUrl: './redeems-table.component.html',
    styleUrls: ['./redeems-table.component.scss']
})
export class RedeemsTableComponent implements OnInit {
    @Input() redeems: IRedeemResponse[];

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

    edit(redeem: IRedeemResponse) {
        // this._matDialog.open<CompanionEditWalletWithdrawComponent, IWithdrawResponse>(CompanionEditWalletWithdrawComponent, {
        //     data: withdraw
        // }).afterClosed().subscribe((_) => {
        //     if (_) {
        //         withdraw.processed = _.processed;
        //         withdraw.tx = _.tx;
        //     }
        // });
    }

    details(redeem: IRedeemResponse) {
        // this._matDialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
        //     data: {
        //         title: 'Withdraw Details',
        //         json: deposit
        //     }
        // });
    }
    
    remove(redeem: IRedeemResponse) {
        // this._matDialog.open(ConfirmModalComponent, {
        //     data: {
        //         title: 'Delete withdraw',
        //         message: `Are you sure you want to delete withdraw #${withdraw.id}?`,
        //         onConfirm: () => {
        //             this.loading = true;
        //             this._companionUserTrackerService.deleteWithdraw(withdraw.userWalletAddress, withdraw.id).subscribe((response) => {
        //                 this.loading = false;
        //                 if (response) {
        //                     this._alertService.success("Withdraw removed");
        //                     let index = this.withdraws.findIndex((_) => _.id = withdraw.id);
        //                     this.withdraws.splice(index, 1);
        //                     this.withdraws = [...this.withdraws];
        //                     return;
        //                 }
        //                 this._alertService.error("Failed removed withdraw");
        //             }, (error) => {
        //                 this.loading = false;
        //                 this._alertService.error("Failed removed withdraw");
        //             });
        //         }
        //     }
        // });
    }
}
