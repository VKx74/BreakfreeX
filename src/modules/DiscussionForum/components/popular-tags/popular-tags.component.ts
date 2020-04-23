import {Component, OnInit} from '@angular/core';
import {ProcessState} from "@app/helpers/ProcessState";
import {ForumFacadeService} from "../../services/forum-facade.service";

@Component({
    selector: 'popular-tags',
    templateUrl: './popular-tags.component.html',
    styleUrls: ['./popular-tags.component.scss']
})
export class PopularTagsComponent implements OnInit {
    loadProcessState = new ProcessState();
    tags: string[] = [];

    constructor(private _facadeService: ForumFacadeService) {
    }

    ngOnInit() {
        this.loadProcessState.setPending();
        this._facadeService.getPopularTags()
            .subscribe({
                next: (tags: string[]) => {
                    this.tags = tags;
                    this.loadProcessState.setSucceeded();
                },
                error: (e) => {
                    console.error(e);
                    this.loadProcessState.setFailed();
                }
            });
    }

    handleTagClick(tagName: string) {
        // this._helperService.showTaggedQuestions(tagName);
    }
}
