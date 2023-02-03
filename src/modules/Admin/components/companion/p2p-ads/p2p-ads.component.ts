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
import bind from "bind-decorator";


interface IP2PAccountsFiltrationParams {
    side: number;
    sort?: number;
    amount?: number;
    verified?: boolean;
    currency?: string;
    tokens?: string[];
}

class DataFiltrationParams extends FiltrationParams<IP2PAccountsFiltrationParams> implements IP2PAccountsFiltrationParams {
    side: number;
    sort?: number;
    amount?: number;
    verified?: boolean;
    currency?: string;
    tokens?: string[];

    constructor() {
        super();
        this.side = 0;
        this.sort = 1;
        this.amount = null;
        this.verified = null;
        this.currency = null;
        this.tokens = null;
    }

    toObject(): IP2PAccountsFiltrationParams {
        return {
            side: this.side,
            sort: this.sort,
            amount: this.amount,
            verified: this.verified,
            currency: this.currency,
            tokens: this.tokens
        };
    }

    clearDateParams() {
        this.side = 0;
        this.sort = null;
        this.amount = null;
        this.verified = null;
        this.currency = null;
        this.tokens = null;
    }
}

@Component({
    selector: 'p2p-ads',
    templateUrl: './p2p-ads.component.html',
    styleUrls: ['./p2p-ads.component.scss']
})
export class P2PAdsComponent extends PaginationComponent<IP2PAdResponse> {
    @Input() history: boolean;
    loading = false;
    list: IP2PAdResponse[];
    ComponentIdentifier = ComponentIdentifier;
    filtrationParams = new DataFiltrationParams();
    sideOptions: number[] = [0, 1];
    sortOptions: number[] = [0, 1, 2, 3, 4, 5];

    @bind
    sideText(value: number) {
        if (value === 0) {
            return of("Buy");
        }
        return of("Sell");
    }

    @bind
    sortText(value: number) {
        switch (value) {
            case 0: return of("User Rate");
            case 1: return of("Date");
            case 2: return of("AmountAsk");
            case 3: return of("AmountDesc");
            case 4: return of("PriceAsk");
            case 5: return of("PriceDesc");
        }
    }

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
        if (this.history) {
            return this._p2pService.getP2PAdsHistory(this.paginationParams, this.filtrationParams.toObject());
        }
        return this._p2pService.getP2PAds(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IP2PAdResponse>, PageEvent]): void {
        this.list = response[0].items;
    }

    sideChanged(value: number) {
        this.filtrationParams.side = value;
        this.resetPagination();
    }

    sortChanged(value: number) {
        this.filtrationParams.sort = value;
        this.resetPagination();
    }

    currencyChanged(value: string) {
        this.filtrationParams.currency = value;
        this.resetPagination();
    }

    coinChanged(value: string) {
        this.filtrationParams.tokens = [value];
        this.resetPagination();
    }

    amountChanged(value: string) {
        try {
            this.filtrationParams.amount = Number(value);
            this.resetPagination();
        } catch (ex) {
            this.filtrationParams.amount = undefined;
            this.resetPagination();
        }
    }

    reloadNeeded() {
        this.getItems().subscribe((items) => {
            if (items) {
                this.setPaginationHandler(items);
            }
        });
    }
}
