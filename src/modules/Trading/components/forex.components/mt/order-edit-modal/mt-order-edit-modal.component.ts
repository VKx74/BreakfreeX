import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../../localization/token";
import { Modal } from "Shared";
import { MTOrder, MTEditOrder } from 'modules/Trading/models/forex/mt/mt.models';
import { MTBroker } from '@app/services/mt/mt.broker';
import { AlertService } from '@alert/services/alert.service';
import { OrderSide, OrderTypes, OrderFillPolicy, OrderExpirationType } from 'modules/Trading/models/models';
import { Subscription } from 'rxjs';
import { ITradeTick } from '@app/models/common/tick';
import { BrokerService } from '@app/services/broker.service';

export interface IEDitDialogInputParameters {
    order: MTOrder;
    updateParams: object;
}

export class MT5OrderEditConfig {
    symbol: string;
    id: number;
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
    selector: 'mt-order-edit-modal',
    templateUrl: './mt-order-edit-modal.component.html',
    styleUrls: ['./mt-order-edit-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class MTOrderEditModalComponent extends Modal<IEDitDialogInputParameters> implements OnInit {
    private _oneDayPlus = new Date(new Date().getTime() + (1000 * 24 * 60 * 60));
    private _config: MT5OrderEditConfig = new MT5OrderEditConfig();
    private _marketSubscription: Subscription;
    private _selectedTime: string;
    private _selectedDate: Date;

    protected get _mtBroker(): MTBroker {
        return this._broker.activeBroker as MTBroker;
    }

    public get order(): MTOrder {
        return this.data.order;
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

    public lastTick: ITradeTick;
    public minAmountValue: number = 0.01;
    public minPriceValue: number = 0.000001;
    public priceStep: number = 0.000001;
    public amountStep: number = 0.01;
    public decimals: number = 5;
    public showSpinner: boolean = false;
    public allowedOrderTypes: OrderTypes[] = [OrderTypes.Market, OrderTypes.Limit, OrderTypes.Stop];
    public orderFillPolicies: OrderFillPolicy[] = [OrderFillPolicy.FF, OrderFillPolicy.FOK, OrderFillPolicy.IOC];
    public expirationTypes: OrderExpirationType[] = [OrderExpirationType.GTC, OrderExpirationType.Specified, OrderExpirationType.Today];

    constructor(injector: Injector, protected _broker: BrokerService, protected _alertService: AlertService) {
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
        this._config.tp = this.order.TP;
        this._config.comment = this.order.Comment;

        if (this.order.ExpirationDate) {
            const date = new Date(this.order.ExpirationDate * 1000);
            this._selectedDate = date;
            this._selectedTime = `${this._selectedDate.getUTCHours()}:${this._selectedDate.getUTCMinutes()}`;
        }

        if (this._config.symbol) {

            this._mtBroker.getPrice(this._config.symbol).subscribe((tick: ITradeTick) => {
                this._setTick(tick);
            });

            this._marketSubscription = this._mtBroker.subscribeToTicks(this._config.symbol, (tick: ITradeTick) => {
                this._setTick(tick);
            });
        }

        const symbol = this._config.symbol;
        this.amountStep = this._mtBroker.instrumentAmountStep(symbol);
        this.minAmountValue = this._mtBroker.instrumentMinAmount(symbol);
        this.priceStep = this._mtBroker.instrumentTickSize(symbol);
        this.minPriceValue = this._mtBroker.instrumentTickSize(symbol);
        this.decimals = this._mtBroker.instrumentDecimals(symbol);

        if (this.data.updateParams) {
            if (this.data.updateParams["sl"] !== undefined) {
                this._config.sl = this.data.updateParams["sl"] ? this.data.updateParams["sl"].toFixed(this.decimals) : 0;
            }
            if (this.data.updateParams["tp"] !== undefined) {
                this._config.tp = this.data.updateParams["tp"] ? this.data.updateParams["tp"].toFixed(this.decimals) : 0;
            }
            if (this.data.updateParams["price"] !== undefined) {
                this._config.price = this.data.updateParams["price"] ? this.data.updateParams["price"].toFixed(this.decimals) : 0;
            }
        }

        this._config.useSL = this._config.sl ? true : false;
        this._config.useTP = this._config.tp ? true : false;

        if (!this._config.sl) {
            this._config.sl = this.order.Price;
        }

        if (!this._config.tp) {
            this._config.tp = this.order.Price;
        }
    }
    private _setTick(tick: ITradeTick) {
        if (!tick || tick.symbol !== this._config.symbol) {
            return;
        }
        
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
        const request: MTEditOrder = {
            Ticket: this.config.id,
            Comment: this.config.comment || "",
            ExpirationType: this.config.expirationType,
            Side: this.config.side,
            Size: Number(this.config.amount),
            Symbol: this.config.symbol,
            Type: this.config.type,
            ExpirationDate: this._getSetupDate(),
            Price: this.config.type !== OrderTypes.Market ? Number(this.config.price) : 0,
            SL: this.config.useSL ? Number(this.config.sl) : 0,
            TP: this.config.useTP ? Number(this.config.tp) : 0
        };

        this._mtBroker.editOrder(request).subscribe(
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
            return 0;
        }

        if (this.config.expirationType !== OrderExpirationType.Specified) {
            return 0;
        }

        const hourMin = this._selectedTime.split(":");
        let h = hourMin[0];
        let m = hourMin[1];

        if (h.length === 1) {
            h = `0${h}`;
        }
        if (m.length === 1) {
            m = `0${m}`;
        }

        const dateString = this._selectedDate.toISOString().split("T")[0];
        const timeString = `${h}:${m}:00.500Z`;
        const exp = new Date(`${dateString}T${timeString}`).getTime() / 1000;
        return Math.roundToDecimals(exp, 0);
    }
}
