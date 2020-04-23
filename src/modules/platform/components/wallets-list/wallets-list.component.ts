import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {merge, Observable, of} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {IWallet} from "../../../Trading/models/crypto/crypto.models";
import {catchError, filter, map, switchMap} from "rxjs/operators";
import {memoize} from "@decorators/memoize";

@Component({
    selector: 'wallets-list',
    templateUrl: './wallets-list.component.html',
    styleUrls: ['./wallets-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsListComponent implements OnInit {
    @Input() wallets: IWallet[];
    activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker>;
    activeWallet$ = this.activeBroker.activeWallet$;

    get activeWallet() {
        const activeBroker = this.activeBroker;
        return activeBroker ? activeBroker.activeWallet : null;
    }

    get activeBroker(): CryptoBroker {
        return this._brokerService.activeBroker as CryptoBroker;
    }

    constructor(private _dialog: MatDialog,
                private _brokerService: BrokerService) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    onSelect(e) {
        this.changeActiveWallet(e.value);
    }

    trackBy(index, wallet: IWallet) {
        return wallet.address;
    }

    changeActiveWallet(wallet: IWallet) {
        if (this.activeBroker && wallet !== this.activeWallet) {
            this.activeBroker.setActiveWallet(wallet);
        }
    }

    @memoize()
    getWalletsObs() {
        return this.activeBroker$
            .pipe(
                filter(broker => !!broker),
                switchMap(broker => merge(
                    of(broker),
                    broker.onWalletsInfoUpdated
                        .pipe(map(() => broker))
                )),
                switchMap((broker) => broker.getWallets(true)
                    .pipe(catchError(() => []))
                )
            );
    }
}
