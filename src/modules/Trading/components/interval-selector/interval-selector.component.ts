import {Component, forwardRef, Input} from '@angular/core';
import {of} from "rxjs";
import {SelectorComponent, SelectorTemplate} from "../../../UI/components/selector/selector.component";
import {NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
    selector: 'interval-selector',
    template: SelectorTemplate,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IntervalSelectorComponent),
            multi: true
        }
    ]
})
export class IntervalSelectorComponent extends SelectorComponent<number> {
    constructor() {
        super();

        this.selectedOption = 1;
        this.options = [1, 5, 10, 15, 30];
    }

    ngOnInit() {
        this.optionCaption = (interval: number) => of(interval.toString());
    }
}
