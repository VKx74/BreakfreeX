import {Component, Input} from '@angular/core';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTTradingAccount } from 'modules/Trading/models/forex/mt/mt.models';
import { BrokerService } from '@app/services/broker.service';

interface IScoreItem {
    IsHit: boolean;
}

@Component({
    selector: 'mt-order-score',
    templateUrl: './mt-order-score.component.html',
    styleUrls: ['./mt-order-score.component.scss']
})
export class MTOrderScoreComponent {
    private _res: IScoreItem[] = [];
    private _maxScore: number;
    private _score: number;

    @Input() set MaxScore(value: number) {
        this._maxScore = value;
        this._recalculateScore();
    }

    @Input() set Score(value: number) {
        this._score = value;
        this._recalculateScore();
    }

    public get ScoreItems(): IScoreItem[] {
        return this._res;
    }

    constructor() {
    }

    private _recalculateScore() {
        this._res = [];
        for (let i = 0; i < this._maxScore; i++) {
            this._res.push({
                IsHit: i < this._score
            });
        }
    }
}
