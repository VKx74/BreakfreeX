import {Component, OnInit} from '@angular/core';
import {ProcessState} from "@app/helpers/ProcessState";
import {ForumFacadeService} from "../../services/forum-facade.service";
import {ICategoryDTO} from "../../data/api";
import {Params} from "@angular/router";
import {SearchDiscussionsQueryParams} from "../../resolvers/search-discussions.resolver";

@Component({
    selector: 'popular-categories',
    templateUrl: './popular-categories.component.html',
    styleUrls: ['./popular-categories.component.scss']
})
export class PopularCategoriesComponent implements OnInit {
    loadThemesProcessState = new ProcessState();
    items: ICategoryDTO[] = [];

    constructor(private _facadeService: ForumFacadeService) {
    }

    ngOnInit() {
        this.loadThemesProcessState.setPending();
        this._facadeService.getPopularCategories()
            .subscribe({
                next: (result: ICategoryDTO[]) => {
                    this.items = result;
                    this.loadThemesProcessState.setSucceeded();
                },
                error: (e) => {
                    console.error(e);
                    this.loadThemesProcessState.setFailed();
                }
            });
    }

    getCategoryUrl(category: ICategoryDTO): { url: string, queryParams: Params } {
        return this._facadeService.getSearchDiscussionsByCategoryUrl(category.id);
    }
}
