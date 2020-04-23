import {Component, Input, OnInit} from '@angular/core';
import {DiscussionModel} from "../../data/discussions";
import {ForumFacadeService} from "../../services/forum-facade.service";

@Component({
    selector: 'discussion-summary',
    templateUrl: './discussion-summary.component.html',
    styleUrls: ['./discussion-summary.component.scss']
})
export class DiscussionSummaryComponent implements OnInit {
    @Input() discussion: DiscussionModel;
    @Input() showForumType: boolean = false;
    @Input() url: string;

    discussionUrl: string;

    constructor(private _facadeService: ForumFacadeService) {
    }

    ngOnInit() {
        this.discussionUrl = this._facadeService.getDiscussionUrl(this.discussion.id);
    }

}
