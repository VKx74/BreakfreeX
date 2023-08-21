import { Component, ElementRef, Input } from "@angular/core";
import { Content } from "modules/Academy/models/dto";
import { Subject } from "rxjs/internal/Subject";

@Component({
    selector: 'academy-component',
    templateUrl: 'academy.component.html',
    styleUrls: ['academy.component.scss']
})
export class AcademyComponent {
    private _srcBase: string = "https://fast.wistia.net/embed/iframe/";
    private _src: string;
    private _selectedMedia: Content;
    private _canPrev: boolean;
    private _canNext: boolean;
    private _doNext: Subject<void> = new Subject<void>();
    private _doPrev: Subject<void> = new Subject<void>();

    @Input() public set isSidebarOpenByDefault(value: boolean) {
        this.sidebarOpened = value;
    }

    public sidebarOpened: boolean = true;
    
    public sidebarOpen: boolean = false;

    public get canPrev(): boolean {
        return this._canPrev;
    }

    public get canNext(): boolean {
        return this._canNext;
    } 
    
    public get doNext(): Subject<void> {
        return this._doNext;
    }

    public get doPrev(): Subject<void> {
        return this._doPrev;
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

    constructor(protected _hostElement: ElementRef) {
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
        this._doPrev.next();
    }

    nextVideo() {
        this._doNext.next();
    }

    canDoNext(value: boolean) {
        this._canNext = value;
    }

    canDoPrev(value: boolean) {
        this._canPrev = value;
    }

    getTiming(): string {
        if (!this._selectedMedia) {
            return "--:--:--";
        }

        return new Date(Math.round(this._selectedMedia.duration) * 1000).toISOString().substr(11, 8);
    }

    setSidebarState(state: boolean) {
        this.sidebarOpen = state;
    }
}
