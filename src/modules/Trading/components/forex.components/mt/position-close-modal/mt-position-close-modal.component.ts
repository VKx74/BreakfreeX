import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MTOrder, MTPosition } from 'modules/Trading/models/forex/mt/mt.models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { AlertService } from '@alert/services/alert.service';
import { OrderFillPolicy } from 'modules/Trading/models/models';
import { BrokerService } from '@app/services/broker.service';

@Component({
    selector: 'mt-position-close-modal',
    templateUrl: './mt-position-close-modal.component.html',
    styleUrls: ['./mt-position-close-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MTPositionCloseModalComponent extends Modal<MTOrder> implements OnInit {
    protected get _mtBroker(): MTBroker {
        return this._broker.activeBroker as MTBroker;
    }
    
    public get position(): MTPosition {
        return this.data;
    }  
    
    public showSpinner: boolean = false;

    constructor(injector: Injector, protected _broker: BrokerService, protected _alertService: AlertService) {
        super(injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }

    hide() {
        this.close();
    }
    
    submit() {
        this.showSpinner = true;
        this._mtBroker.closePosition(this.position.Symbol, OrderFillPolicy.IOC)
        .subscribe( (result) => {
            if (result.result) {
                this._alertService.success("Position closed");
                this.showSpinner = false;
                this.close();
            } else {
                this._alertService.error("Failed to close position: " + result.msg);
                this.showSpinner = false;
            }
        },
        (error) => {
            this._alertService.error("Failed to close position: " + error);
            this.showSpinner = false;
        });
    }
}
