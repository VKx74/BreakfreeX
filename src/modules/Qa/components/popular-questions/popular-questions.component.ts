import {Component, Inject, OnInit} from '@angular/core';
import {QaApiService} from "../../services/api.service";
import {ProcessState} from "@app/helpers/ProcessState";
import {IBaseResponse, QuestionDTO} from "../../data/api";
import {QaModuleBasePath} from "../../BasePath";
import {QaRoutes} from "../../qa.routes";

interface IQuestionItem {
    id: string;
    title: string;
    answerCount: number;
    url: string;
}


@Component({
    selector: 'popular-questions',
    templateUrl: './popular-questions.component.html',
    styleUrls: ['./popular-questions.component.scss']
})
export class PopularQuestionsComponent implements OnInit {
    loadThemesProcessState = new ProcessState();
    questions: IQuestionItem[] = [];

    constructor(private _apiService: QaApiService,
                @Inject(QaModuleBasePath) private _moduleBasePath: string) {
    }

    ngOnInit() {
        this.loadThemesProcessState.setPending();
        this._apiService.getFrequentQuestions({
            page: 0,
            pageSize: 5
        })
            .subscribe({
                next: (result: IBaseResponse<QuestionDTO[]>) => {
                    this.questions = result.data.map((dto: QuestionDTO) => {
                        return {
                            id: dto.id,
                            title: dto.title,
                            answerCount: dto.totalAnswersCount,
                            url: this.getQuestionUrl(dto.id)
                        };
                    });

                    this.loadThemesProcessState.setSucceeded();
                },
                error: (e) => {
                    console.error(e);
                    this.loadThemesProcessState.setFailed();
                }
            });
    }

    getQuestionUrl(questionId: string): string {
        return `${this._moduleBasePath}/${QaRoutes.Questions}/${questionId}`;
    }
}
