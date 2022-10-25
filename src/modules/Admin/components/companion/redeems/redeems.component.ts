import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { IRedeemResponse } from 'modules/Companion/models/models';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { catchError } from 'rxjs/operators';
import { AddRedeemComponent } from '../add-redeem/add-redeem.component';

interface IRedeemsFiltrationParams {
    isCompleted?: boolean;
    search: string;
    endDate: string;
    startDate: string;
}

class CompanionWalletsFiltrationParams extends FiltrationParams<IRedeemsFiltrationParams> implements IRedeemsFiltrationParams {
    endDate: string;
    search: string;
    startDate: string;
    isCompleted?: boolean;

    toObject(): IRedeemsFiltrationParams {
        return {
            endDate: this.toUTCDayEndSecondsString(this.endDate),
            search: this.search,
            isCompleted: this.isCompleted,
            startDate: this.toUTCSecondsString(this.startDate)
        };
    }

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}

@Component({
    selector: 'redeems',
    templateUrl: './redeems.component.html',
    styleUrls: ['./redeems.component.scss']
})
export class RedeemsComponent extends PaginationComponent<IRedeemResponse> implements OnInit {
    loading = false;
    list: IRedeemResponse[];
    ComponentIdentifier = ComponentIdentifier;
    filtrationParams = new CompanionWalletsFiltrationParams();
    endedSelectedState: string;
    completedStateOptions = ["Not Completed", "Completed", "All"];
    completedSelectedState: string;

    get startDate() {
        return this.filtrationParams.startDate;
    }

    set startDate(value: string) {
        this.filtrationParams.startDate = value;
    }

    get endDate() {
        return this.filtrationParams.endDate;
    }

    set endDate(value: string) {
        this.filtrationParams.endDate = value;
    }
    get isCompleted() {
        return this.filtrationParams.isCompleted;
    }

    set isCompleted(value: boolean) {
        this.filtrationParams.isCompleted = value;
    }

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _matDialog: MatDialog,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        super();
        this.list = [];
        this.completedSelectedState = this.completedStateOptions[0];
        this.filtrationParams.isCompleted = this.getCompletedStateValue();
    }

    ngOnInit() {
        this.getItems().subscribe((items) => {
            if (items) {
                this.setPaginationHandler(items);
            }
        });
    }

    getItems(): Observable<IPaginationResponse<IRedeemResponse>> {
        return this._companionUserTrackerService.getRedeemsFilteredList(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IRedeemResponse>, PageEvent]): void {
        this.list = response[0].items;
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    clearDatePickers() {
        this.filtrationParams.clearDateParams();
        this.resetPagination();
    }

    onSearchValueChange(term: string) {
        this.filtrationParams.search = term;
        this.resetPagination();
    }

    completedStateChanged(state: string) {
        this.completedSelectedState = state;
        this.filtrationParams.isCompleted = this.getCompletedStateValue();
        this.resetPagination();
    }
    
    getCompletedStateValue() {
        switch (this.completedSelectedState) {
            case "Completed": return true;
            case "Not Completed": return false;
            default: return undefined;
        }
    }

    addRedeemCode() {
        this._matDialog.open<AddRedeemComponent>(AddRedeemComponent).afterClosed().subscribe((_) => {
            if (_) {
                this.getItems().subscribe((items) => {
                    if (items) {
                        this.setPaginationHandler(items);
                    }
                });
            }
        });
    }
}
