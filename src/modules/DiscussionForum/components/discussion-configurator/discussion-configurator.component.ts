import {Component, Input, OnInit} from '@angular/core';
import {DiscussionDTO, ICategoryDTO, ICreateDiscussionParams} from "../../data/api";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MarkdownInputErrorHandler} from "../../../Markdown/components/markdown-input/markdown-input.component";
import {Observable, of} from "rxjs";
import {DiscussionsForumRoutes} from "../../discussion-forum.routes";
import {catchError, tap} from "rxjs/operators";
import {AlertService} from "@alert/services/alert.service";

export interface IDiscussionConfiguratorOutput {
    title: string;
    description: string;
    category?: string;
}

export interface IDiscussionConfiguratorConfig {
    discussion?: DiscussionDTO;
    categories: ICategoryDTO[];
    submitHandler: (data: IDiscussionConfiguratorOutput) => Observable<any>;
}

@Component({
    selector: 'discussion-configurator',
    templateUrl: './discussion-configurator.component.html',
    styleUrls: ['./discussion-configurator.component.scss']
})
export class DiscussionConfiguratorComponent implements OnInit {
    @Input() config: IDiscussionConfiguratorConfig;
    formGroup: FormGroup;
    categoriesOptions: (ICategoryDTO | number)[];
    processing: boolean = false;

    get categories(): ICategoryDTO[] {
        return this.config.categories;
    }

    get isEditMode(): boolean {
        return this.config.discussion != null;
    }

    constructor(private _alertService: AlertService) {
    }

    ngOnInit() {
        const discussionToEdit = this.config.discussion;

        this.formGroup = new FormGroup({
            'title': new FormControl(discussionToEdit ? discussionToEdit.title : '', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]),
            'description': new FormControl(discussionToEdit ? discussionToEdit.description : '', [Validators.required, Validators.minLength(10), Validators.maxLength(6000)]),
            'category': new FormControl(discussionToEdit && discussionToEdit.categories && discussionToEdit.categories.length
                ? discussionToEdit.categories.map(c => c.id)[0]
                : -1
            )
        });

        this.categoriesOptions = [
            -1,
            ...this.categories
        ];
    }

    submit() {
        const controls = this.formGroup.controls;
        const category = controls['category'].value;

        this.processing = true;

        this.config.submitHandler({
            title: controls['title'].value,
            description: controls['description'].value,
            category: category === -1 ? null : category,
        } as IDiscussionConfiguratorOutput)
            .subscribe({
                next: () => this.processing = false,
                error: () => {
                    this.processing = false;
                    let errorMessage = 'Discussion cannot be created';
                    if (this.isEditMode) {
                        errorMessage = 'Discussion cannot be updated';
                    }
                    this._alertService.error(errorMessage);

                }
            });
    }

    markdownInputErrorHandler: MarkdownInputErrorHandler = (control: FormControl) => {
        return of('Please, enter message from 10 to 6000 characters');
    }
}
