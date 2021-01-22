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
    private _maxScore: number;
    private _score: number;

    @Input() set MaxScore(value: number) {
        this._maxScore = value;
    }

    @Input() set Score(value: number) {
        this._score = value;
    }

    get maxScore(): number {
        return this._maxScore;
    }

    get score(): number {
        return this._score;
    }

    constructor() {
    }

    calculateScore(): number {
        const scPoint = this.maxScore / 5;
        let res = Math.round(this.score / scPoint);

        if (res < 1) {
            res = 1;
        }
        if (res > 5) {
            res = 5;
        }

        return res;
    }
}
