import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {EBrokerInstance} from "@app/interfaces/broker/broker";
import { MatDialog } from '@angular/material/dialog';
import { BrokerDialogComponent, BrokerDialogData } from '../../../broker/components/broker/broker-dialog/broker-dialog.component';
import { tap } from 'rxjs/operators';
import { APP_TYPE_BROKERS } from '@app/enums/ApplicationType';
import bind from "bind-decorator";
import { of } from 'rxjs';

@Component({
    selector: 'bridge-broker-type-selector',
    templateUrl: 'bridge-broker-type-selector.component.html',
    styleUrls: ['bridge-broker-type-selector.component.scss']    
})
export class BridgeBrokerTypeSelectorComponent implements OnInit, OnChanges {
    public availableBrokers: EBrokerInstance[] = [];
    public selectedBroker: EBrokerInstance;

    get currentBrokerInstance(): EBrokerInstance {
        if (this._brokerService.activeBroker) {
            return this._brokerService.activeBroker.instanceType;
        }
    }

    get isBrokerConnected() {
        return !!this._brokerService.activeBroker;
    }
    
    get brokerType(): string {
        return this._brokerService.activeBroker ? this._brokerService.activeBroker.instanceType : "None";
    }

    constructor(private _brokerService: BrokerService,   
                private _dialog: MatDialog) {
    }

    ngOnInit() {
        this.availableBrokers = APP_TYPE_BROKERS;
        this.selectedBroker = this.availableBrokers[0];        
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    disconnectCurrentBroker() {
        this._brokerService.disposeActiveBroker()
            .subscribe(() => this.clearSelectedBroker());
    }

    onBrokerSelect(broker: EBrokerInstance) {
       this.selectedBroker = broker;
    }

    @bind
    captionText(value: EBrokerInstance) {
        switch (value) {
            case EBrokerInstance.MT4: return of("MT4");
            case EBrokerInstance.MT5: return of("MT5");
            case EBrokerInstance.Binance: return of("Binance (Spot)");
            case EBrokerInstance.BinanceFuturesUSD: return of("Binance (Futures USD)");
            case EBrokerInstance.BinanceFuturesCOIN: return of("Binance (Futures COIN)");
        }

        return of("Undefined");
    } 
    
    connectCurrentBroker() {
        // show MT Bridge for all users even without subscriptions
        // if (!this._identityService.isAuthorizedCustomer) {
        //     this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
        //     return;
        // }

        const ref = this._dialog.open<BrokerDialogComponent, BrokerDialogData>(BrokerDialogComponent, {
            data: {
                brokerType: this.selectedBroker
            }
        }).afterClosed()
            .pipe(
                tap(() => {
                    if (!this._brokerService.activeBroker) {
                        this.clearSelectedBroker();
                    }
                })
            )
            .subscribe(res => {              
            });
    }

    clearSelectedBroker() {       
    }
}