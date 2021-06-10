import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BrokerService} from "@app/services/broker.service";
import {EBrokerInstance} from "@app/interfaces/broker/broker";
import { MatDialog } from '@angular/material/dialog';
import { BrokerDialogComponent, BrokerDialogData } from '../../../broker/components/broker/broker-dialog/broker-dialog.component';
import { tap } from 'rxjs/operators';
import { APP_TYPE_BROKERS } from '@app/enums/ApplicationType';
import bind from "bind-decorator";
import { of } from 'rxjs';
import { AlertService } from '@alert/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'bridge-broker-type-selector',
    templateUrl: 'bridge-broker-type-selector.component.html',
    styleUrls: ['bridge-broker-type-selector.component.scss']    
})
export class BridgeBrokerTypeSelectorComponent implements OnInit, OnChanges {
    public availableBrokers: EBrokerInstance[] = [];
    public selectedBroker: EBrokerInstance;
    public loading: boolean = false;

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

    constructor(protected _translateService: TranslateService,
                protected _brokerService: BrokerService,
                protected _alertService: AlertService,
                protected _dialog: MatDialog) {
    }

    ngOnInit() {
        this.availableBrokers = APP_TYPE_BROKERS.slice();

        // if (this._brokerService.defaultAccounts.find(_ => !_.isLive)) {
        //     this.availableBrokers.unshift(EBrokerInstance.BFTDemo);
        // }

        // if (this._brokerService.defaultAccounts.find(_ => _.isLive)) {
        //     this.availableBrokers.unshift(EBrokerInstance.BFTFundingLive);
        // }

        this.availableBrokers.unshift(EBrokerInstance.BFTFundingLive);
        this.availableBrokers.unshift(EBrokerInstance.BFTFundingDemo);
        this.availableBrokers.unshift(EBrokerInstance.BFTDemo);

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
            case EBrokerInstance.BFTDemo: return of("Breakfree Trading - Demo");
            case EBrokerInstance.BFTFundingDemo: return of("Breakfree Funding - Stage");
            case EBrokerInstance.BFTFundingLive: return of("Breakfree Funding - Live");
        }

        return of("Undefined");
    } 
    
    connectCurrentBroker() {
        if (this.selectedBroker === EBrokerInstance.BFTDemo || 
            this.selectedBroker === EBrokerInstance.BFTFundingDemo || 
            this.selectedBroker === EBrokerInstance.BFTFundingLive) {
            this.loading = true;
            this._brokerService.connectBFTAccount(this.selectedBroker).subscribe((setBrokerResult) => {
                if (!setBrokerResult.result) {
                    this._alertService.error(setBrokerResult.msg, "Error");
                }
                this.loading = false;
            });
            return;
        }

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