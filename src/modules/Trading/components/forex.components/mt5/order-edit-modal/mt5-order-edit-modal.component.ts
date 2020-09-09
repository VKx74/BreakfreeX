import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MT5Order, MT5EditOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { MT5Broker } from '@app/services/mt5/mt5.broker';
import { AlertService } from '@alert/services/alert.service';
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType } from 'modules/Trading/models/models';
import { Subscription } from 'rxjs';
import { IMT5Tick } from '@app/models/common/tick';

export class MT5OrderEditConfig {
    symbol: string;
    id: string;
    side: OrderSide;
    amount: number;
    type: OrderTypes;
    expirationType: OrderExpirationType;
    price?: number; // Limit price
    sl?: number; // Stop price
    tp?: number; // Stop price
    useSL: boolean; // Stop price
    useTP: boolean; // Stop price
    comment?: string; // Stop price
}

@Component({
    selector: 'mt5-order-edit-modal',
    templateUrl: './mt5-order-edit-modal.component.html',
    styleUrls: ['./mt5-order-edit-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MT5OrderEditModalComponent extends Modal<MT5Order> implements OnInit {
    private _oneDayPlus = new Date(new Date().getTime() + (1000 * 24 * 60 * 60));
    private _config: MT5OrderEditConfig = new MT5OrderEditConfig();
    private _marketSubscription: Subscription;
    private _selectedTime: string;
    private _selectedDate: Date;

    public get order(): MT5Order {
        return this.data;
    }   
    
    public get config(): MT5OrderEditConfig {
        return this._config;
    }  

    set selectedTime(value: string) {
        if (value) {
            this._selectedTime = value;
        }
    }
    get selectedTime(): string {
        return this._selectedTime;
    } 
    
    set selectedDate(value: Date) {
        if (value) {
            this._selectedDate = value;
        }
    }
    get selectedDate(): Date {
        return this._selectedDate;
    }
    
    public lastTick: IMT5Tick;
    public minAmountValue: number = 0.01;
    public minPriceValue: number = 0.000001;
    public priceStep: number = 0.000001;
    public amountStep: number = 0.01;
    public decimals: number = 5;
    public showSpinner: boolean = false;
    public allowedOrderTypes: OrderTypes[] = [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];
    public orderFillPolicies: OrderFillPolicy[] = [OrderFillPolicy.FF, OrderFillPolicy.FOK, OrderFillPolicy.IOC];
    public expirationTypes: OrderExpirationType[] = [OrderExpirationType.GTC, OrderExpirationType.Specified, OrderExpirationType.Today];

    constructor(injector: Injector, protected _mt5Broker: MT5Broker, protected _alertService: AlertService) {
        super(injector);
    }

    ngOnInit() {
        this._config.id = this.order.Id;
        this._config.symbol = this.order.Symbol;
        this._config.side = this.order.Side;
        this._config.amount = this.order.Size;
        this._config.type = this.order.Type;
        this._config.expirationType = this.order.ExpirationType;
        this._config.price = this.order.Price;
        this._config.sl = this.order.SL;
        this._config.useSL = this.order.SL ? true : false;
        this._config.tp = this.order.TP;
        this._config.useTP = this.order.TP ? true : false;
        this._config.comment = this.order.Comment;

        if (this.order.ExpirationDate) {
            const date = new Date(this.order.ExpirationDate * 1000);
            this._selectedDate = date;
            this._selectedTime = `${this._selectedDate.getUTCHours()}:${this._selectedDate.getUTCMinutes()}`;
        }

        if (!this._config.sl) {
            this._config.sl = this.order.Price;
        } 
        
        if (!this._config.tp) {
            this._config.tp = this.order.Price;
        }

        if (this._config.symbol) {
            this._marketSubscription = this._mt5Broker.subscribeToTicks(this._config.symbol, (tick: IMT5Tick) => {
                this.lastTick = tick;
                const price = this._config.side === OrderSide.Buy ? tick.ask : tick.bid;

                if (tick && !this._config.price) {
                    this._config.price = price;
                }
                if (tick && !this._config.sl) {
                    this._config.sl = price;
                }
                if (tick && !this._config.tp) {
                    this._config.tp = price;
                }
            });
        }

        const symbol = this._config.symbol;
        this.amountStep =  this._mt5Broker.instrumentAmountStep(symbol);
        this.minAmountValue =  this._mt5Broker.instrumentMinAmount(symbol);
        this.priceStep =  this._mt5Broker.instrumentTickSize(symbol);
        this.minPriceValue =  this._mt5Broker.instrumentTickSize(symbol);
        this.decimals =  this._mt5Broker.instrumentDecimals(symbol);
    }

    ngOnDestroy() {
        if (this._marketSubscription) {
            this._marketSubscription.unsubscribe();
            this._marketSubscription = null;
        }
    }

    hide() {
        if (this._marketSubscription) {
            this._marketSubscription.unsubscribe();
            this._marketSubscription = null;
        }

        this.close();
    }

    isPending() {
        return this.config.type === OrderTypes.Limit || this.config.type === OrderTypes.Stop;
    } 

    isExpirationVisible() {
        return this.config.expirationType === OrderExpirationType.Specified;
    }

    handleExpirationTypeSelected(type: OrderExpirationType) {
        this.config.expirationType = type;

        if (type === OrderExpirationType.Specified && (!this.selectedDate || !this.selectedTime)) {
            this._selectedTime = `${this._oneDayPlus.getUTCHours()}:${this._oneDayPlus.getUTCMinutes()}`;
            this._selectedDate = this._oneDayPlus;
        }
    }
    
    submit() {
        this.showSpinner = true;
        const request: MT5EditOrder = {
            Ticket: this.config.id,
            Comment: this.config.comment,
            ExpirationType: this.config.expirationType,
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.symbol,
            Type: this.config.type,
            ExpirationDate: this._getSetupDate(),
            Price: this.config.price,
            SL: this.config.useSL ? this.config.sl : null,
            TP: this.config.useTP ? this.config.tp : null
        };
        this._mt5Broker.editOrder(request).subscribe(
            (result) => {
                this.showSpinner = false;
                if (result.result) {
                    this._alertService.success("Order modified");
                    this.close();
                } else {
                    this._alertService.error("Failed to modify order: " + result.msg);
                }
            },
            (error) => {
                this.showSpinner = false;
                this._alertService.error("Failed to modify order: " + error);
            }
        );
    }

    private _getSetupDate(): number {
        if (!this._selectedDate || !this._selectedTime) {
            return null;
        }

        const dateString = this._selectedDate.toISOString().split("T")[0];
        const timeString = `${this._selectedTime}:00.500Z`;
        return new Date(`${dateString}T${timeString}`).getTime() / 1000;
    }
}
