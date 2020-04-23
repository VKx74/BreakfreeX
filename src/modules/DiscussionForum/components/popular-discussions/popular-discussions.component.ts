import {Component, OnInit} from '@angular/core';
import {ProcessState} from "@app/helpers/ProcessState";
import {DiscussionDTO} from "../../data/api";
import {ForumFacadeService} from "../../services/forum-facade.service";

@Component({
    selector: 'popular-discussions',
    templateUrl: './popular-discussions.component.html',
    styleUrls: ['./popular-discussions.component.scss']
})
export class PopularDiscussionsComponent implements OnInit {
    loadThemesProcessState = new ProcessState();
    items: DiscussionDTO[] = [];

    constructor(private _facadeService: ForumFacadeService) {
    }

    ngOnInit() {
        this.loadThemesProcessState.setPending();

        this._facadeService.getPopularDiscussions()
            .subscribe({
                next: (result: DiscussionDTO[]) => {
                    this.items = result;
                    this.loadThemesProcessState.setSucceeded();
                },
                error: (e) => {
                    console.error(e);
                    this.loadThemesProcessState.setFailed();
                }
            });
    }

    getDiscussionUrl(item: DiscussionDTO): string {
        return this._facadeService.getDiscussionUrl(item.id);
    }
}
