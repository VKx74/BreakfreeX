import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MTOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { AlertService } from '@alert/services/alert.service';
import { OrderFillPolicy } from 'modules/Trading/models/models';

@Component({
    selector: 'mt-order-close-modal',
    templateUrl: './mt-order-close-modal.component.html',
    styleUrls: ['./mt-order-close-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MTOrderCloseModalComponent extends Modal<MTOrder> implements OnInit {
    public get order(): MTOrder {
        return this.data;
    }  
    
    public amountToClose: number;
    public minAmountValue: number = 0.01;
    public sizeStep: number = 0.01;
    public showSpinner: boolean = false;
    public fillPolicy: OrderFillPolicy = OrderFillPolicy.IOC;
    public orderFillPolicies: OrderFillPolicy[] = [OrderFillPolicy.FF, OrderFillPolicy.FOK, OrderFillPolicy.IOC];

    constructor(injector: Injector, protected _mtBroker: MTBroker, protected _alertService: AlertService) {
        super(injector);
    }

    ngOnInit() {
        this.amountToClose = this.order.Size;
        const symbol = this.order.Symbol;
        this.sizeStep =  this._mtBroker.instrumentAmountStep(symbol);
        this.minAmountValue =  this._mtBroker.instrumentMinAmount(symbol);
    }

    ngOnDestroy() {

    }

    hide() {
        this.close();
    }

    handleFillPolicySelected(type: OrderFillPolicy) {
        this.fillPolicy = type;
    }
    
    submit() {
        this.showSpinner = true;
        this._mtBroker.closeOrder(this.order.Id, this.fillPolicy, this.amountToClose).subscribe(
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
