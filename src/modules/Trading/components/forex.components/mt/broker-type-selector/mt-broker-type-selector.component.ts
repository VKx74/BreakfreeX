import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {APP_TYPE_BROKERS, ApplicationType} from "@app/enums/ApplicationType";
import {BrokerService} from "@app/services/broker.service";
import {EBrokerInstance} from "@app/interfaces/broker/broker";
import { MatDialog } from '@angular/material/dialog';
import { BrokerDialogComponent, BrokerDialogData } from '../../../../../broker/components/broker/broker-dialog/broker-dialog.component';
import { tap } from 'rxjs/operators';
import {AlertService} from "@alert/services/alert.service";

@Component({
    selector: 'mt-broker-type-selector',
    templateUrl: 'mt-broker-type-selector.component.html',
    styleUrls: ['mt-broker-type-selector.component.scss']    
})
export class MTBrokerTypeSelectorComponent implements OnInit, OnChanges {
    @Input() applicationType: ApplicationType;
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
        this.availableBrokers = APP_TYPE_BROKERS[this.applicationType];
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
    
    connectCurrentBroker() {
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