import {Component, Input, OnInit} from '@angular/core';
import {ForumType} from "../../enums/enums";
import {ICategoryDTO} from "../../data/api";
import {Observable} from "rxjs";
import {allForumTypes} from "../../functions";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ForumFacadeService} from "../../services/forum-facade.service";

export interface ISearchDiscussionsFilterValues {
    forumTypes?: ForumType[];
    category?: string;
}

export type SearchDiscussionFilterSubmitHandler = (value: ISearchDiscussionsFilterValues) => Observable<any>;


export interface ISearchDiscussionsFilterConfig {
    categories: ICategoryDTO[];
    values: ISearchDiscussionsFilterValues;
    submitHandler: SearchDiscussionFilterSubmitHandler;
}

@Component({
    selector: 'search-discussions-filter',
    templateUrl: './search-discussions-filter.component.html',
    styleUrls: ['./search-discussions-filter.component.scss']
})
export class SearchDiscussionsFilterComponent implements OnInit {
    @Input() config: ISearchDiscussionsFilterConfig;
    @Input() submitHandler: SearchDiscussionFilterSubmitHandler;

    categoryOptions: (ICategoryDTO | number)[];

    forumTypes: ForumType[] = [
        ForumType.Investor,
        ForumType.BasicTrader,
        ForumType.AdvancedTrader,
        ForumType.Institutional,
    ];
    formGroup: FormGroup;

    get values(): ISearchDiscussionsFilterValues {
        return this.config.values;
    }

    constructor(private _facadeService: ForumFacadeService) {
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            'forumTypes': new FormControl(this.values.forumTypes == null ? allForumTypes() : this.values.forumTypes, [Validators.required]),
            'category': new FormControl(this.values.category != null ? this.values.category : -1)
        });

        this.categoryOptions = [
            -1,
            ...this.config.categories
        ];
    }

    forumTypeOptionCaption(forumType: ForumType): Observable<string> {
        return this._facadeService.getForumTypeCaption(forumType);
    }

    submit() {
        const forumTypes = this.formGroup.controls['forumTypes'].value as ForumType[];
        const category = this.formGroup.controls['category'].value;

        const values: ISearchDiscussionsFilterValues = {
            forumTypes: forumTypes.length === allForumTypes().length ? null : forumTypes,
            category: category !== -1 ? category : null
        };

        this.config.submitHandler(values)
            .subscribe();
    }
}
