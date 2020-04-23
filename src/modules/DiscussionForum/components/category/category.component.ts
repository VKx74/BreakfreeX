import {Component, Input, OnInit} from '@angular/core';
import {Params} from "@angular/router";
import {ForumFacadeService} from "../../services/forum-facade.service";

@Component({
    selector: 'category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
    @Input() category: {
        id: string;
        name: string;
        description: string;
        count: number;
    };

    navigationInfo: { url: string, queryParams: Params };
    queryParams: Params;

    constructor(private _facadeService: ForumFacadeService) {
    }

    ngOnInit() {
        this.navigationInfo = this._facadeService.getSearchDiscussionsByCategoryUrl(this.category.id);
    }
}
