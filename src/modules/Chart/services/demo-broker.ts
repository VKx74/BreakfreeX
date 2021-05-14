import { IBarData } from "@app/models/common/barData";
import { IBFTAAlgoResponseV2 } from "@app/services/algo.service";
import { TradingHelper } from "@app/services/mt/mt.helper";
import { OrderSide } from "modules/Trading/models/models";

export interface IDemoOrder {
    id: number;
    price: number;
    sl: number;
    tp: number;
    side: OrderSide;
    netPL: number;
    date: number;
    size: number;
    barIndex: number;
    risk: number;
}

export class DemoBroker {
    private _algoSetupEntry: number = null;
    private _algoSetupSL: number = null;
    private _lastBarDate: number = null;

    public balance: number = 1000;
    public barIndex: number = 0;
    public contractSize: number = 100000;
    public orderRisk: number = 3;
    public filledOrders: IDemoOrder[] = [];
    public pendingOrders: IDemoOrder[] = [];
    public closedOrders: IDemoOrder[] = [];
    public canceledOrders: IDemoOrder[] = [];

    constructor() {

    }
    
    appendBar(bar: IBarData) {
        this._lastBarDate = bar.date.getTime();
        this.barIndex++;

        this._checkOrders(bar.high);
        this._checkOrders(bar.low);
        this._checkOrders(bar.close);
    }

    appendSignal(algoData: IBFTAAlgoResponseV2) {
        if (algoData.trade.entry === this._algoSetupEntry && algoData.trade.stop === this._algoSetupSL) {
            return;
        }

        this._algoSetupEntry = algoData.trade.entry;
        this._algoSetupSL = algoData.trade.stop;

        let order1: IDemoOrder = {
            id: new Date().getTime(),
            date: this._lastBarDate,
            netPL: 0,
            price: algoData.trade.entry,
            size: this._calculateOrderSize(algoData.trade.entry, algoData.trade.stop),
            side: algoData.trade.entry > algoData.trade.stop ? OrderSide.Buy : OrderSide.Sell,
            sl: algoData.trade.stop,
            tp: algoData.trade.take_profit,
            barIndex: this.barIndex,
            risk: this.orderRisk
        };
        
        let order2: IDemoOrder = {
            id: new Date().getTime(),
            date: this._lastBarDate,
            netPL: 0,
            price: algoData.trade.entry_h,
            size: this._calculateOrderSize(algoData.trade.entry_h, algoData.trade.stop),
            side: algoData.trade.entry > algoData.trade.stop ? OrderSide.Buy : OrderSide.Sell,
            sl: algoData.trade.stop,
            tp: algoData.trade.take_profit_h,
            barIndex: this.barIndex,
            risk: this.orderRisk
        };
        
        let order3: IDemoOrder = {
            id: new Date().getTime(),
            date: this._lastBarDate,
            netPL: 0,
            price: algoData.trade.entry_l,
            size: this._calculateOrderSize(algoData.trade.entry_l, algoData.trade.stop),
            side: algoData.trade.entry > algoData.trade.stop ? OrderSide.Buy : OrderSide.Sell,
            sl: algoData.trade.stop,
            tp: algoData.trade.take_profit_l,
            barIndex: this.barIndex,
            risk: this.orderRisk
        };

        this.pendingOrders.push(order1);
        this.pendingOrders.push(order2);
        this.pendingOrders.push(order3);
    }

    private _calculateOrderSize(entry: number, sl: number): number {
        let diff = Math.abs(entry - sl);
        let size = TradingHelper.calculatePositionSize(this.balance, this.orderRisk, diff, this.contractSize);
        return size;
    }

    private _checkOrders(price: number) {
        for (let i = 0; i < this.pendingOrders.length; i++) {
            let order = this.pendingOrders[i];
            let entryHit = false;
            if (order.side === OrderSide.Buy) {
                if (order.price >= price) {
                    entryHit = true;
                }
            } else {
                if (order.price <= price) {
                    entryHit = true;
                }
            }

            if (entryHit) {
                this.filledOrders.push(order);
            }

            let maxOrderLifetime = 30;
            if (order.barIndex > maxOrderLifetime) {
                this.canceledOrders.push(order);
            }

            if (entryHit || order.barIndex > maxOrderLifetime) {
                this.pendingOrders.splice(i, 1);
                i--;
            }
        }
        
        for (let i = 0; i < this.filledOrders.length; i++) {
            let order = this.filledOrders[i];
            let entrySL = false;
            let entryTP = false;

            if (order.side === OrderSide.Buy) {
                if (order.sl >= price) {
                    entrySL = true;
                }  
                if (order.tp <= price) {
                    entryTP = true;
                }
            } else {
                if (order.sl <= price) {
                    entrySL = true;
                }
                if (order.tp >= price) {
                    entryTP = true;
                }
            }

            if (entrySL || entryTP) {
                this.filledOrders.splice(i, 1);
                i--;

                this.closedOrders.push(order);
                this._calculatePL(order, entryTP);
                this.balance += order.netPL;
            }
        }
    }

    private _calculatePL(order: IDemoOrder, isTP: boolean) {
        if (isTP) {
            order.netPL = Math.abs(order.price - order.tp) * this.contractSize * order.size;
        } else {
            order.netPL = Math.abs(order.price - order.sl) * this.contractSize * order.size * -1;
        }
    }
}