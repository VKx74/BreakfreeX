///<reference path="../../../../libs/croopie/croppie.d.ts"/>
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    ViewChild,
    OnInit
} from '@angular/core';
import {from, Observable, of} from "rxjs";

export interface IImageEditorComponentConfig {
    viewportType: 'square' | 'circle';
    height: number;
    width: number;
    hideCloseBtn?: boolean;
    hideSaveBtn?: boolean;
}

export const DefaultImageEditorComponentConfig: IImageEditorComponentConfig = {
    viewportType: 'circle',
    height: 200,
    width: 200,
    hideCloseBtn: false,
    hideSaveBtn: false
};

export interface ImageEditorComponentResult {
    url: string;
    isEdited: boolean;
}

@Component({
    selector: 'image-editor',
    templateUrl: './image-editor.component.html',
    styleUrls: ['./image-editor.component.scss'],
})
export class ImageEditorComponent implements OnInit {
    @Input() config: IImageEditorComponentConfig = DefaultImageEditorComponentConfig;
    @Input() url: string;
    @Output() onComplete = new EventEmitter<ImageEditorComponentResult>();

    @Input()
    @HostBinding('class.fullWindow')
    fullWindow = false;

    public croppieOptions: CroppieOptions = {
        enableOrientation: true,
        enableZoom: true,
        viewport: {width: 200, height: 200}
    };

    @ViewChild('croppie', {static: true})
    public croppieImg: ElementRef;
    private _croppie: Croppie;
    private _updateOptions: any = {zoom: 1};

    get hideCloseBtn(): boolean {
        return this.config.hideCloseBtn === true;
    }

    get hideSaveBtn(): boolean {
        return this.config.hideSaveBtn === true;
    }

    showPlaceholder = true;

    constructor() {
    }

    ngOnInit() {
        this.croppieOptions.viewport.width = this.config.width;
        this.croppieOptions.viewport.height = this.config.height;
        this._croppie = new Croppie(this.croppieImg.nativeElement, this.croppieOptions);
        this._bind({...this.croppieOptions, url: this.url});
        this.showPlaceholder = false;
    }

    rotateLeft() {
        this._croppie.rotate(-90);
    }

    rotateRight() {
        this._croppie.rotate(90);
    }

    save() {
        if (!this._croppie) {
            return Promise.resolve(null);
        }

        return this._croppie
            .result({type: 'base64', size: 'original'})
            .then(this._changeUrl.bind(this))
            .catch(console.error);
    }

    getImageUrl(): Observable<string> {
        if (!this._croppie) {
            return of(null);
        }

        return from(this._croppie
            .result({type: 'base64', size: 'original'})
        );
    }

    @HostListener('window:resize')
    private _onWindowResize() {
        if (this._croppie) {
            this._croppie.setZoom(this._updateOptions.zoom);
        }
    }

    @HostListener('window:keydown', ['$event'])
    private _onWindowKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.onComplete.emit({
                url: this.url,
                isEdited: false
            });
        }
    }

    private _bind(options: any) {
        this._croppie.bind({...options, url: this.url});
    }

    private _changeUrl(value: string) {
        this.onComplete.emit({
            url: value,
            isEdited: true
        });

        this.url = value;
    }
}
