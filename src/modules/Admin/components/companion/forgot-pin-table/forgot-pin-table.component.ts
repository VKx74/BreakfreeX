import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute } from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { IForgotPasswordResponse } from 'modules/Companion/models/models';
import { AlertService } from '@alert/services/alert.service';
import { ConfirmModalComponent } from 'UI';

@Component({
    selector: 'forgot-pin-table',
    templateUrl: './forgot-pin-table.component.html',
    styleUrls: ['./forgot-pin-table.component.scss']
})
export class ForgotPinTableComponent implements OnInit {
    @Input() items: IForgotPasswordResponse[];

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
    
    remove(item: IForgotPasswordResponse) {
        this._matDialog.open(ConfirmModalComponent, {
            data: {
                title: 'Delete record',
                message: `Are you sure you want to delete record #${item.id}?`,
                onConfirm: () => {
                    this.loading = true;
                    this._companionUserTrackerService.deleteForgotPassword(item.wallet, item.id).subscribe((response) => {
                        this.loading = false;
                        if (response) {
                            this._alertService.success("Item removed");
                            let index = this.items.findIndex((_) => _.id = item.id);
                            this.items.splice(index, 1);
                            this.items = [...this.items];
                            return;
                        }
                        this._alertService.error("Failed removed item");
                    }, (error) => {
                        this.loading = false;
                        this._alertService.error("Failed removed item");
                    });
                }
            }
        });
    }
}
