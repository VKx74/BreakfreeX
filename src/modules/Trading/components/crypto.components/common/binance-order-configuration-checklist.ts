import { ITradeTick } from "@app/models/common/tick";
import { OrderSide, OrderTypes } from "../../../models/models";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';
import { BinanceChecklistItemDescription, BinanceCorrelatedRiskValidator, BinanceGlobalTrendValidator, BinanceLevelsValidator, BinanceLeverageValidator, BinanceLocalTrendValidator, BinanceSpreadValidator, BinanceStoplossValidator, CalculatingChecklistStatuses, ChecklistItem, OrderValidationChecklist } from 'modules/Trading/models/crypto/shared/order.validation';
import { componentDestroyed } from '@w11k/ngx-componentdestroyed';
import { BinanceOrderConfig } from '../binance/order-configurator/binance-order-configurator.component';
import { BinanceBroker } from '@app/services/binance/binance.broker';
import { BinanceFuturesBroker } from '@app/services/binance-futures/binance-futures.broker';
import { InfoNotificationComponent } from 'modules/Trading/components/forex.components/mt/order-configurator/notifications/info/info-notification.component';
import { BinanceFuturesOrderConfig } from '../binance-futures/order-configurator/binance-futures-order-configurator.component';

export abstract class BinanceOrderConfigurationChecklist {
    protected checklist: BinanceChecklistItemDescription[] = [
        new BinanceLocalTrendValidator(),
        new BinanceGlobalTrendValidator(),
        new BinanceLevelsValidator(),
        new BinanceLeverageValidator(),
        new BinanceCorrelatedRiskValidator(),
        new BinanceStoplossValidator(),
        new BinanceSpreadValidator(),
    ];

    protected _checklistSubject: Subject<void> = new Subject();
    protected _checklistTimeout: any;
    protected _statusChangeInterval: any;
    protected _recalculateTimeout: any;
    protected _destroyed: boolean = false;
    protected _orderValidationChecklist: OrderValidationChecklist;
    protected _wrongInstrumentShown: boolean = false;
    protected _recalculatePossible = true;

    checklistItems: ChecklistItem[] = [];
    orderScore: number = 10;
    OrderTypes = OrderTypes;
    calculatingChecklist: boolean = false;
    calculatingChecklistStatus: string = CalculatingChecklistStatuses[0];
    lastTick: ITradeTick = null;

    abstract get config(): BinanceOrderConfig | BinanceFuturesOrderConfig;
    abstract get broker(): BinanceBroker | BinanceFuturesBroker;
    abstract get dialog(): MatDialog;

    constructor() {
        this._checklistSubject.pipe(
            debounceTime(500),
            takeUntil(componentDestroyed(this))
        ).subscribe(() => {
            this._calculateChecklist();
        });
    }

    protected _calculateChecklist() {
        if (!this.canShowOrderValidation()) {
            this.orderScore = 10;
            this.checklistItems = [];
            return;
        }

        this._setCalculatingChecklistStatus(true);

        if (this._checklistTimeout) {
            clearTimeout(this._checklistTimeout);
        }

        if (!this.lastTick) {
            return;
        }

        this.broker.calculateOrderChecklist({
            Side: this.config.side,
            Size: this.config.amount,
            Symbol: this.config.instrument.id,
            Price: this.config.type !== OrderTypes.Market ? this.config.price : (this.lastTick.bid + this.lastTick.ask) / 2,
            SL: this.config.sl ? this.config.sl : null,
            Timeframe: this.config.timeframe,
            LastPrice: this.config.lastPrice
        }).subscribe((res) => {
            this._setCalculatingChecklistStatus(false);
            this._buildCalculateChecklistResults(res);
        }, (error) => {
            this._setCalculatingChecklistStatus(false);
            this._buildCalculateChecklistResults(null);
        });
    }

    protected _buildCalculateChecklistResults(data: OrderValidationChecklist) {
        if (this._destroyed) {
            return;
        }

        this._orderValidationChecklist = data;

        this.checklistItems = [];
        this.orderScore = 10;

        if (!data) {
            return;
        }

        data.SpreadRiskValue = Math.abs(this.lastTick.bid - this.lastTick.ask) / Math.min(this.lastTick.bid, this.lastTick.ask) * 100;

        let recalculateNeeded = false;

        for (const i of this.checklist) {
            const res = i.calculate(data, this.config);
            if (!res) {
                continue;
            }
            if (res.valid === undefined || res.valid === null) {
                recalculateNeeded = true;
                continue;
            }
            this.orderScore -= res.minusScore;
            this.checklistItems.push(res);
        }

        if (this.orderScore < 0) {
            this.orderScore = 0;
        }

        if (recalculateNeeded && this._recalculatePossible) {
            this._setCalculatingChecklistStatus(true);
            this._recalculatePossible = false;
            this._recalculateTimeout = setTimeout(() => {
                this._recalculateTimeout = null;
                this._raiseCalculateChecklist();
            }, 3000);
        } else {
            this._validateIsSymbolCorrect();
            if (this.config.timeframe) {
                this._checklistTimeout = setTimeout(() => {
                    this._checklistSubject.next();
                }, 5000);
            }
        }
    }

    protected _validateIsSymbolCorrect() {
        if (this._destroyed || this._wrongInstrumentShown) {
            return;
        }

        this._wrongInstrumentShown = true;

        if (this._orderValidationChecklist.FeedBrokerSpread > 3) {
            this.dialog.open(InfoNotificationComponent, {
                data: {
                    title: "Warning",
                    data: "We have detected a large difference between our datafeed and your mapped broker instrument. Please make sure it's the correct instrument."
                }
            });
        }
    }

    protected _raiseCalculateChecklist() {
        if (!this.config.instrument) {
            return;
        }

        this._setCalculatingChecklistStatus(true);
        this._checklistSubject.next();
    }

    protected _setCalculatingChecklistStatus(status: boolean) {
        this.calculatingChecklist = status;
        if (status) {
            if (this._statusChangeInterval) {
                return;
            }

            this.calculatingChecklistStatus = CalculatingChecklistStatuses[0];
            this._statusChangeInterval = setInterval(() => {
                let index = CalculatingChecklistStatuses.indexOf(this.calculatingChecklistStatus) + 1;
                if (!CalculatingChecklistStatuses[index]) {
                    return;
                }
                this.calculatingChecklistStatus = CalculatingChecklistStatuses[index];
            }, 2000);
        } else {
            if (this._statusChangeInterval) {
                clearInterval(this._statusChangeInterval);
                this._statusChangeInterval = null;
            }
        }
    }

    protected _setTick(tick: ITradeTick) {
        let needLoad = false;
        if (!this.lastTick) {
            needLoad = true;
        }

        this.lastTick = tick;
        const price = this.config.side === OrderSide.Buy ? tick.ask : tick.bid;

        if (tick && !this.config.price) {
            this.config.price = price;
        }
        
        if (needLoad) {
            this._raiseCalculateChecklist();
        }
    }

    canShowOrderValidation() {
        return this.config.type === OrderTypes.Market || this.config.type === OrderTypes.Limit;
    }

    ngOnDestroy() {
        if (this._recalculateTimeout) {
            clearTimeout(this._recalculateTimeout);
        }

        if (this._checklistTimeout) {
            clearTimeout(this._checklistTimeout);
        }
        
        if (this._statusChangeInterval) {
            clearInterval(this._statusChangeInterval);
        }

        this._destroyed = true;
    }
}
