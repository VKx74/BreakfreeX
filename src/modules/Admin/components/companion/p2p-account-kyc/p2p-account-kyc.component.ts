import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { PaginationComponent, IPaginationResponse } from "@app/models/pagination.model";
import { Observable } from "rxjs";
import { PageEvent } from "@angular/material/typings/paginator";
import { FiltrationParams } from "@app/models/filtration-params";
import { ComponentIdentifier } from "@app/models/app-config";
import { IP2PUserKYCResponse, IP2PUserResponse } from 'modules/Companion/models/models';
import { CompanionUserTrackerService } from 'modules/Admin/services/companion.user.tracker.service';
import { CompanionP2PService } from 'modules/Admin/services/companion.p2p.service';
import { DomSanitizer } from '@angular/platform-browser';
import { IKYCStatusChangeData, KYCStatusChangeComponent } from '../p2p-kyc-status-change/p2p-kyc-status-change.component';

@Component({
    selector: 'p2p-account-kyc',
    templateUrl: './p2p-account-kyc.component.html',
    styleUrls: ['./p2p-account-kyc.component.scss']
})
export class P2PAccountKYCComponent {
    @Input() accountId: number;
    @Input() accountWallet: string;
    loading = false;
    data: IP2PUserResponse;
    kyc: IP2PUserKYCResponse;
    files: string[] = [];

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _matDialog: MatDialog,
        private _sanitizer: DomSanitizer,
        private _p2pService: CompanionP2PService) {
    }

    ngAfterViewInit() {
        this.loadData();
    }

    loadData() {
        this._p2pService.getP2PAccountInfo(this.accountWallet).subscribe((_) => {
            this.data = _;
            if (_) {
                this.kyc = _.kyc;
            }
        });

        this._p2pService.getP2PAccountKYCDocs(this.accountWallet).subscribe((_) => {
            this.files = _;
        });
    }

    getUrl(url: string) {
        return this._sanitizer.bypassSecurityTrustResourceUrl(`https://files-stage.breakfreetrading.com/filestore/api/v1/Files/${atob(url)}`);
    }

    getDate(date: string): Date {
        return new Date(date);
    }

    getStatus() {
        if (!this.kyc) {
            return "None";
        }

        switch (this.kyc.status) {
            case 0: return "Pending";
            case 1: return "Approved";
            case 2: return "Rejected";
        }
    }

    approve() {
        this._matDialog.open<KYCStatusChangeComponent, IKYCStatusChangeData>(KYCStatusChangeComponent, {
            data: {
                id: this.kyc.id,
                isApproving: true
            }
        }).afterClosed().subscribe((_) => {
            if (_) {
                this.loadData();
            }
        });
    }

    reject() {
        this._matDialog.open<KYCStatusChangeComponent, IKYCStatusChangeData>(KYCStatusChangeComponent, {
            data: {
                id: this.kyc.id,
                isApproving: false
            }
        }).afterClosed().subscribe((_) => {
            if (_) {
                this.loadData();
            }
        });
    }

}
