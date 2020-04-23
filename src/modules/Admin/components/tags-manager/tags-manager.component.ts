import {Component, ElementRef, Injector, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";
import {IUserTag, UserTagsService} from "../../services/user-tags.service";
import {Modal} from "Shared";

@Component({
    selector: 'tags-manager',
    templateUrl: './tags-manager.component.html',
    styleUrls: ['./tags-manager.component.scss']
})
export class TagsManagerComponent extends Modal {
    @ViewChild('input', {static: false}) inputElement: ElementRef;
    tags: IUserTag[] = [];
    isLoading: boolean = true;
    processing: boolean = false;

    constructor(_injector: Injector,
                private _dialog: MatDialog,
                private _userTagsService: UserTagsService) {
        super(_injector);
    }

    ngOnInit() {
        this._userTagsService.getTags()
            .subscribe({
                next: (tags: IUserTag[]) => {
                    this.tags = tags;
                    this.isLoading = false;
                },
                error: (e) => {
                    console.error(e);
                    this.close();
                }
            });
    }

    handleAddTag() {
        const inputNative = this.inputElement.nativeElement;
        const tagName = inputNative.value ? inputNative.value.trim() : '';

        if (tagName.length && this.tags.findIndex(t => t.name === tagName) === -1) {
            this.processing = true;
            this._userTagsService.createTag(tagName)
                .subscribe({
                    next: (tag: IUserTag) => {
                        this.tags.push(tag);
                    },
                    error: (e) => {
                        console.error(e);
                    },
                    complete: () => {
                        this.processing = false;
                    }
                });
        }

        inputNative.value = '';
    }

    handleDeleteTag(tag: IUserTag) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._userTagsService.deleteTag(tag.id)
                        .subscribe({
                            next: () => {
                                this.tags = this.tags.filter(t => t.id !== tag.id);
                            },
                            error: (e) => {
                                console.error(e);
                            }
                        });
                }
            }
        });
    }
}
