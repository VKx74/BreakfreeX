import { Injectable } from "@angular/core";
import { IBarData } from "@app/models/common/barData";
import { IBFTAAlgoResponseV2 } from "@app/services/algo.service";
import { TradingHelper } from "@app/services/mt/mt.helper";
import { OrderSide } from "modules/Trading/models/models";
import { Subject } from "rxjs";

export interface IDemoOrder {
    Id: number;
    Price: number;
    CurrentPrice: number;
    SL: number;
    TP: number;
    Side: OrderSide;
    NetPL: number;
    Date: number;
    Size: number;
    BarIndex: number;
    RiskPercentage: number;
    Symbol: string;
}

@Injectable()
export class SignalsDemoBrokerService {
    private _algoSetupEntry: number = null;
    private _algoSetupSL: number = null;
    private _lastBarDate: number = null;
    private _lastPrice: number = null;

    public symbol: string = "EURUSD";
    public balance: number = 1000;
    public barIndex: number = 0;
    public contractSize: number = 100000;
    public decimals: number = 5;
    public orderRisk: number = 3;
    public filledOrders: IDemoOrder[] = [];
    public pendingOrders: IDemoOrder[] = [];
    public closedOrders: IDemoOrder[] = [];
    public canceledOrders: IDemoOrder[] = [];
    public dataChanged: Subject<void> = new Subject();

    constructor() {

    }

    reset() {
        this.balance = 1000;
        this.barIndex = 0;
        this.filledOrders = [];
        this.pendingOrders = [];
        this.closedOrders = [];
        this.canceledOrders = [];
        this.dataChanged.next();
    }
    
    appendBar(bar: IBarData) {
        this._lastBarDate = bar.date.getTime();
        this._lastPrice = bar.close;
        this.barIndex++;

        this._checkOrders(bar.high);
        this._checkOrders(bar.low);
        this._checkOrders(bar.close);
        this.dataChanged.next();
    }

    appendSignal(algoData: IBFTAAlgoResponseV2) {
        if (this.filledOrders.length > 0) {
            return;
        }

        if (algoData.trade.entry === this._algoSetupEntry && this.pendingOrders.length > 0) {
            return;
        }

        this._closeAllPending();

        this._algoSetupEntry = algoData.trade.entry;
        this._algoSetupSL = algoData.trade.stop;

        let order1: IDemoOrder = {
            Id: new Date().getTime(),
            Date: this._lastBarDate,
            NetPL: 0,
            Price: algoData.trade.entry,
            Size: this._calculateOrderSize(algoData.trade.entry, algoData.trade.stop),
            Side: algoData.trade.entry > algoData.trade.stop ? OrderSide.Buy : OrderSide.Sell,
            SL: algoData.trade.stop,
            TP: algoData.trade.take_profit,
            BarIndex: this.barIndex,
            RiskPercentage: this.orderRisk,
            Symbol: this.symbol,
            CurrentPrice: this._lastPrice
        };
        
        let order2: IDemoOrder = {
            Id: new Date().getTime(),
            Date: this._lastBarDate,
            NetPL: 0,
            Price: algoData.trade.entry_h,
            Size: this._calculateOrderSize(algoData.trade.entry_h, algoData.trade.stop),
            Side: algoData.trade.entry > algoData.trade.stop ? OrderSide.Buy : OrderSide.Sell,
            SL: algoData.trade.stop,
            TP: algoData.trade.take_profit_h,
            BarIndex: this.barIndex,
            RiskPercentage: this.orderRisk,
            Symbol: this.symbol,
            CurrentPrice: this._lastPrice
        };
        
        let order3: IDemoOrder = {
            Id: new Date().getTime(),
            Date: this._lastBarDate,
            NetPL: 0,
            Price: algoData.trade.entry_l,
            Size: this._calculateOrderSize(algoData.trade.entry_l, algoData.trade.stop),
            Side: algoData.trade.entry > algoData.trade.stop ? OrderSide.Buy : OrderSide.Sell,
            SL: algoData.trade.stop,
            TP: algoData.trade.take_profit_l,
            BarIndex: this.barIndex,
            RiskPercentage: this.orderRisk,
            Symbol: this.symbol,
            CurrentPrice: this._lastPrice
        };

        this.pendingOrders.push(order1);
        this.pendingOrders.push(order2);
        this.pendingOrders.push(order3);
    }

    private _closeAllPending() {
        for (let i = 0; i < this.pendingOrders.length; i++) {
            this.canceledOrders.push(this.pendingOrders[i]);
        }
        this.pendingOrders.splice(0);
    }

    private _calculateOrderSize(entry: number, sl: number): number {
        let diff = Math.abs(entry - sl);
        let size = TradingHelper.calculatePositionSize(this.balance, this.orderRisk, diff, this.contractSize);
        return size;
    }

    private _checkOrders(price: number) {
        for (let i = 0; i < this.pendingOrders.length; i++) {
            let order = this.pendingOrders[i];
            order.CurrentPrice = price;

            let entryHit = false;
            if (order.Side === OrderSide.Buy) {
                if (order.Price >= price) {
                    entryHit = true;
                }
            } else {
                if (order.Price <= price) {
                    entryHit = true;
                }
            }

            if (entryHit) {
                this.filledOrders.push(order);
            }

            let maxOrderLifetime = 30;
            let barIndex = this.barIndex - order.BarIndex;
            if (barIndex > maxOrderLifetime && !entryHit) {
                this.canceledOrders.push(order);
            }

            if (entryHit || barIndex > maxOrderLifetime) {
                this.pendingOrders.splice(i, 1);
                i--;
            }
        }
        
        for (let i = 0; i < this.filledOrders.length; i++) {
            let order = this.filledOrders[i];
            order.CurrentPrice = price;

            let entrySL = false;
            let entryTP = false;

            if (order.Side === OrderSide.Buy) {
                if (order.SL >= price) {
                    entrySL = true;
                }  
                if (order.TP <= price) {
                    entryTP = true;
                }
            } else {
                if (order.SL <= price) {
                    entrySL = true;
                }
                if (order.TP >= price) {
                    entryTP = true;
                }
            }

            this._calculatePL(order);
            // let maxOrderLifetime = 20;
            // let barIndex = this.barIndex - order.BarIndex;

            if (entrySL || entryTP) {
                this.filledOrders.splice(i, 1);
                i--;

                this.closedOrders.push(order);
                this.balance += order.NetPL;
            }
        }
    }

    private _calculatePL(order: IDemoOrder) {
        if (!order.CurrentPrice) {
            return;
        }
        
        if (order.Side === OrderSide.Buy) {
            order.NetPL = (order.CurrentPrice - order.Price) * this.contractSize * order.Size;
        } else {
            order.NetPL =  (order.Price - order.CurrentPrice) * this.contractSize * order.Size;
        }
    }
}