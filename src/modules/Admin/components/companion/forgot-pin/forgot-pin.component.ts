import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { IForgotPasswordResponse } from 'modules/Companion/models/models';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { catchError } from 'rxjs/operators';
import { AddRedeemComponent } from '../add-redeem/add-redeem.component';

interface IForgotPinFiltrationParams {
    search: string;
    endDate: string;
    startDate: string;
}

class ForgotPinFiltrationParams extends FiltrationParams<IForgotPinFiltrationParams> implements IForgotPinFiltrationParams {
    endDate: string;
    search: string;
    startDate: string;

    toObject(): IForgotPinFiltrationParams {
        return {
            endDate: this.toUTCDayEndSecondsString(this.endDate),
            search: this.search,
            startDate: this.toUTCSecondsString(this.startDate)
        };
    }

    clearDateParams() {
        this.startDate = null;
        this.endDate = null;
    }
}

@Component({
    selector: 'forgot-pin',
    templateUrl: './forgot-pin.component.html',
    styleUrls: ['./forgot-pin.component.scss']
})
export class ForgotPinComponent extends PaginationComponent<IForgotPasswordResponse> implements OnInit {
    loading = false;
    list: IForgotPasswordResponse[];
    ComponentIdentifier = ComponentIdentifier;
    filtrationParams = new ForgotPinFiltrationParams();
    endedSelectedState: string;

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

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _matDialog: MatDialog,
        private _companionUserTrackerService: CompanionUserTrackerService) {
        super();
        this.list = [];
    }

    ngOnInit() {
        this.getItems().subscribe((items) => {
            if (items) {
                this.setPaginationHandler(items);
            }
        });
    }

    getItems(): Observable<IPaginationResponse<IForgotPasswordResponse>> {
        return this._companionUserTrackerService.getForgotPasswordFilteredList(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IForgotPasswordResponse>, PageEvent]): void {
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
}
