import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {APP_TYPE_BROKERS, ApplicationType} from "@app/enums/ApplicationType";
import {BrokerService} from "@app/services/broker.service";
import {EBrokerInstance} from "@app/interfaces/broker/broker";
import {
    BrokerDialogComponent,
    BrokerDialogData
} from "../../../broker/components/broker/broker-dialog/broker-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AlertService} from "@alert/services/alert.service";
import {tap} from "rxjs/operators";

@Component({
    selector: 'broker-select',
    templateUrl: './broker-select.component.html',
    styleUrls: ['./broker-select.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrokerSelectComponent implements OnInit, OnChanges {
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
                private _alertsService: AlertService,
                // private _brokerStorage: BrokerStorage,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
        this.availableBrokers = APP_TYPE_BROKERS[this.applicationType];
        this.selectedBroker = this.availableBrokers[0];
        // debugger
        // this._brokerService.activeBroker$
        //     .subscribe(() =>  this.selectedBroker = this.currentBrokerInstance);
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    disconnectCurrentBroker() {
        this._brokerService.disposeActiveBroker()
            .subscribe(() => this.clearSelectedBroker());
    }

    onBrokerSelect(broker) {
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
                // console.log('BROKER', res);
                // if (res) {
                //     this._brokerService.saveState()
                //         .subscribe(state => {
                //             console.log('SAVE BROKER STATE', state);
                //             this._brokerStorage.saveBrokerState(state);
                //         });
                //
                // } else {
                //     this.selectedBroker = null;
                // }
            });
    }

    clearSelectedBroker() {
        // this.selectedBroker = null;
    }
}
