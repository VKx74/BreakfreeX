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
    id: number;
}

class DataFiltrationParams extends FiltrationParams<IP2OrdersFiltrationParams> implements IP2OrdersFiltrationParams {
    id: number;
    constructor() {
        super();
    }

    toObject(): IP2OrdersFiltrationParams {
        return {
            id: this.id
        };
    }

    clearDateParams() {
    }
}

@Component({
    selector: 'p2p-ad-orders',
    templateUrl: './p2p-ad-orders.component.html',
    styleUrls: ['./p2p-ad-orders.component.scss']
})
export class P2PAdOrdersComponent extends PaginationComponent<IP2POrderResponse> {
    @Input() adId: number;
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
        this.reloadNeeded();
    }

    getItems(): Observable<IPaginationResponse<IP2POrderResponse>> {
        this.filtrationParams.id = this.adId;
        return this._p2pService.getP2PAdOrders(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IP2POrderResponse>, PageEvent]): void {
        this.list = response[0].items;
    }

    reloadNeeded() {
        this.getItems().subscribe((items) => {
            if (items) {
                this.setPaginationHandler(items);
            }
        });
    }
}
