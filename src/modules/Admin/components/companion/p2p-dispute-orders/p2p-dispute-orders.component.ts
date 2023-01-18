import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable, of } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { IP2POrderResponse } from 'modules/Companion/models/models';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

interface IP2OrdersFiltrationParams {
}

class DataFiltrationParams extends FiltrationParams<IP2OrdersFiltrationParams> implements IP2OrdersFiltrationParams {
    constructor() {
        super();
    }

    toObject(): IP2OrdersFiltrationParams {
        return {
        };
    }

    clearDateParams() {
    }
}

@Component({
    selector: 'p2p-dispute-orders',
    templateUrl: './p2p-dispute-orders.component.html',
    styleUrls: ['./p2p-dispute-orders.component.scss']
})
export class P2PDisputeOrdersComponent extends PaginationComponent<IP2POrderResponse> {
    loading = false;
    list: IP2POrderResponse[];
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

    getItems(): Observable<IPaginationResponse<IP2POrderResponse>> {
        return this._p2pService.getP2PDisputeOrders(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IP2POrderResponse>, PageEvent]): void {
        this.list = response[0].items;
    }
}
