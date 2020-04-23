import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DiscussionPostsService} from "../../services/discussion-posts.service";
import {DiscussionModel} from "../../data/discussions";
import {DiscussionPostModel} from "../../data/discussion-posts";
import {MarkdownInputErrorHandler} from "../../../Markdown/components/markdown-input/markdown-input.component";
import {of} from "rxjs";

@Component({
    selector: 'create-discussion-post',
    templateUrl: './create-discussion-post.component.html',
    styleUrls: ['./create-discussion-post.component.scss']
})
export class CreateDiscussionPostComponent implements OnInit {
    @Input() discussion: DiscussionModel;
    @Output() onAddPost = new EventEmitter<DiscussionPostModel>();

    formGroup: FormGroup;
    processCreation: boolean;

    constructor(private _discussionPostsService: DiscussionPostsService) {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            'content': new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(3000)])
        });
    }

    handleAddPost() {
        const control = this.formGroup.controls['content'];

        this.processCreation = true;
        this._discussionPostsService.createDiscussionPost({
            discussionId: this.discussion.id,
            message: control.value
        }).subscribe({
            next: (comment: DiscussionPostModel) => {
                this.onAddPost.next(comment);
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
        return of('Please, enter message from 5 to 3000 characters');
    }
}
