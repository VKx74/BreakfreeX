import {Component, Input} from '@angular/core';

@Component({
    selector: 'emoji',
    templateUrl: './emoji.component.html',
    styleUrls: ['./emoji.component.scss']
})
export class EmojiComponent {
    private _calculating: boolean;
    private _maxScore: number;
    private _score: number;

    @Input() set Calculating(value: boolean) {
        this._calculating = value;
    }

    @Input() set MaxScore(value: number) {
        this._maxScore = value;
    }

    @Input() set Score(value: number) {
        this._score = value;
    }

    get Calculating(): boolean {
        return this._calculating;
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
