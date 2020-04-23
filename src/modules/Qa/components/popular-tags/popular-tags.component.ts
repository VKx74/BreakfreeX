import {Component, Inject, OnInit} from '@angular/core';
import {ProcessState} from "@app/helpers/ProcessState";
import {Router} from "@angular/router";
import {QaApiService} from "../../../Qa/services/api.service";
import {QaHelperService} from "../../../Qa/services/qa-helper.service";
import {IPopularTagDTO} from "../../../Qa/data/api";

interface ITag {
    name: string;
    count: number;
}

const MaxTagsCount = 10;

@Component({
    selector: 'popular-tags',
    templateUrl: './popular-tags.component.html',
    styleUrls: ['./popular-tags.component.scss']
})
export class PopularTagsComponent implements OnInit {
    loadProcessState = new ProcessState();
    tags: ITag[] = [];

    constructor(private _apiService: QaApiService,
                private _router: Router,
                private _helperService: QaHelperService) {
    }

    ngOnInit() {
        this.loadProcessState.setPending();
        this._apiService.getPopularTags()
            .subscribe({
                next: (tags: IPopularTagDTO[]) => {
                    tags = tags.slice(0, MaxTagsCount);
                    this.tags = tags.map((tag: IPopularTagDTO) => {
                        return {
                            name: tag.tagName,
                            count: tag.count
                        };
                    });

                    this.loadProcessState.setSucceeded();
                },
                error: (e) => {
                    console.error(e);
                    this.loadProcessState.setFailed();
                }
            });
    }

    handleTagClick(tagName: string) {
        this._helperService.showTaggedQuestions(tagName);
    }
}
