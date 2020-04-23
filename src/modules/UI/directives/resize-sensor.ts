import {Directive, ElementRef, EventEmitter, Output} from "@angular/core";

declare let $: any;
declare let ResizeSensor: any;

@Directive({
    selector: '[resize-sensor]'
})
export class ResizeSensorDirective {
    @Output() onResize = new EventEmitter();
    private _resizeSensor: any;

    constructor(private _el: ElementRef) {
    }

    ngAfterViewInit() {
        this._resizeSensor = new ResizeSensor(this._el.nativeElement, () => {
            this.onResize.emit();
        });
    }
}
