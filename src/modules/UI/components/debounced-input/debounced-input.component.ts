import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

export const INPUT_DEBOUNCE_TIME = 1000;

export enum SearchIconPosition {
    Start,
    End,
}

@Component({
    selector: 'debounced-input',
    templateUrl: './debounced-input.component.html',
    styleUrls: ['./debounced-input.component.scss']
})
export class DebouncedInputComponent implements OnInit {
    @Input() value = '';
    @Input() hideSearchIcon = false;
    @Input() searchIconPosition = SearchIconPosition.End;
    @Input() placeholder = 'Search';
    @Input() debounceTime = INPUT_DEBOUNCE_TIME;
    @Output() valueChange = new EventEmitter<string>();
    SearchIconPosition = SearchIconPosition;
    inputControl = new FormControl();

    ngOnInit() {
        this.inputControl.valueChanges
            .pipe(
                debounceTime(this.debounceTime),
                distinctUntilChanged()
            )
            .subscribe(inputValue => {
                this.valueChange.emit(inputValue);
            });
    }

}
