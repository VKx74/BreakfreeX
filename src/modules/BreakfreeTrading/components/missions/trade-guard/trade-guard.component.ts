import {Component, Inject, Injector, Input, OnInit, ViewChild} from '@angular/core';
import { ITradeGuardItem, TradeGuardService } from 'modules/BreakfreeTrading/services/tradeGuard.service';
import { RiskClass } from 'modules/Trading/models/models';



@Component({
    selector: 'trade-guard-component',
    templateUrl: './trade-guard.component.html',
    styleUrls: ['./trade-guard.component.scss']
})
export class TradeGuardComponent {
    public result: ITradeGuardItem[];
    public score: number = 0;

    constructor(protected _tradeGuardService: TradeGuardService) {
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

    private _getScore(riskClass: RiskClass): number {
        switch (riskClass) {
            case RiskClass.Extreme: return 1.5;
            case RiskClass.High: return 1;
            case RiskClass.Medium: return 0.5;
            case RiskClass.Low: return 0.3;
        }
        return 0;
    }
}
