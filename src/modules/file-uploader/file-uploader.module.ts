import {Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileUploaderModalComponent} from "./components/file-uploader-modal/file-uploader-modal.component";
import {ImageEditorComponent} from "./components/image-editor/image-editor.component";
import {ImageFromCamComponent} from "./components/image-from-cam/image-from-cam.component";
import {UploaderComponent} from "./components/file-uploader/file-uploader.component";
import {UploadFileItemComponent} from "./components/upload-file-item/upload-file-item.component";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {FileUploaderTranslateService} from "./localization/token";
import {SharedTranslateService} from "@app/localization/shared.token";
import {UIModule} from 'UI';
import {FormsModule} from '@angular/forms';
import {UploadFileInputComponent} from './components/upload-file-input/upload-file-input.component';
import { ImageEditorModalComponent } from './components/image-editor-modal/image-editor-modal.component';
import {FileInfoSimpleComponent} from "../Chat/components/file-info-simple.component/file-info-simple.component";
import {ChatFileUploaderComponent} from "../Chat/components/chat-file-uploader/chat-file-uploader.component";

@NgModule({
    imports: [
        LocalizationModule
    ],
    exports: [],
    entryComponents: [],
    providers: [
        {
            provide: FileUploaderTranslateService,
            useFactory: TranslateServiceFactory('fileUploader'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class FileUploaderLocalizationModule {
}


@NgModule({
    declarations: [
        FileUploaderModalComponent,
        UploaderComponent,
        ImageEditorComponent,
        ImageFromCamComponent,
        UploadFileItemComponent,
        UploadFileInputComponent,
        ImageEditorModalComponent,
        ChatFileUploaderComponent,
        FileInfoSimpleComponent,
    ],
    imports: [
        UIModule,
        FormsModule,
        CommonModule,
        LocalizationModule,
        MatProgressBarModule
    ],
    exports: [
        FileUploaderModalComponent,
        UploaderComponent,
        ImageEditorComponent,
        ImageFromCamComponent,
        UploadFileItemComponent,
        UploadFileInputComponent,
        ChatFileUploaderComponent,
        FileInfoSimpleComponent,
    ],
    entryComponents: [
        FileUploaderModalComponent,
        ImageEditorModalComponent,
        ChatFileUploaderComponent,
        FileInfoSimpleComponent,
    ],
    providers: [
        {
            provide: FileUploaderTranslateService,
            useFactory: TranslateServiceFactory('fileUploader'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class FileUploaderModule {
    static localizationService(): ModuleWithProviders {
        return {
            ngModule: FileUploaderLocalizationModule,
            providers: []
        };
    }
}
