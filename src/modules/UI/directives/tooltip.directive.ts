import { Directive } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({selector: '[tooltip]'})
export class TooltipDirective extends MatTooltip {

    // show(delay?: number) {
    //     super.show(delay ? delay : 400);
    // }

    // hide(delay?: number) {
    //     super.hide(delay ? delay : 100);
    // }

    // matTooltipClass="tooltip-with-line-break"
    ngOnInit() {
        this.showDelay = 500;
        this.hideDelay = 100;
        this.tooltipClass = "bft_tooltip";
    }
}
