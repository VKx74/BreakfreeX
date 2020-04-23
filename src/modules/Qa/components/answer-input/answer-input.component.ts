import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AnswersService} from "../../services/answers.service";
import {QuestionModel} from "../../data/questions";
import {AnswerModel} from "../../data/answers";
import {
    MarkdownInputComponent,
    MarkdownInputErrorHandler
} from "../../../Markdown/components/markdown-input/markdown-input.component";
import {Observable, of} from "rxjs";

export type AnswerInputSubmitHandler = (text: string) => Observable<any>;

@Component({
    selector: 'answer-input',
    templateUrl: './answer-input.component.html',
    styleUrls: ['./answer-input.component.scss']
})
export class AnswerInputComponent implements OnInit {
    @Input() submitHandler: AnswerInputSubmitHandler;
    @Input() message: string = '';
    @Input() showCancel: boolean = false;
    @Output() onAnswer = new EventEmitter<AnswerModel>();
    @Output() onCancel = new EventEmitter();
    @ViewChild(MarkdownInputComponent, {static: false}) markdownInput: MarkdownInputComponent;

    formGroup: FormGroup;
    processCreation: boolean;

    constructor() {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            'content': new FormControl(this.message, [Validators.required, Validators.minLength(5)])
        });
    }

    handleAddPost() {
        const control = this.formGroup.controls['content'];

        this.processCreation = true;
        this.submitHandler(control.value)
            .subscribe({
                next: (answer: AnswerModel) => {
                    this.onAnswer.next(answer);
                    control.reset();
                },
                error: (e) => {
                    console.error(e);
                },
                complete: () => {
                    this.processCreation = false;
                }
            });
    }

    markdownInputErrorHandler: MarkdownInputErrorHandler = (control: FormControl) => {
        return of('Please, enter valid message');
    }

    cancel() {
        this.onCancel.emit();
    }
}
