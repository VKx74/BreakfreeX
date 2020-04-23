import {Component, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ICreateDiscussionParams} from "../../data/api";
import {ActivatedRoute, Router} from "@angular/router";
import {DiscussionsForumRoutes} from "../../discussion-forum.routes";
import {of} from "rxjs";
import {ForumFacadeService} from "../../services/forum-facade.service";
import {IBreadcrumb} from "../../../Shared/components/breadcrumbs/breadcrumbs.component";
import {BreadcrumbsService} from "../../services/breadcrumbs.service";
import {
    ICreateUpdateDiscussionResolverData
} from "../../resolvers/create-update-discussion.resolver";
import {IDiscussionConfiguratorConfig} from "../discussion-configurator/discussion-configurator.component";
import {catchError, tap} from "rxjs/operators";
import {AlertService} from "@alert/services/alert.service";
import {DiscussionForumApiService} from "../../services/api.service";

@Component({
    selector: 'create-discussion',
    templateUrl: './create-discussion.component.html',
    styleUrls: ['./create-discussion.component.scss']
})
export class CreateDiscussionComponent implements OnInit {
    formGroup: FormGroup;
    tags: string[] = [];
    breadcrumbs: IBreadcrumb[];
    configuratorConfig: IDiscussionConfiguratorConfig;

    constructor(private _facadeService: ForumFacadeService,
                private _breadcrumbsService: BreadcrumbsService,
                private _apiService: DiscussionForumApiService,
                private _route: ActivatedRoute,
                private _router: Router,
                private _alertService: AlertService) {
    }

    ngOnInit() {
        const resolveResult: ICreateUpdateDiscussionResolverData = this._route.snapshot.data['resolverData'];
        this.breadcrumbs = this._breadcrumbsService.createDiscussionPage();

        this.configuratorConfig = {
            categories: resolveResult.categories,
            submitHandler: (data) => {
                const model: ICreateDiscussionParams = {
                    title: data.title,
                    description: data.description,
                    forumType: this._facadeService.forumType,
                    categoryIds: data.category ? [data.category] : []
                };

                return this._apiService.createDiscussion(model)
                    .pipe(
                        tap((dto) => {
                            this._router.navigate([DiscussionsForumRoutes.Discussions, dto.id], {
                                relativeTo: this._route.parent
                            });
                        }),
                        catchError((e) => {
                            this._alertService.error('Failed to create discussion');
                            console.error(e);

                            return of(null);
                        })
                    );
            }
        };
    }
}
