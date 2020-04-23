import {Component, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {DiscussionDTO} from "../../data/api";
import {ActivatedRoute, Router} from "@angular/router";
import {DiscussionsForumRoutes} from "../../discussion-forum.routes";
import {of} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {IDiscussionConfiguratorConfig} from "../discussion-configurator/discussion-configurator.component";
import {IEditDiscussionResolverValue} from "../../resolvers/edit-discussion.resolver";
import {ForumFacadeService} from "../../services/forum-facade.service";
import {DiscussionForumApiService} from "../../services/api.service";
import {IBreadcrumb} from "../../../Shared/components/breadcrumbs/breadcrumbs.component";
import {BreadcrumbsService} from "../../services/breadcrumbs.service";

@Component({
    selector: 'edit-discussion',
    templateUrl: './edit-discussion.component.html',
    styleUrls: ['./edit-discussion.component.scss']
})
export class EditDiscussionComponent implements OnInit {
    discussion: DiscussionDTO;
    formGroup: FormGroup;
    tags: string[] = [];
    configuratorConfig: IDiscussionConfiguratorConfig;
    breadcrumbs: IBreadcrumb[];

    get title() {
        return this.discussion ? this.discussion.title : '';
    }

    get description() {
        return this.discussion ? this.discussion.description : '';
    }

    constructor(private _facadeService: ForumFacadeService,
                private _apiService: DiscussionForumApiService,
                private _route: ActivatedRoute,
                private _router: Router,
                private _breadcrumbsService: BreadcrumbsService) {
    }

    ngOnInit() {
        const resolvedData = (this._route.snapshot.data['resolverData'] as IEditDiscussionResolverValue);

        this.discussion = resolvedData.discussion;
        this.configuratorConfig = {
            categories: resolvedData.categories,
            discussion: this.discussion,
            submitHandler: (data) => {
                return this._apiService.updateDiscussion(this.discussion.id, {
                    title: data.title,
                    description: data.description,
                    categoryIds: data.category ? [data.category] : []
                })
                    .pipe(
                        tap((dto) => {
                            this._router.navigate([DiscussionsForumRoutes.Discussions, dto.id], {
                                relativeTo: this._route.parent
                            });
                        }),
                        catchError((e) => {
                            console.error(e);

                            return of(null);
                        })
                    );
            }
        };
        this.breadcrumbs = this._breadcrumbsService.editDiscussionPage(this.discussion.id, this.discussion.title);
    }
}
