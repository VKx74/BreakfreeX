import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
    MarkdownInputComponent,
    MarkdownInputErrorHandler
} from "../../../Markdown/components/markdown-input/markdown-input.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TagsInputMode} from "@tagsInput/components/tags-input/tags-input.component";
import {QuestionDTO} from "../../data/api";
import {Observable, of} from "rxjs";

export interface IQuestionFormValues {
    title: string;
    message: string;
    tags: string[];
}

export type QuestionFormComponentSubmitHandler = (values: IQuestionFormValues) => Observable<any>;

@Component({
    selector: 'question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent implements OnInit {
    @Input() submitHandler: QuestionFormComponentSubmitHandler;
    @Input() values: IQuestionFormValues = {title: '', message: '', tags: []};
    @ViewChild(MarkdownInputComponent, {static: false}) markdownInput: MarkdownInputComponent;

    formGroup: FormGroup;
    tags: string[] = [];
    processSubmit: boolean = false;
    TagsInputMode = TagsInputMode;


    constructor() {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            'title': new FormControl(this.values.title, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
            'message': new FormControl(this.values.message, [Validators.required, Validators.minLength(10)])
        });

        this.tags = this.values.tags.slice();
    }

    handleAddTag(tag: string) {
        this.tags.push(tag);
    }

    handleRemoveTag(tag: string) {
        this.tags = this.tags.filter(t => t !== tag);
    }

    submit() {
        const controls = this.formGroup.controls;

        this.processSubmit = true;
        this.submitHandler({
            title: controls['title'].value,
            message: controls['message'].value,
            tags: this.tags
        }).subscribe({
            complete: () => {
                this.processSubmit = false;
            }
        });
    }

    markdownInputErrorHandler: MarkdownInputErrorHandler = (control: FormControl) => {
        return of('Please, enter valid message');
    }
}
