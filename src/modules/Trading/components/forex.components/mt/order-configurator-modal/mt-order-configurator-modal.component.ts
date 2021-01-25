import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MTOrderConfig, MTOrderComponentSubmitHandler, MTOrderSubmitHandler } from '../order-configurator/mt-order-configurator.component';
import { MTPlaceOrder } from 'modules/Trading/models/forex/mt/mt.models';

export interface IMT5OrderFormConfig {
    submitHandler: MTOrderComponentSubmitHandler;
    orderPlacedHandler: MTOrderSubmitHandler;
    tradeConfig: MTOrderConfig;
}

@Component({
    selector: 'mt-order-configuration-modal',
    templateUrl: './mt-order-configurator-modal.component.html',
    styleUrls: ['./mt-order-configurator-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MTOrderConfiguratorModalComponent extends Modal<IMT5OrderFormConfig> implements OnInit {
    public symbol: string;
    
    get submitHandler(): MTOrderComponentSubmitHandler {
        return this.data ? this.data.submitHandler : null;
    }

    public get orderConfig(): MTOrderConfig {
        if (this.data && this.data.tradeConfig)
            return this.data.tradeConfig;
    }

    constructor(injector: Injector) {
        super(injector);
    }

    orderPlaced(order: MTPlaceOrder) {
        if (this.data && this.data.orderPlacedHandler) {
            this.data.orderPlacedHandler(order);
        }
    }

    ngOnInit() {
        const innerWidth = window.innerWidth;
        const innerHeight = window.innerHeight;

        if (innerWidth > 600 && innerHeight > 600) {
            this.dialogRef.updatePosition({ top: '150px', left: '70px' });
        }
    }

    ngOnDestroy() {

    }

    hide() {
        this.close();
    }

    instrumentSelected(symbol: string) {
        this.symbol = symbol;
    }
}
