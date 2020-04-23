import {Component, Injector, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../../localization/token";
import {Modal} from "Shared";
import {
    OrderConfiguratorSubmitHandler,
    OrderConfig
} from "../crypto-order-configurator/crypto-order-configurator.component";

export interface ICryptoOrderFormConfig {
    tradeConfig: OrderConfig;
    skipOrderPlacing: boolean;
}

@Component({
    selector: 'crypto-order-configuration-modal',
    templateUrl: './crypto-order-configurator-modal.component.html',
    styleUrls: ['./crypto-order-configurator-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class CryptoOrderConfiguratorModalComponent extends Modal<ICryptoOrderFormConfig> implements OnInit {
    submitHandler: OrderConfiguratorSubmitHandler;

    public get orderConfig(): OrderConfig {
        if (this.data && this.data.tradeConfig)
            return this.data.tradeConfig;
        else
            return OrderConfig.create();
    }

    constructor(injector: Injector) {
        super(injector);

        this.submitHandler = (config: OrderConfig) => {
            this.close(config);
        };
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}
