import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {AVATAR_BACKGROUNDS} from "./avatar-backgrounds";
import {FileStorageService} from "@app/services/file-storage.service";
import {DomSanitizer} from "@angular/platform-browser";

export enum UserAvatarShape {
    Circle,
    Rounded,
}

@Component({
    selector: 'name-avatar',
    templateUrl: './name-avatar.component.html',
    styleUrls: ['./name-avatar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameAvatarComponent implements OnInit, OnChanges {
    avatarSrc: string = '';
    @Input() shape: UserAvatarShape = UserAvatarShape.Circle;
    @Input() highlighted = false;
    @Input() name: string = '';
    @Input() src: string = '';
    @Output() onColorSet = new EventEmitter<string>();

    private _colors: string [] = AVATAR_BACKGROUNDS;

    get isCircleShape() {
        return this.shape === UserAvatarShape.Circle;
    }

    constructor(private _fileStorageService: FileStorageService,
                private _cdRef: ChangeDetectorRef,
                private _sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this.setImage();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.name || changes.src) {
            this.setImage();
        }
    }

    setImage() {
        if (!this.src || this.src === FileStorageService.ChatThreadDefaultPhotoId) {
            this.avatarSrc = this._getDefaultAvatar(this.name);
            this._cdRef.detectChanges();
        } else {
            this._fileStorageService.getImageBase64(this.src)
                .subscribe(i => {
                    if (!i) {
                        this.avatarSrc = this._getDefaultAvatar(this.name);
                    } else {
                        this.avatarSrc = i;
                    }
                    this._cdRef.detectChanges();
                }, e => {
                    console.log(e);
                    this.avatarSrc = this._getDefaultAvatar(this.name);
                    this._cdRef.detectChanges();
                });
        }
    }

    private _getDefaultAvatar(name = '', size = 100) {
        let nameSplit = String(name).toUpperCase().split(' '),
            initials, charIndex, colourIndex, canvas, context, dataURI;


        if (nameSplit.length === 1) {
            initials = nameSplit[0] ? nameSplit[0].charAt(0) : '?';
        } else {
            initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
        }

        if (window.devicePixelRatio) {
            size = (size * window.devicePixelRatio);
        }

        charIndex = (initials === '?' ? 72 : initials.charCodeAt(0)) - 64;
        colourIndex = charIndex % 17;
        canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        context = canvas.getContext("2d");

        this.onColorSet.emit(this._colors[colourIndex - 1]);

        context.fillStyle = this._colors[colourIndex - 1];
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = Math.round(canvas.width / 1.75) + "px Arial";
        context.textAlign = "center";
        context.fillStyle = "#FFF";
        context.fillText(initials, size / 2, size / 1.45);

        dataURI = canvas.toDataURL();
        canvas = null;

        return dataURI;
    }

    onImageError() {
        this.avatarSrc = this._getDefaultAvatar(this.name);
        this._cdRef.detectChanges();
    }

}
