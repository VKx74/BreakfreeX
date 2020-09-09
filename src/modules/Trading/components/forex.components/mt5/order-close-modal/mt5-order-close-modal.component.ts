import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MT5Order } from 'modules/Trading/models/forex/mt/mt.models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'mt5-order-close-modal',
    templateUrl: './mt5-order-close-modal.component.html',
    styleUrls: ['./mt5-order-close-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MT5OrderCloseModalComponent extends Modal<MT5Order> implements OnInit {
    public get order(): MT5Order {
        return this.data;
    }  
    
    public amountToClose: number;
    public minAmountValue: number = 0.01;
    public sizeStep: number = 0.01;
    public showSpinner: boolean = false;

    constructor(injector: Injector, protected _mt5Broker: MT5Broker, protected _alertService: AlertService) {
        super(injector);
    }

    ngOnInit() {
        this.amountToClose = this.order.Size;
        const symbol = this.order.Symbol;
        this.sizeStep =  this._mt5Broker.instrumentAmountStep(symbol);
        this.minAmountValue =  this._mt5Broker.instrumentMinAmount(symbol);
    }

    ngOnDestroy() {

    }

    hide() {
        this.close();
    }
    
    submit() {
        this.showSpinner = true;
        this._mt5Broker.closeOrder(this.order.Id, this.amountToClose).subscribe(
            (result) => {
                this.showSpinner = false;
                if (result.result) {
                    this._alertService.success("Order closed");
                    this.close();
                } else {
                    this._alertService.error("Failed to close order: " + result.msg);
                }
            },
            (error) => {
                this.showSpinner = false;
                this._alertService.error("Failed to close order: " + error);
            }
        );
    }

    resetAmount() {
        this.amountToClose = this.order.Size;
    }
}
