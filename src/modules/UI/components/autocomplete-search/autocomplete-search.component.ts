import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Observable, of} from "rxjs";
import {debounceTime, distinctUntilChanged, startWith, switchMap} from "rxjs/operators";

export type GetOptionsFunc = (search: string) => Observable<any>;

@Component({
    selector: 'autocomplete-search',
    templateUrl: './autocomplete-search.component.html',
    styleUrls: ['./autocomplete-search.component.scss']
})
export class AutocompleteSearchComponent implements OnInit {
    searchControl = new FormControl();
    options: any[];
    @Output() optionSelect = new EventEmitter();
    @Output() optionsChange = new EventEmitter<any[]>();
    @Input() showAutocomplete = true;
    @Input() placeholder = 'Search';
    @Input() getOptionsFunc: GetOptionsFunc;
    @Input() getOptionValue: (option: any) => any = option => option;
    @Input() getOptionTitle: (option: any) => string = option => option;

    get optionsItems(): Observable<any> {
        if (this.options) {
            return of(this.options);
        } else if (this.getOptionsFunc) {
            return this.getOptionsFunc('');
        } else {
            console.warn('NO PROVIDER FOR OPTIONS');
            return of(null);
        }
    }

    constructor() {
    }

    ngOnInit() {
        if (this.getOptionsFunc) {
            this.searchControl.valueChanges
                .pipe(
                    startWith(''),
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(term => this.getOptionsFunc(term))
                ).subscribe(options => {
                if (options) {
                    this.optionsChange.emit(options);
                    this.options = options;
                }
            });
        } else {
            console.log('No provider for getOptions function');
        }
    }


    onOptionSelect(option: any) {
        this.optionSelect.emit(option);
    }
}
