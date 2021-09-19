import {Component, Inject, Injector, Input, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {EBrokerInstance} from "@app/interfaces/broker/broker";
import {BrokerService} from "@app/services/broker.service";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../localization/token";
import { PrivacyPolicyTradingModalComponent } from 'modules/Shared/components/privacy-policy-trading/privacy-policy-trading.component';

export interface BrokerDialogData {
    brokerType: EBrokerInstance;
}

@Component({
    selector: 'broker-dialog',
    templateUrl: './broker-dialog.component.html',
    styleUrls: ['./broker-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SettingsTranslateService
        }
    ]
})
export class BrokerDialogComponent extends Modal implements OnInit {
    EBrokerInstance = EBrokerInstance;
    private _initialized: boolean;

    public policyAccepted: boolean = false;

    get brokerType() {
        return this.data.brokerType;
    }

    get isTradingAllowed(): boolean {
        return this._brokerService.isTradingAllowed;
    } 

    constructor(private _injector: Injector,                
                @Inject(MAT_DIALOG_DATA) public data: BrokerDialogData,
                protected _dialog: MatDialog,
                private _brokerService: BrokerService) {
        super(_injector);
    }

    privacyPolicy() {
        this._dialog.open(PrivacyPolicyTradingModalComponent, {
            backdropClass: 'backdrop-background'
        });
    }

    ngOnInit() {
        this._brokerService.activeBroker$
            .subscribe((broker) => {       
                console.log("BROKER:");
                console.log(broker);                
                if (this._initialized) {
                    this.close();                
                }
            });
            this._initialized = true;
    }

    captionText() {
        switch (this.brokerType) {
            case EBrokerInstance.MT4: return "MT4";
            case EBrokerInstance.MT5: return "MT5";
            case EBrokerInstance.Binance: return "Binance (Spot)";
            case EBrokerInstance.BinanceFuturesUSD: return "Binance (USDT Futures)";
            case EBrokerInstance.BinanceFuturesCOIN: return "Binance (COIN Futures)";
        }
    } 

}
