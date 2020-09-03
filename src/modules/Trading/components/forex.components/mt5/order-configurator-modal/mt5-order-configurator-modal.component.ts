import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MT5OrderConfig, MT5OrderComponentSubmitHandler } from '../order-configurator/mt5-order-configurator.component';

export interface IMT5OrderFormConfig {
    submitHandler: MT5OrderComponentSubmitHandler;
    tradeConfig: MT5OrderConfig;
}

@Component({
    selector: 'mt5-order-configuration-modal',
    templateUrl: './mt5-order-configurator-modal.component.html',
    styleUrls: ['./mt5-order-configurator-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MT5OrderConfiguratorModalComponent extends Modal<IMT5OrderFormConfig> implements OnInit {
    get submitHandler(): MT5OrderComponentSubmitHandler {
        return this.data ? this.data.submitHandler : null;
    }

    public get orderConfig(): MT5OrderConfig {
        if (this.data && this.data.tradeConfig)
            return this.data.tradeConfig;
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
