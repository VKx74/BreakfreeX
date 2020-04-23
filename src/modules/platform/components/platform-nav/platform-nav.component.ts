import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppRoutes} from "AppRoutes";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {merge, Observable, of} from "rxjs";
import {WithdrawModalComponent} from "../../../trading-dialog/components/withdraw-modal/withdraw-modal.component";
import {ModalDepositComponent} from "../../../trading-dialog/components/modal-deposit/modal-deposit.component";
import {MatDialog} from "@angular/material/dialog";
import {ApplicationType} from "@app/enums/ApplicationType";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {BrokerService} from "@app/services/broker.service";
import {MatMenuTrigger} from "@angular/material/menu";
import {catchError, filter, map, mergeMap, startWith, switchMap, takeUntil, tap} from "rxjs/operators";
import {IBroker} from "@app/interfaces/broker/broker";
import {BitmexBrokerService} from "@app/services/bitmex.exchange/bitmex.broker.service";
import {IWallet} from "../../../Trading/models/crypto/crypto.models";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {memoize} from "@decorators/memoize";
import {LayoutManagerService} from "angular-golden-layout";

@Component({
    selector: 'platform-nav',
    templateUrl: './platform-nav.component.html',
    styleUrls: ['./platform-nav.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformNavComponent implements OnInit, AfterViewInit, OnDestroy {
    ApplicationType = ApplicationType;
    applicationType$ = this._applicationTypeService.applicationTypeChanged;
    activeBroker$ = this._brokerService.activeBroker$ as Observable<CryptoBroker>;
    isPlatformRoot$ = this._router.events
        .pipe(
            startWith(new NavigationEnd(0, this._router.url, this._router.url)),
            filter((e: RouterEvent) => e instanceof NavigationEnd),
            map((e: NavigationEnd) => {
                return e.urlAfterRedirects === `/${AppRoutes.Platform}`;
            }),
        );

    get activeBroker() {
        return this._brokerService.activeBroker as CryptoBroker;
    }

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _brokerService: BrokerService,
                private _layoutService: LayoutManagerService,
                private _applicationTypeService: ApplicationTypeService,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
        // this._brokerService.activeBroker$
        //     .pipe(
        //         switchMap(activeBroker => {
        //             if (activeBroker && this.isCryptoBroker(activeBroker)) {
        //                 this._subscribeToWalletsUpdate(activeBroker);
        //                 return activeBroker.getWallets(true);
        //             }
        //             return of(null);
        //         })
        //     ).subscribe(res => {
        //     this.wallets = res || [];
        // });
    }

    handleAddComponent(componentIdentifier: string) {
        this._layoutService.addComponentAsColumn({
            layoutItemName: componentIdentifier,
            state: null
        });
    }

    ngOnDestroy() {
    }

    ngAfterViewInit(): void {
    }

    private _subscribeToWalletsUpdate(activeBroker: CryptoBroker) {
        // if (this.walletsUpdateSubscription) {
        //     this.walletsUpdateSubscription.unsubscribe();
        // }
        //
        // this.walletsUpdateSubscription = activeBroker
        //     .onWalletsInfoUpdated
        //     .pipe(
        //         switchMap(() => activeBroker.getWallets(true))
        //     ).subscribe((res) => {
        //         if (res && res.length) {
        //             this.wallets = res;
        //         }
        //     });
    }

    private isCryptoBroker(broker: IBroker): broker is CryptoBroker {
        return broker instanceof BitmexBrokerService;
    }

    onWalletMenuToggle(state: boolean) {
        // this.walletsMenuState = state;
    }

    openModalWithdraw() {
        this._dialog.open(WithdrawModalComponent, {});
    }

    openModalDeposit() {
        this._dialog.open(ModalDepositComponent, {});
    }

    @memoize()
    getWalletsObs(): Observable<IWallet[]> {
        return this.activeBroker$
            .pipe(
                filter(broker => broker && broker instanceof CryptoBroker),
                // tap(br => console.log(br)),
                // mergeMap(broker =>
                //     broker.onWalletsInfoUpdated
                //         .pipe(
                //             tap(() => console.log(broker)),
                //             map(() => broker))
                // ),
                switchMap((broker) => {
                    return broker.getWallets()
                        .pipe(
                            catchError(() => of([]))
                        );
                    }
                ),
            );
    }

    toObs(str: string) {
        return of(str);
    }
}
