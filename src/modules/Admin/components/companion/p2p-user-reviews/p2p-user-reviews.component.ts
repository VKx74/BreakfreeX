import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable, of } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { P2PUserReviewResponse } from 'modules/Companion/models/models';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

interface IFiltrationParams {
    id: number;
    wallet: string;
}

class DataFiltrationParams extends FiltrationParams<IFiltrationParams> implements IFiltrationParams {
    id: number;
    wallet: string;
    constructor() {
        super();
    }

    toObject(): IFiltrationParams {
        return {
            id: this.id,
            wallet: this.wallet
        };
    }

    clearDateParams() {
    }
}

@Component({
    selector: 'p2p-user-reviews',
    templateUrl: './p2p-user-reviews.component.html',
    styleUrls: ['./p2p-user-reviews.component.scss']
})
export class P2PUserReviewsComponent extends PaginationComponent<P2PUserReviewResponse> {
    @Input() id: number;
    @Input() wallet: string;

    loading = false;
    list: P2PUserReviewResponse[];
    ComponentIdentifier = ComponentIdentifier;
    filtrationParams = new DataFiltrationParams();

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _matDialog: MatDialog,
        private _p2pService: CompanionP2PService) {
        super();
        this.list = [];
    }

    ngAfterViewInit() {
        this.getItems().subscribe((items) => {
            if (items) {
                this.setPaginationHandler(items);
            }
        });
    }

     getItems(): Observable<IPaginationResponse<P2PUserReviewResponse>> {
        this.filtrationParams.id = this.id;
        this.filtrationParams.wallet = this.wallet;
        return this._p2pService.getP2PUserReview(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<P2PUserReviewResponse>, PageEvent]): void {
        this.list = response[0].items;
    }
}
