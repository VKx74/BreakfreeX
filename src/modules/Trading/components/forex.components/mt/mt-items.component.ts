import { ChangeDetectorRef, Inject } from "@angular/core";
import { AlertService } from "@alert/services/alert.service";
import { MTBroker } from '@app/services/mt/mt.broker';
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { MTMarketOrderRecommendation, MTPendingOrderRecommendation, MTPositionRecommendation } from "modules/Trading/models/forex/mt/mt.models";
import { TradingHelper } from "@app/services/mt/mt.helper";
import { DataHighlightService } from "modules/Trading/services/dataHighlight.service";
import { IBFTATrend } from "@app/services/algo.service";
import { ItemsComponent } from "../../trade-manager/items-component/items.component";
import { LocalStorageService } from "modules/Storage/services/local-storage.service";

export abstract class MTItemsComponent<T> extends ItemsComponent<T> {
    protected _hiddenColumns: string[] = this._getHiddenColumns();
    protected abstract get _defaultHiddenColumns(): string[];

    protected abstract get componentKey(): string;

    protected get _mtBroker(): MTBroker {
        return this._broker.activeBroker as MTBroker;
    }

    public get hiddenColumns(): string[] {
        return this._hiddenColumns;
    }

    constructor(protected _broker: BrokerService,
        protected _dataHighlightService: DataHighlightService,
        protected _localStorageService: LocalStorageService,
        @Inject(AlertService) protected _alertService: AlertService,
        protected _dialog: MatDialog,
        protected _cdr: ChangeDetectorRef) {
        super(_broker, _dataHighlightService, _alertService, _dialog, _cdr);
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
            desc += `${globalTrendPerformance} Global ${this._getTrendName(rec.GlobalRTDValue)}\n\r`;
            desc += `${localTrendPerformance} Local ${this._getTrendName(rec.LocalRTDValue)}\n\r`;
        }

        if (rec.Timeframe || rec.OrderTradeType) {
            desc += `Setup --------------------\n\r`;

            if (rec.Timeframe) {
                const tfText = TradingHelper.toGranularityToTimeframeText(rec.Timeframe);
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

    onHiddenColumnsChanged(columns: string[]) {
        this._localStorageService.set(`${this.componentKey}_hiddenColumns`, columns);
    }

    protected _getHiddenColumns() {
        const hiddenColumns = this._localStorageService.get(`${this.componentKey}_hiddenColumns`);
        if (!hiddenColumns) {
            return this._defaultHiddenColumns;
        }

        return hiddenColumns;
    }

    protected _getTrendName(trend: IBFTATrend) {
        if (trend === IBFTATrend.Up) {
            return "Uptrend";
        } else if (trend === IBFTATrend.Down) {
            return "Downtrend";
        }
        return "Unknown";
    }
}
