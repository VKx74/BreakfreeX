import {
    Component,
    ElementRef,
    Input,
    ViewChild,
    OnInit,
    forwardRef, Optional, Host, SkipSelf
} from '@angular/core';
import {ControlContainer, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Observable} from "rxjs";
import {FileUploaderModalComponent} from "../../../file-uploader/components/file-uploader-modal/file-uploader-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {FileStorageService} from "@app/services/file-storage.service";

declare var Markdown: any;

export type MarkdownInputErrorHandler = (control: FormControl) => Observable<string>;

@Component({
    selector: 'markdown-input',
    templateUrl: 'markdown-input.component.html',
    styleUrls: ['markdown-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MarkdownInputComponent),
            multi: true
        }
    ]
})

export class MarkdownInputComponent implements OnInit, ControlValueAccessor {
    @Input() placeholder = '';
    @Input() formControlName: string;
    @Input() errorHandler: (control: FormControl) => Observable<string>;
    @Input() noPreviewDelimiters = false;
    @ViewChild('preview', {static: true}) preview: ElementRef;
    @ViewChild('textarea', {static: true}) input: ElementRef;
    editor: any;

    formControl: FormControl;

    // @ViewChild(AddLinkModalComponent, {static: false}, {static: false}) addLinkModalComponent: AddLinkModalComponent;

    get showPreview(): boolean {
        const value = this.formControl.value;

        return this.formControl != null && value && value.length > 0;
    }

    constructor(@Optional() @Host() @SkipSelf()
                private _controlContainer: ControlContainer,
                private _storageService: FileStorageService,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
        if (this._controlContainer) {
            if (this.formControlName) {
                this.formControl = this._controlContainer.control.get(this.formControlName) as FormControl;
            } else {
                console.warn('Missing FormControlName directive from host element of the component');
            }
        } else {
            console.warn('Can\'t find parent FormGroup directive');
        }


        const converter = Markdown.getSanitizingConverter(),
            editor = this.editor = new Markdown.Editor(converter);

        editor.ui.onShowAddImageDialog = (cb) => {
            this._dialog.open(FileUploaderModalComponent, {
                data: {
                        uploader: {
                            allowedFiles: ['image/*'],
                            maxFileSizeMb: 2
                        },
                        imageEditor: {
                            height: 180,
                            width: 320,
                            viewportType: 'circle'
                        },
                        useCamera: false,
                        useEditor: false,
                        onFilesUploaded: (filesInfo) => {
                            const url = this._storageService.getImageUrl(filesInfo[0].id);
                            cb(url);
                        }
                }
            });
        };

        // editor.ui.onShowAddLinkDialog = (cb) => {
        //     this.addLinkModalComponent.visible = true;
        //     this.addLinkModalComponent.onLinkSubmitted = cb;
        // };

        editor.run();
        //
        // (<HTMLInputElement>document.querySelector('#wmd-input')).value = '';
        // $('#wmd-input').on('focus', () => {
        //     this.onFocus.emit();
        // });

        // this._translateService.onLangChange.subscribe((e) => {
        //     editor.lang = e.lang;
        // });
    }

    clear() {
        this.input.nativeElement.value = '';
        this.preview.nativeElement.html = '';
    }

    handleUpdate(value: string) {
        this.writeValue(value);
    }

    handleBlur() {
        this.onTouched();
    }

    writeValue(markdown: string): void {
        this.input.nativeElement.value = markdown;
        this.editor.refreshPreview();
        this.onChange(markdown);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
    }

    onChange: (value: string) => void = (value: string) => {
    }
    onTouched = () => {
    }
}
