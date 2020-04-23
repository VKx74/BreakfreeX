import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";

export interface IBreadcrumb {
    label: Observable<string>;
    url?: string;
}

@Component({
    selector: 'breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
    @Input() breadcrumbs: IBreadcrumb[] = [
        {
            label: of('Basic Trader Forums'),
            url: '/'
        },
        {
            label: of('Discussions')
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
