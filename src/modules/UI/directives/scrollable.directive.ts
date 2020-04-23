import {Directive, HostListener, EventEmitter, Output, ElementRef} from '@angular/core';
import ScrollEvent = JQuery.ScrollEvent;

@Directive({
    selector: '[scrollable]'
})
export class ScrollableDirective {
    @Output() scrolledToBottom: EventEmitter<ScrollEvent> = new EventEmitter<ScrollEvent>();
    @Output() scrolledToTop: EventEmitter<ScrollEvent> = new EventEmitter<ScrollEvent>();

    constructor(public el: ElementRef) {
    }

    @HostListener('scroll', ['$event'])
    onScroll(event: ScrollEvent) {
        try {
            const top = event.target.scrollTop;
            const height = this.el.nativeElement.scrollHeight;
            const offset = this.el.nativeElement.offsetHeight;

            if (top > height - offset - 1) {
                this.scrolledToBottom.emit(event);
            }

            if (top === 0) {
                this.scrolledToTop.emit(event);
            }
        } catch (err) {
            console.log(err);
        }
    }
}