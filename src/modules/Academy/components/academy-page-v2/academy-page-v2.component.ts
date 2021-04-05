import { Component, ElementRef } from "@angular/core";
import { Content } from "modules/Academy/models/dto";
@Component({
    selector: 'academy-page-v2',
    templateUrl: 'academy-page-v2.component.html',
    styleUrls: ['academy-page-v2.component.scss']
})
export class AcademyPageV2Component {
    private _srcBase: string = "https://fast.wistia.net/embed/iframe/";
    private _src: string;
    private _selectedMedia: Content;
    private _prevVideo: Content;
    private _nextVideo: Content;

    public sidebarOpen: boolean = false;

    public get canPrev(): boolean {
        return !!(this._prevVideo);
    }

    public get canNext(): boolean {
        return !!(this._nextVideo);
    }

    public get src(): string {
        return this._src;
    }

    public get selectedMedia(): Content {
        return this._selectedMedia;
    }
    
    public set selectedMedia(value: Content) {
        this.selectMedia(value);
    }

    constructor(private _hostElement: ElementRef) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    selectMedia(media: Content) {
        this._selectedMedia = media;
        const iframe = this._hostElement.nativeElement.querySelector('iframe');

        if (this._selectedMedia) {
            iframe.src = `${this._srcBase}\\${this._selectedMedia.hashed_id}?videoFoam=true`;
        } 
    }

    prevVideo() {
        if (this._prevVideo) {
            this.selectMedia(this._prevVideo);
        }
    }

    nextVideo() {
        if (this._nextVideo) {
            this.selectMedia(this._nextVideo);
        }
    }

    getTiming(): string {
        if (!this._selectedMedia) {
            return "--:--:--";
        }

        return new Date(Math.round(this._selectedMedia.duration) * 1000).toISOString().substr(11, 8);
    }

    nextMediaChanged(media: Content) {
        this._nextVideo = media;
    }

    prevMediaChanged(media: Content) {
        this._prevVideo = media;
    }

    setSidebarState(state: boolean) {
        this.sidebarOpen = state;
    }
}
