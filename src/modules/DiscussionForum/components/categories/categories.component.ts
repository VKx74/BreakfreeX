import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ICategoryDTO} from "../../data/api";
import {IBreadcrumb} from "../../../Shared/components/breadcrumbs/breadcrumbs.component";
import {BreadcrumbsService} from "../../services/breadcrumbs.service";

@Component({
    selector: 'categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
    categories: ICategoryDTO[];
    breadcrumbs: IBreadcrumb[];

    constructor(private _route: ActivatedRoute,
                private _breadcrumbsService: BreadcrumbsService) {
    }

    ngOnInit() {
        this.breadcrumbs = this._breadcrumbsService.categoriesPage();
        this.categories = this._route.snapshot.data['resolverData'];
    }
}
