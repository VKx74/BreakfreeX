import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProcessState} from "@app/helpers/ProcessState";

export type CommentInputSubmitHandler = (text: string) => Observable<any>;

@Component({
    selector: 'comment-input',
    templateUrl: './comment-input.component.html',
    styleUrls: ['./comment-input.component.scss']
})
export class CommentInputComponent implements OnInit {
    @Input() text: string = '';
    @Input() submitHandler: CommentInputSubmitHandler;
    @Output() onCancel = new EventEmitter();

    formGroup: FormGroup;
    submitProcessState = new ProcessState();

    constructor() {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            text: new FormControl(this.text, [
                Validators.required,
                Validators.maxLength(200),
                Validators.minLength(5)
            ])
        });
    }

    submit() {
        const commentControl = this.formGroup.controls['text'];

        if (this.submitProcessState.isPending() || commentControl.invalid || !this.submitHandler) {
            return;
        }

        const message = commentControl.value.trim();

        if (message.length === 0) {
            return;
        }

        this.submitProcessState.setPending();
        this.submitHandler(message)
            .subscribe({
                next: () => {
                    this.submitProcessState.setSucceeded();
                },
                error: (e) => {
                    this.submitProcessState.setFailed();
                    console.error(e);
                }
            });
    }

    cancel() {
        this.onCancel.next();
    }
}
