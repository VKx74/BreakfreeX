import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../localization/token";
import { Modal } from "Shared";
import { BrokerService } from '@app/services/broker.service';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { IInstrument } from '@app/models/common/instrument';
import { OrderSide, OrderTypes } from 'modules/Trading/models/models';

export type OrderComponentSubmitHandler = (config: any) => void;
export type OrderSubmitHandler = (config: any) => void;

export interface BaseOrderConfig {
    instrument: IInstrument;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    price?: number;
    timeframe?: number;
    lastPrice?: number;
}

export interface OrderFormConfig {
    submitHandler: OrderComponentSubmitHandler;
    orderPlacedHandler: OrderSubmitHandler;
    orderConfig: BaseOrderConfig;
}

@Component({
    selector: 'order-configuration-modal',
    templateUrl: './order-configurator-modal.component.html',
    styleUrls: ['./order-configurator-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class OrderConfiguratorModalComponent extends Modal<OrderFormConfig> implements OnInit {
    EBrokerInstance = EBrokerInstance;
    symbol: string;

    public get orderConfig(): any {
        if (this.data && this.data.orderConfig)
            return this.data.orderConfig;
    }
    
    get brokerInstance(): EBrokerInstance {
        return this.brokerService.activeBroker ? this.brokerService.activeBroker.instanceType : null;
    }
    
    get submitHandler(): OrderComponentSubmitHandler {
        return this.data ? this.data.submitHandler : null;
    }

    constructor(private injector: Injector, private brokerService: BrokerService) {
        super(injector);
    }

    orderPlaced(order: any) {
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
