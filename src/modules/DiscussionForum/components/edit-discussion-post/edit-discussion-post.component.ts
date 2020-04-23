import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DiscussionPostsService} from "../../services/discussion-posts.service";
import {DiscussionModel} from "../../data/discussions";
import {DiscussionPostModel} from "../../data/discussion-posts";
import {MarkdownInputErrorHandler} from "../../../Markdown/components/markdown-input/markdown-input.component";
import {of} from "rxjs";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'edit-discussion-post',
    templateUrl: './edit-discussion-post.component.html',
    styleUrls: ['./edit-discussion-post.component.scss']
})
export class EditDiscussionPostComponent implements OnInit {
    @Input() post: DiscussionPostModel;
    @Output() onAddPost = new EventEmitter<DiscussionPostModel>();
    @Output() postEdited = new EventEmitter<DiscussionPostModel>();
    formGroup: FormGroup;
    processCreation: boolean;

    get message() {
        return this.post ? this.post.message : '';
    }

    constructor(private _discussionPostsService: DiscussionPostsService) {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            'content': new FormControl(this.message, [Validators.required, Validators.minLength(5), Validators.maxLength(3000)])
        });
    }

    handlePostEdit() {
        const control = this.formGroup.controls['content'];

        this.processCreation = true;
        this._discussionPostsService.updateDiscussionPost({
            id: this.post.id,
            message: control.value
        }).subscribe({
            next: (res: DiscussionPostModel) => {
                this.postEdited.emit({...res});
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
