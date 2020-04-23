import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../localization/token";
import { Modal } from "Shared";
import { OrderComponentSubmitHandler, OrderConfig } from '../forex-order-configurator/forex-order-configurator.component';

export interface IForexOrderFormConfig {
    submitHandler: OrderComponentSubmitHandler;
    tradeConfig: OrderConfig;
}

@Component({
    selector: 'forex-order-configuration-modal',
    templateUrl: './forex-order-configurator-modal.component.html',
    styleUrls: ['./forex-order-configurator-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class ForexOrderConfiguratorModalComponent extends Modal<IForexOrderFormConfig> implements OnInit {
    get submitHandler(): OrderComponentSubmitHandler {
        return this.data ? this.data.submitHandler : null;
    }

    public get orderConfig(): OrderConfig {
        if (this.data && this.data.tradeConfig)
            return this.data.tradeConfig;
        else
            return OrderConfig.create();
    }

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {

    }

    hide() {
        this.close();
    }
}
