import {HttpProgressEvent} from "@angular/common/http";

export class FileInfo {
    id: string;
    protected: boolean;
    creatorId: string;
    mimeType: string;
    lifetime: number;
    updated: number;
    created: number;
    size: number;
    fileName: string;
}

export class FileSettings {
    lifeTime?: number;
}

export interface Base64File {
    fileName: string;
    base64Body: string;
}

export enum ImageSize {
    Original,
    Small,  // 128 * height
    Middle, // 512 * height
    Large   // 1024 * height
}

export interface UploadFileResponceDTO {
    data: FileInfo;
}

export type RequestProgressHandler = (event: HttpProgressEvent) => any;