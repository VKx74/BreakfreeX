import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[PosNegativeNumberColorDirective]'
})
export class PosNegativeNumberColorDirective implements AfterViewInit {
    constructor(private _element: ElementRef, private _renderer: Renderer2) {
    }

    ngAfterViewInit(): void {
        try {

            const element = this._element.nativeElement as HTMLElement;
            this._renderer.removeClass(element, "positive");
            this._renderer.removeClass(element, "negative");
            const number = parseFloat(element.innerText);

            if (!isNaN(number)) {
                if (number > 0) {
                    this._renderer.addClass(element, "positive");
                } else if (number < 0) {
                    this._renderer.addClass(element, "negative");
                }
            }
        } catch (ex) {}
    }
}