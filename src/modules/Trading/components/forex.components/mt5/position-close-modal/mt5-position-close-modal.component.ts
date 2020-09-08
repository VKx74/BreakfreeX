import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MT5Order, MT5Position } from 'modules/Trading/models/forex/mt/mt.models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { AlertService } from '@alert/services/alert.service';

@Component({
    selector: 'mt5-position-close-modal',
    templateUrl: './mt5-position-close-modal.component.html',
    styleUrls: ['./mt5-position-close-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MT5PositionCloseModalComponent extends Modal<MT5Order> implements OnInit {
    public get position(): MT5Position {
        return this.data;
    }  
    
    public showSpinner: boolean = false;

    constructor(injector: Injector, protected _mt5Broker: MT5Broker, protected _alertService: AlertService) {
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
        this._mt5Broker.closePosition(this.position.Symbol)
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
