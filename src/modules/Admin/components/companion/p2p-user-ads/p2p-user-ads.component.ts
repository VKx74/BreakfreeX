import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable, of } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { IP2PAdResponse } from 'modules/Companion/models/models';
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
    selector: 'p2p-user-ads',
    templateUrl: './p2p-user-ads.component.html',
    styleUrls: ['./p2p-user-ads.component.scss']
})
export class P2PUserAdsComponent extends PaginationComponent<IP2PAdResponse> {
    @Input() id: number;
    @Input() wallet: string;

    loading = false;
    list: IP2PAdResponse[];
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

    getItems(): Observable<IPaginationResponse<IP2PAdResponse>> {
        this.filtrationParams.id = this.id;
        this.filtrationParams.wallet = this.wallet;
        return this._p2pService.getP2PUserAds(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IP2PAdResponse>, PageEvent]): void {
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
