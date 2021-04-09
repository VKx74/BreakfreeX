import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppRoutes} from "AppRoutes";
import {NavigationEnd, Router, RouterEvent} from "@angular/router";
import {Observable, of} from "rxjs";
import {BrokerService} from "@app/services/broker.service";
import {filter, map, startWith} from "rxjs/operators";
import {IBroker} from "@app/interfaces/broker/broker";
import {LayoutManagerService} from "angular-golden-layout";

@Component({
    selector: 'platform-nav',
    templateUrl: './platform-nav.component.html',
    styleUrls: ['./platform-nav.component.scss'],
})
export class PlatformNavComponent implements OnInit, AfterViewInit, OnDestroy {
    activeBroker$ = this._brokerService.activeBroker$ as Observable<IBroker>;
    isPlatformRoot$ = this._router.events
        .pipe(
            startWith(new NavigationEnd(0, this._router.url, this._router.url)),
            filter((e: RouterEvent) => e instanceof NavigationEnd),
            map((e: NavigationEnd) => {
                return e.urlAfterRedirects === `/${AppRoutes.Platform}`;
            }),
        );
        
    isAcademy$ = this._router.events
        .pipe(
            startWith(new NavigationEnd(0, this._router.url, this._router.url)),
            filter((e: RouterEvent) => e instanceof NavigationEnd),
            map((e: NavigationEnd) => {
                return e.urlAfterRedirects === `/${AppRoutes.Platform}/${AppRoutes.Academy}`;
            }),
        );

    get activeBroker() {
        return this._brokerService.activeBroker;
    }

    constructor(private _router: Router,
                private _brokerService: BrokerService,
                private _layoutService: LayoutManagerService) {
    }

    ngOnInit() {
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


    onWalletMenuToggle(state: boolean) {
    }

    openModalWithdraw() {
    }

    openModalDeposit() {
    }

    toObs(str: string) {
        return of(str);
    }
}
