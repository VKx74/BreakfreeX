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

interface BrokerInstanceDescription {
    broker: EBrokerInstance;
    brokerId?: any;
}

@Component({
    selector: 'bridge-broker-type-selector',
    templateUrl: 'bridge-broker-type-selector.component.html',
    styleUrls: ['bridge-broker-type-selector.component.scss']    
})
export class BridgeBrokerTypeSelectorComponent implements OnInit, OnChanges {
    public availableBrokers: BrokerInstanceDescription[] = [];
    public selectedBroker: BrokerInstanceDescription;

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
        // this.availableBrokers = APP_TYPE_BROKERS.slice();
        const brokers = APP_TYPE_BROKERS.slice();

        for (const broker of brokers) {
            this.availableBrokers.push({
                broker: broker
            });
        }

        // if (this._brokerService.defaultAccounts.find(_ => !_.isLive)) {
        //     this.availableBrokers.unshift(EBrokerInstance.BFTDemo);
        // }

        // if (this._brokerService.defaultAccounts.find(_ => _.isLive)) {
        //     this.availableBrokers.unshift(EBrokerInstance.BFTFundingLive);
        // }

        const fundingLiveAccounts = this._brokerService.getBFTAccount(EBrokerInstance.BFTFundingLive);
        const fundingDemoAccounts = this._brokerService.getBFTAccount(EBrokerInstance.BFTFundingDemo);
        const demoAccounts = this._brokerService.getBFTAccount(EBrokerInstance.BFTDemo);

        if (fundingLiveAccounts && fundingLiveAccounts.length > 1) {
            for (const liveAccount of fundingLiveAccounts) {
                this.availableBrokers.unshift({
                    broker: EBrokerInstance.BFTFundingLive,
                    brokerId: liveAccount.id
                });
            }
        } else {
            this.availableBrokers.unshift({
                broker: EBrokerInstance.BFTFundingLive
            });
        } 
        
        if (fundingDemoAccounts && fundingDemoAccounts.length > 1) {
            for (const liveAccount of fundingDemoAccounts) {
                this.availableBrokers.unshift({
                    broker: EBrokerInstance.BFTFundingDemo,
                    brokerId: liveAccount.id
                });
            }
        } else {
            this.availableBrokers.unshift({
                broker: EBrokerInstance.BFTFundingDemo
            });
        } 
        
        
        if (demoAccounts && demoAccounts.length > 1) {
            for (const liveAccount of demoAccounts) {
                this.availableBrokers.unshift({
                    broker: EBrokerInstance.BFTDemo,
                    brokerId: liveAccount.id
                });
            }
        } else {
            this.availableBrokers.unshift({
                broker: EBrokerInstance.BFTDemo
            });
        }

        // this.availableBrokers.unshift(EBrokerInstance.BFTFundingLive);
        // this.availableBrokers.unshift(EBrokerInstance.BFTFundingDemo);
        // this.availableBrokers.unshift(EBrokerInstance.BFTDemo);

        this.selectedBroker = this.availableBrokers[0];       
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    disconnectCurrentBroker() {
        this._brokerService.disposeActiveBroker()
            .subscribe(() => this.clearSelectedBroker());
    }

    onBrokerSelect(broker: BrokerInstanceDescription) {
       this.selectedBroker = broker;
    }

    @bind
    captionText(value: BrokerInstanceDescription) {
        let id = "";
        if (value.brokerId) {
            id = ` ${value.brokerId}`;
        }
        switch (value.broker) {
            case EBrokerInstance.MT4: return of(`Metatrader 4 (MT4)${id}`);
            case EBrokerInstance.MT5: return of(`Metatrader 5 (MT5)${id}`);
            case EBrokerInstance.Binance: return of(`Binance (Spot)${id}`);
            case EBrokerInstance.BinanceFuturesUSD: return of(`Binance (USDT Futures)${id}`);
            case EBrokerInstance.BinanceFuturesCOIN: return of(`Binance (COIN Futures)${id}`);
            case EBrokerInstance.BFTDemo: return of(`Breakfree Trading - Demo${id}`);
            case EBrokerInstance.BFTFundingDemo: return of(`Breakfree Funding - Demo${id}`);
            case EBrokerInstance.BFTFundingLive: return of(`Breakfree Funding - Live${id}`);
        }

        return of("Undefined");
    } 
    
    connectCurrentBroker() {
        if (this.selectedBroker.broker === EBrokerInstance.BFTDemo || 
            this.selectedBroker.broker === EBrokerInstance.BFTFundingDemo || 
            this.selectedBroker.broker === EBrokerInstance.BFTFundingLive) {
            this.loading = true;
            this._brokerService.connectBFTAccount(this.selectedBroker.broker, this.selectedBroker.brokerId).subscribe((setBrokerResult) => {
                if (!setBrokerResult.result) {
                    this._alertService.error(setBrokerResult.msg, "Error");
                }
                this.loading = false;
            });
            return;
        }

        const ref = this._dialog.open<BrokerDialogComponent, BrokerDialogData>(BrokerDialogComponent, {
            data: {
                brokerType: this.selectedBroker.broker
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