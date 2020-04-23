import {Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {JsUtil} from "../../../utils/jsUtil";

@Directive({
    selector: '[onEnter]'
})
export class OnEnterDirective {
    @Output() enterHandler = new EventEmitter<string>();

    constructor(private _el: ElementRef) {
    }

    ngAfterViewInit() {
        JsUtil.enterKeyListener(this._el.nativeElement, (event: any) => {
            this.enterHandler.emit(event.target.value as string);
        });
    }
}
