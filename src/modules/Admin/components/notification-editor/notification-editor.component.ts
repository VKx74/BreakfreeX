import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {SystemNotification} from "../../../Notifications/models/models";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {
    TagsInputAutocompleteHandler,
    TagsInputMode,
    TagsInputTagNameSelector
} from "@tagsInput/components/tags-input/tags-input.component";
import {Observable, of} from "rxjs";
import {IUserTag, UserTagsService} from "../../services/user-tags.service";
import {catchError} from "rxjs/operators";
import {TzUtils} from "TimeZones";
import {MarkdownInputErrorHandler} from "../../../Markdown/components/markdown-input/markdown-input.component";

export interface NotificationEditorConfig {
    notification: SystemNotification;
    isEditMode: boolean;
    submitHandler: (notification: SystemNotification) => Observable<any>;
}

@Component({
    selector: 'notification-editor',
    templateUrl: './notification-editor.component.html',
    styleUrls: ['./notification-editor.component.scss']
})
export class NotificationEditorComponent extends Modal<NotificationEditorConfig, SystemNotification> {
    readonly descriptionLength: number = 3000;
    readonly titleLength: number = 50;
    processing: boolean = false;
    isEditMode: boolean = false;
    formGroup: FormGroup;

    private _tags: IUserTag[] = [];

    get tags(): IUserTag[] {
        return this._tags;
    }

    get notification(): SystemNotification {
        return this.data.notification;
    }

    get TagsInputMode() {
        return TagsInputMode;
    }

    constructor(private _injector: Injector,
                private _userTagsService: UserTagsService) {
        super(_injector);
        const data = this.data;
        this.isEditMode = data.isEditMode;
        this.formGroup = this._getFormGroup();
    }

    ngOnInit() {
        this._userTagsService.getTags()
            .subscribe({
                next: (tags: IUserTag[]) => {
                    this._tags = tags.filter(t => this.notification.userTags.indexOf(t.name) !== -1);
                },
                error: (e) => {
                    console.error(e);
                }
            });
    }

    removeTag(tag: IUserTag) {
        this._tags = this._tags.filter(t => t.id !== tag.id);
    }

    addTag(tag: IUserTag) {
        this._tags.push(tag);
    }

    tagsAutocompleteHandler: TagsInputAutocompleteHandler = (query: string) => {
        return this._userTagsService.searchTags(query)
            .pipe(
                catchError((e) => {
                    console.error(e);
                    return of([]);
                })
            );
    }

    tagNameSelector: TagsInputTagNameSelector = (tag: IUserTag) => {
        return tag.name;
    }

    handleSubmit() {
        const notification = this._getFormControlsValues();
        const obs = this.data.submitHandler(notification);

        obs.subscribe({
            next: (value) => {
                this.close(value);
            },
            error: (e) => {
                console.log(e);
            }
        });
    }

    markdownInputErrorHandler: MarkdownInputErrorHandler = (control: FormControl) => {
        return of(`Description have to contain 1-${this.descriptionLength} characters`);
    }

    private _localTimeToUtc(time: number): number {
        return TzUtils.localToUTCTz(new Date(time)).getTime();
    }

    private _utcTimeToLocal(time: number): number {
        return TzUtils.utcToLocalTz(new Date(time)).getTime();
    }

    private _getFormControlsValues(): SystemNotification {
        const controls = this.formGroup.controls;
        return Object.assign({}, this.notification, {
            startDate: this._localTimeToUtc(controls['dateFrom'].value.getTime()) / 1000,
            endDate: this._localTimeToUtc(controls['dateTo'].value.getTime()) / 1000,
            title: controls['title'].value,
            description: controls['description'].value,
            userTags: this._tags.map(t => t.name)
        });
    }

    private _getFormGroup() {
        const notification = this.notification;
        return new FormGroup({
            dateFrom: new FormControl(this.isEditMode ? new Date(this._utcTimeToLocal(notification.startDate * 1000)) : null, Validators.required),
            dateTo: new FormControl(this.isEditMode ? new Date(this._utcTimeToLocal(notification.endDate * 1000)) : null, Validators.required),
            title: new FormControl(notification.title, [Validators.required, Validators.maxLength(this.titleLength)]),
            description: new FormControl(notification.description, [Validators.required, Validators.maxLength(this.descriptionLength)]),
        });
    }

}
