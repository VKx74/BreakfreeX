import {Component, ContentChild, Directive, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {JsUtil} from "../../../../utils/jsUtil";
import {finalize} from "rxjs/operators";

export interface ISearchHandler {
    onSearch: (term: string) => Observable<any>;
    onSearchError?: (error: any, term?: string) => void;
    onSearchCompleted?: (result: any, term?: string) => void;
}

export class SearchHandler implements ISearchHandler {
    onSearch: (term: string) => Observable<any>;
    onSearchError?: (error: any, term?: string) => void;
    onSearchCompleted?: (result: any, term?: string) => void;
}

@Directive({
    selector: '[manual-search-input]'
})
export class ManualSearchInputDirective {
}

@Directive({
    selector: '[manual-search-trigger]'
})
export class ManualSearchTriggerDirective {
}


@Component({
    selector: 'manual-search',
    templateUrl: 'manual-search.component.html',
    styleUrls: ['manual-search.component.scss']
})
export class ManualSearchComponent {
    @Input() searchHandler: ISearchHandler;
    @Input() placeholder: string = '';
    @Input() showSpinner: boolean = false;
    @Input() allowEmptyQuery: boolean = true;
    @Output() onProcessingSearch = new EventEmitter<boolean>();
    @Output() onInputEmpty = new EventEmitter();


    @ViewChild('defaultSearchInput', {static: false}) defaultSearchInput: ElementRef;
    @ContentChild(ManualSearchInputDirective, {read: ElementRef, static: false}) customSearchInputElement: ElementRef;
    @ContentChild(ManualSearchTriggerDirective, {
        read: ElementRef,
        static: false
    }) customSearchTriggerElement: ElementRef;

    private _searchAttemptId: string;

    get searchInputPassed(): boolean {
        return this.customSearchInputElement != null;
    }

    get searchTriggerPassed(): boolean {
        return this.customSearchTriggerElement != null;
    }

    processingSearch: boolean;

    constructor() {
    }

    ngAfterViewInit() {
        if (this.customSearchTriggerElement) {
            this.customSearchTriggerElement.nativeElement.addEventListener('click', () => {
                this.triggerSearch();
            });
        }

        if (this.customSearchInputElement) {
            JsUtil.enterKeyListener(this.customSearchInputElement.nativeElement, (e: any) => {
                this.triggerSearch();
            });
        }
    }

    triggerSearch() {
        let term = this.customSearchInputElement
            ? this.customSearchInputElement.nativeElement.value
            : this.defaultSearchInput.nativeElement.value;

        this.performSearch(term.trim());
    }

    performSearch(term: string) {
        if (term.length === 0 && !this.allowEmptyQuery) {
            return;
        }

        if (this.searchHandler) {
            const attemptId = this._searchAttemptId = JsUtil.generateGUID();
            const isCurrentSearchAttempt = () => this._searchAttemptId === attemptId;

            this.processingSearch = true;
            this.onProcessingSearch.next(true);

            this.searchHandler.onSearch(term)
                .pipe(
                    finalize(() => {
                        if (isCurrentSearchAttempt()) {
                            this.processingSearch = false;
                            this.onProcessingSearch.next(false);
                        }
                    })
                )
                .subscribe(
                    (result: any) => {
                        if (isCurrentSearchAttempt() && this.searchHandler.onSearchCompleted) {
                            this.searchHandler.onSearchCompleted(result, term);
                        }
                    },
                    (error: any) => {
                        if (isCurrentSearchAttempt() && this.searchHandler.onSearchError) {
                            this.searchHandler.onSearchError(error, term);
                        }
                    });
        }
    }

    handleInputKeyDown(event: any) {
        if (event.keyCode === 13) { // Enter
            this.triggerSearch();
        }
    }

    handleInput(event: any) {
        if (event.target.value.length === 0) {
            this.onInputEmpty.emit();
        }
    }

    focus() {
        if (this.searchInputPassed) {
            this.customSearchInputElement.nativeElement.focus();
        } else {

            this.defaultSearchInput.nativeElement.focus();
        }
    }
}
