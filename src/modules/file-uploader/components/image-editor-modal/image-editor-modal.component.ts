import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import {
    DefaultImageEditorComponentConfig,
    IImageEditorComponentConfig, ImageEditorComponent
} from "@file-uploader/components/image-editor/image-editor.component";
import {JsUtil} from "../../../../utils/jsUtil";
import {of} from "rxjs";
import {tap} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {FileUploaderTranslateService} from "@file-uploader/localization/token";
import {switchmap} from "@decorators/switchmap";

export type IImageEditorModalSubmitHandler = (file: File) => void;

export interface IImageEditorModalConfig {
    file: File;
    imageEditorConfig?: IImageEditorComponentConfig;
    submitHandler: IImageEditorModalSubmitHandler;
}

@Component({
    selector: 'image-editor-modal',
    templateUrl: './image-editor-modal.component.html',
    styleUrls: ['./image-editor-modal.component.scss'],
    providers: [{
        provide: TranslateService,
        useExisting: FileUploaderTranslateService
    }]
})
export class ImageEditorModalComponent extends Modal<IImageEditorModalConfig> {
    @ViewChild(ImageEditorComponent, {static: false}) imageEditor: ImageEditorComponent;
    imageUrl: string;

    get editorConfig(): IImageEditorComponentConfig {
        return this.data.imageEditorConfig || DefaultImageEditorComponentConfig;
    }

    constructor(private _injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
        JsUtil.fileToDataURI(this.data.file)
            .subscribe((url: string) => {
                this.imageUrl = url;
            });
    }

    @switchmap()
    submit() {
        if (!this.imageEditor) {
            return of(null).subscribe();
        }

        return this.imageEditor.getImageUrl()
            .pipe(
                tap((url: string) => {
                    this.data.submitHandler(JsUtil.dataUriToFile(url, this.data.file.name));
                    this.close();
                })
            )
            .subscribe();
    }
}
