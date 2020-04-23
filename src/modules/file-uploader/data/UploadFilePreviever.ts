import {Injector} from "@angular/core";
import {UploadFile} from "./UploadFIle";
import {Observable, Observer} from "rxjs";
import {FileType} from "./FileType";
import {JsUtil} from "../../../utils/jsUtil";

export class UploadFilePreviewer {
    constructor(private _injector: Injector) {
    }

    getPreviewImageUrl(file: UploadFile): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            if (file.type === FileType.Image) {
                return JsUtil.fileToDataURI(file.file)
                    .subscribe(observer);
            } else {
                observer.next(this._getFilePreviewImg(file.file));
            }
        });
    }

    private _getFilePreviewImg(file: File): string {
        return '';
        // return this._mediaService.getFilePreview(file.name);
    }
}
