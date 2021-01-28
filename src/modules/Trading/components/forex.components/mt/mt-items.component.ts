import {ChangeDetectorRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {AlertService} from "@alert/services/alert.service";
import { MTBroker } from '@app/services/mt/mt.broker';
import {MatDialog} from "@angular/material/dialog";
import { OrderSide } from 'modules/Trading/models/models';
import { BrokerService } from '@app/services/broker.service';
import { MTMarketOrderRecommendation, MTPendingOrderRecommendation, MTPositionRecommendation } from "modules/Trading/models/forex/mt/mt.models";
import { MTHelper } from "@app/services/mt/mt.helper";
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";

export abstract class MTItemsComponent<T> implements OnInit, OnDestroy {
    protected _blinkingTimeout: any;
    protected _onTradePanelDataHighlightSubscription: Subscription;
    protected get _mtBroker(): MTBroker {
        return this._broker.activeBroker as MTBroker;
    }
    
    protected _subscription: Subscription;
    protected _subscriptionOnOrderDataChanged: Subscription;
    protected _instrumentDecimals: { [symbol: string]: number; } = {};

    protected _selectedTabIndex: number;
    @Input() set selectedTabIndex(value: number) {
        this._selectedTabIndex = value;
        if (this._selectedTabIndex !== undefined && this.tabIndex !== undefined && this._selectedTabIndex === this.tabIndex) {
            this.cdr.detectChanges();
        }
    }
    @Input() tabIndex: number;
    @Output() onOrderEdit = new EventEmitter<T>();
    @Output() onOrderClose = new EventEmitter<T>();
    @Output() onPositionClose = new EventEmitter<T>();
    @Output() onOpenChart = new EventEmitter<T>();

    items: T[] = [];
    blinking: T[] = [];
    selectedItem: T;
    OrderSide = OrderSide;

    selectItem(item: T) {
        this.selectedItem = item;
    } 

    doubleClicked(item: T) {
        this.raiseOpenChart(item);
    }

    handleContextMenuSelected(menu_id: string) {
        switch (menu_id) {
            case "view": this.raiseOpenChart(this.selectedItem); break;
            case "closePosition": this.raisePositionClose(this.selectedItem); break;
            case "cancelOrder": this.raiseOrderClose(this.selectedItem); break;
            case "closeOrder": this.raiseOrderClose(this.selectedItem); break;
            case "edit": this.raiseEdit(this.selectedItem); break;
        }
    }   

    constructor(private _broker: BrokerService,
                protected _dataHighlightService: DataHighlightService,
                @Inject(AlertService) protected _alertService: AlertService,
                protected _dialog: MatDialog, private cdr: ChangeDetectorRef) {

    }

    ngOnInit(): void {
        this.updateItems();
        this._subscription = this._subscribeOnUpdates();
        this._subscriptionOnOrderDataChanged = this._mtBroker.onOrdersParametersUpdated.subscribe(() => {
            this.ordersUpdated();
        });
        this._onTradePanelDataHighlightSubscription = this._dataHighlightService.onTradePanelDataHighlight.subscribe(this._handleHighlight.bind(this));
    }

    getRecommendationsTooltip(rec: MTPendingOrderRecommendation | MTMarketOrderRecommendation) {
        if (!rec) {
            return "";
        }

        let globalTrendPerformance = "";
        let localTrendPerformance = "";
        if (rec.GlobalRTDSpread) {
            globalTrendPerformance = rec.GlobalRTDTrendStrength;
        }
        if (rec.LocalRTDSpread) {
            localTrendPerformance = rec.LocalRTDTrendStrength;
        }

        let desc = "";
        if (rec.FailedChecks && rec.FailedChecks.length) {
            desc += `Issues -------------------\n\r`;
            let count = 1;

            for (const item of rec.FailedChecks) {
                desc += `${count}. ${item.Issue}\n\r`;
                count++;
            }

            desc += "Recommendation ------\n\r";
            count = 1;

            for (const item of rec.FailedChecks) {
                desc += `${count}. ${item.Recommendation}\n\r`;
                count++;
            }
        }

        if (rec.GlobalRTDValue && rec.LocalRTDValue) {
            desc += "Trend --------------------\n\r";
            desc += `${globalTrendPerformance} Global ${rec.GlobalRTDValue}\n\r`;
            desc += `${localTrendPerformance} Local ${rec.LocalRTDValue}\n\r`;
        }

        if (rec.Timeframe || rec.OrderTradeType) {
            desc += `Setup --------------------\n\r`;

            if (rec.Timeframe) {
                const tfText = MTHelper.toGranularityToTimeframeText(rec.Timeframe);
                desc += `Trade Timeframe - ${tfText}\n\r`;
            }

            if (rec.OrderTradeType) {
                desc += `Trade Setup - ${rec.OrderTradeType}\n\r`;
            }
        } 

        return desc;
    }

    getOrderRecommendationsText(rec: MTPendingOrderRecommendation | MTMarketOrderRecommendation) {
        if (rec === undefined) {
            return "Calculating...";
        }
        
        if (!rec) {
            return "No recommendations";
        }

        if (!rec.FailedChecks || !rec.FailedChecks.length) {
            return "Keep this order";
        }

        return rec.FailedChecks[0].Recommendation;
    }

    getPositionRecommendationsText(rec: MTPositionRecommendation) {
        if (rec === undefined) {
            return "Calculating...";
        }
        
        if (!rec) {
            return "No recommendations";
        }

        if (!rec.FailedChecks || !rec.FailedChecks.length) {
            return "Keep this position";
        }

        return rec.FailedChecks[0].Recommendation;
    }

    public raiseEdit(item: T) {
        this.onOrderEdit.next(item);
    }

    public raiseOrderClose(item: T) {
        this.onOrderClose.next(item);
    }
    
    public raiseOpenChart(item: T) {
        this.onOpenChart.next(item);
    }
    
    public raisePositionClose(item: T) {
        this.onPositionClose.next(item);
    }

    public getDecimals(symbol: string): number {
        if (this._instrumentDecimals[symbol]) {
            return this._instrumentDecimals[symbol];
        }

        const decimals = this._mtBroker.instrumentDecimals(symbol);
        this._instrumentDecimals[symbol] = decimals;
        return decimals;
    }

    protected refresh(): void {
        if (this._selectedTabIndex !== this.tabIndex) {
            return;
        }

        this.cdr.detectChanges();
    }

    protected updateItems(): void {
        this.loadItems()
            .subscribe(
                items => {
                    this.items = items.slice();
                    this.refresh();
                },
                e => this._handleLoadingError(e)
            );
    }

    protected abstract loadItems(): Observable<T[]>;

    protected abstract ordersUpdated();

    protected _subscribeOnUpdates(): Subscription {
        return null;
    }

    private _handleLoadingError(e) {
        this._alertService.error(this._getLoadingError());
    }

    protected _getLoadingError() {
        return 'Can\'t loading items';
    }

    ngOnDestroy(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }

        if (this._subscriptionOnOrderDataChanged) {
            this._subscriptionOnOrderDataChanged.unsubscribe();
        }

        if (this._onTradePanelDataHighlightSubscription) {
            this._onTradePanelDataHighlightSubscription.unsubscribe();
            this._onTradePanelDataHighlightSubscription = null;
        }
    }

    private _handleHighlight(data: ITradePanelDataHighlight) {
        if (!data) {
            return;
        }

        this.blinking = data.Data;

        if (this._blinkingTimeout) {
            clearTimeout(this._blinkingTimeout);
            this._blinkingTimeout = null;
        }

        this._blinkingTimeout = setTimeout(() => {
            this.blinking = [];
            this._blinkingTimeout = null;
        }, 1000 * 15);
    }
}
