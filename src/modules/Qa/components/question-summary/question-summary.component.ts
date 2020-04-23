import {Component, Input, OnInit} from '@angular/core';
import {QuestionModel} from "../../data/questions";
import {QaHelperService} from "../../services/qa-helper.service";

@Component({
    selector: 'question-summary',
    templateUrl: './question-summary.component.html',
    styleUrls: ['./question-summary.component.scss']
})
export class QuestionSummaryComponent implements OnInit {
    @Input() question: QuestionModel;

    constructor(private _helperService: QaHelperService) {
    }

    ngOnInit() {
    }

    handleTagClick(tagName: string) {
        this._helperService.showTaggedQuestions(tagName);
    }
}
