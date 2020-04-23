import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Observable, of} from "rxjs";
import {FormControl} from "@angular/forms";
import {debounceTime, startWith, switchMap} from "rxjs/operators";
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";

export enum TagsInputMode {
    Manual,
    Autocomplete
}

export type TagsInputAutocompleteHandler = (query: string) => Observable<any[]>;
export type TagsInputTagNameSelector = (tag: any) => string;

@Component({
    selector: 'tags-input',
    templateUrl: './tags-input.component.html',
    styleUrls: ['./tags-input.component.scss']
})
export class TagsInputComponent {
    @Input() showAutocomplete = true;
    @Input() mode: TagsInputMode = TagsInputMode.Manual;
    @Input() tags: any[] = [];
    @Input() placeholder: string = 'Add tags...';
    @Input() autocompleteHandler: TagsInputAutocompleteHandler;
    @Input() autocompleteDebounce: number = 300;
    @Output() onAddTag = new EventEmitter<any>();
    @Output() onRemoveTag = new EventEmitter<any>();
    @Output() onTagsChange = new EventEmitter<any[]>();
    @ViewChild('tagInput', {static: false}) tagInput: ElementRef;
    @ViewChild(MatAutocompleteTrigger, {static: false}) autocompleteTrigger: MatAutocompleteTrigger;

    filteredTags: Observable<string[]>;

    get isManualMode(): boolean {
        return this.mode === TagsInputMode.Manual;
    }

    get isAutocompleteMode(): boolean {
        return this.mode === TagsInputMode.Autocomplete;
    }

    tagsCtrl = new FormControl();

    @Input() tagNameSelector: TagsInputTagNameSelector = (tag: string) => tag;

    constructor() {
        this.filteredTags = this.tagsCtrl.valueChanges.pipe(
            startWith(''),
            debounceTime(this.autocompleteDebounce),
            switchMap((query: string | null) => {
                if (this.autocompleteHandler && query != null && typeof query === 'string') {
                    return this.autocompleteHandler(query);
                }

                return of([]);
            })
        );
    }

    ngOnInit() {
    }

    removeTag(tag: string) {
        this.onRemoveTag.emit(tag);
        this.onTagsChange.emit(this.tags);

        if (this.mode === TagsInputMode.Autocomplete) {
            setTimeout(() => {
                this.autocompleteTrigger.updatePosition();
            }, 0);
        }
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const tag = event.value ? event.value.trim() : '';

        if (tag.length && !this._isTagAlreadyExist(tag)) {
            this.onAddTag.emit(tag);
            this.onTagsChange.emit(this.tags);
        }

        if (input) {
            input.value = '';
        }
    }

    handleTagSelected(event: MatAutocompleteSelectedEvent): void {
        const tag: any = event.option.value;

        if (!this._isTagAlreadyExist(tag)) {
            this.onAddTag.emit(tag);
            this.onTagsChange.emit(this.tags);
        }

        this.refreshInputField();
    }

    refreshInputField(emitEvent: boolean = true) {
        this.tagInput.nativeElement.value = '';
        this.tagsCtrl.setValue('', {emitEvent});
    }

    private _isTagAlreadyExist(tag: any): boolean {
        return this.tags.map(
            this.tagNameSelector
        ).indexOf(this.tagNameSelector(tag)) !== -1;
    }
}
