import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

const ScrollControlHeight = 26;

enum ScrollDirection {
    TOP,
    BOTTOM
}

@Component({
    selector: 'scroller',
    templateUrl: './scroller.component.html',
    styleUrls: ['./scroller.component.scss']
})
export class ScrollerComponent implements OnInit {
    @ViewChild('scrollBox', {static: false}) scrollBox: ElementRef;
    @ViewChild('contentBox', {static: false}) contentBox: ElementRef;

    private _showScrollTop: boolean;
    private _showScrollBottom: boolean;

    get showScrollTop(): boolean {
        return this._showScrollTop;
    }

    get showScrollBottom(): boolean {
        return this._showScrollBottom;
    }

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this._updateScrollControlsVisibility();
        });
    }

    scrollTop() {
        this.scroll(ScrollDirection.TOP);
    }

    scrollBottom() {
        this.scroll(ScrollDirection.BOTTOM);
    }

    scroll(direction: ScrollDirection) {
        const $scrollBoxElement = $(this.scrollBox.nativeElement);
        const $contentBox = $(this.contentBox.nativeElement);
        const $contentBoxHeight = $contentBox.outerHeight();
        const scrollBoxHeight = $scrollBoxElement.outerHeight();
        const scrollTop = $scrollBoxElement.scrollTop();

        let scroll: number;

        switch (direction) {
            case ScrollDirection.TOP:
                scroll = scrollTop - scrollBoxHeight + ScrollControlHeight * 2;

                if (scroll <= 0) {
                    scroll = 0;
                }

                break;

            case ScrollDirection.BOTTOM:
                scroll = scrollTop + scrollBoxHeight - ScrollControlHeight * 2;

                if (scroll >= $contentBoxHeight - scrollBoxHeight) {
                    scroll = $contentBoxHeight - scrollBoxHeight;
                }

                break;
            default:
                throw new Error(`Unknown direction`);
        }

        $scrollBoxElement.animate({scrollTop: scroll}, 300, () => {
            this._updateScrollControlsVisibility();
        });
    }

    @HostListener('window:resize', ['$event'])
    handleResize() {
        this._updateScrollControlsVisibility();
    }

    private _updateScrollControlsVisibility() {
        const $scrollBox = $(this.scrollBox.nativeElement);
        const $contentBox = $(this.contentBox.nativeElement);

        this._showScrollTop = $(this.scrollBox.nativeElement).scrollTop() > 0;
        this._showScrollBottom = $scrollBox.scrollTop() < $contentBox.outerHeight() - Math.ceil($scrollBox.outerHeight()); // ceil for fix firefox issue
    }
}
