import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { IP2PUserResponse } from 'modules/Companion/models/models';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';

interface IP2PAccountsFiltrationParams {
    search: string;
}

class DataFiltrationParams extends FiltrationParams<IP2PAccountsFiltrationParams> implements IP2PAccountsFiltrationParams {
    search: string;

    toObject(): IP2PAccountsFiltrationParams {
        return {
            search: this.search
        };
    }

    clearDateParams() {
    }
}

@Component({
    selector: 'p2p-kyc-accounts',
    templateUrl: './p2p-kyc-accounts.component.html',
    styleUrls: ['./p2p-kyc-accounts.component.scss']
})
export class P2PKYCAccountsComponent extends PaginationComponent<IP2PUserResponse> implements OnInit {
    loading = false;
    list: IP2PUserResponse[];
    ComponentIdentifier = ComponentIdentifier;
    filtrationParams = new DataFiltrationParams();

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _matDialog: MatDialog,
        private _p2pService: CompanionP2PService) {
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

    getItems(): Observable<IPaginationResponse<IP2PUserResponse>> {
        return this._p2pService.getP2PAccountsKYCAwaited(this.paginationParams, this.filtrationParams.toObject());
    }

    responseHandler(response: [IPaginationResponse<IP2PUserResponse>, PageEvent]): void {
        this.list = response[0].items;
    }

    onSearchValueChange(term: string) {
        this.filtrationParams.search = term;
        this.resetPagination();
    }
}
