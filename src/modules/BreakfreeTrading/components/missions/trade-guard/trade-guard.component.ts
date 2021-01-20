import {Component, EventEmitter, Inject, Injector, Input, OnInit, Output, ViewChild} from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { ITradeGuardItem, TradeGuardService } from 'modules/BreakfreeTrading/services/tradeGuard.service';
import { RiskClass, RiskObject, TradeManagerTab } from 'modules/Trading/models/models';
import { DataHighlightService } from 'modules/Trading/services/dataHighlight.service';
import { Subscription } from 'rxjs';



@Component({
    selector: 'trade-guard-component',
    templateUrl: './trade-guard.component.html',
    styleUrls: ['./trade-guard.component.scss']
})
export class TradeGuardComponent {
    protected _onTradePanelDataHighlightSubscription: Subscription;
    
    @Output()
    public CloseRequested = new EventEmitter();
    
    public result: ITradeGuardItem[];
    public score: number = 0;
    public get isBrokerConnected(): boolean {
        return !!this._getBrokerInstance();
    }

    constructor(protected _tradeGuardService: TradeGuardService, protected _brokerService: BrokerService, protected _dataHighlightService: DataHighlightService) {
    }

    ngOnInit() {
        this.result = [];

        const assetsRisk = this._tradeGuardService.GetAssetsRisks();
        const positionsRisk = this._tradeGuardService.GetPositionsRisks();
        const filledOrdersRisk = this._tradeGuardService.GetFilledOrdersRisks();
        const activeOrdersRisk = this._tradeGuardService.GetActiveOrdersRisks();

        this.result.push(...assetsRisk);
        this.result.push(...positionsRisk);
        this.result.push(...filledOrdersRisk);
        this.result.push(...activeOrdersRisk);
        this.result.sort((a, b) => b.RiskClass - a.RiskClass);
        
        let score = 5;

        for (const i of this.result) {
            score -= this._getScore(i.RiskClass);
        }

        this.score = score;
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }

    doubleClicked(item: ITradeGuardItem) {
        if (!item) {
            return;
        }

        const uiTab = this._riskClassToUITab(item.RiskObject);
        if (!uiTab || !item.RelatedData) {
            return;
        }

        this._dataHighlightService.HighlightDataInTradePanel(uiTab, item.RelatedData);
        this.CloseRequested.emit();
    }

    private _riskClassToUITab(riskObject: RiskObject): TradeManagerTab {
        switch (riskObject) {
            case RiskObject.ActiveOrders: return TradeManagerTab.ActiveOrders;
            case RiskObject.MarketOrders: return TradeManagerTab.MarketOrders;
            case RiskObject.CurrencyRisk: return TradeManagerTab.CurrencyRisk;
            case RiskObject.Positions: return TradeManagerTab.Positions;
        }

        return null;
    }

    private _getScore(riskClass: RiskClass): number {
        switch (riskClass) {
            case RiskClass.Extreme: return 1.5;
            case RiskClass.High: return 1;
            case RiskClass.Medium: return 0.5;
            case RiskClass.Low: return 0.3;
        }
        return 0;
    }

    private _getBrokerInstance(): MTBroker {
        if (this._brokerService.activeBroker instanceof MTBroker) {
            return this._brokerService.activeBroker as MTBroker;
        }
        return null;
    }
}
