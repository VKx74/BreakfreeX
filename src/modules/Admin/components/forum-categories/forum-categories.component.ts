import {Component, OnInit} from '@angular/core';
import {IPaginationResponse, PaginationComponent} from "@app/models/pagination.model";
import {DiscussionDTO, ICategoryDTO} from "../../../DiscussionForum/data/api";
import {ConfirmModalComponent, IConfirmModalConfig, SearchHandler} from "UI";
import {MatDialog} from "@angular/material/dialog";
import {DiscussionsService} from "../../../DiscussionForum/services/discussions.service";
import {ActivatedRoute} from "@angular/router";
import {Observable, of} from "rxjs";
import {PageEvent} from "@angular/material/typings/paginator";
import {
    IJSONViewDialogData,
    JSONViewDialogComponent
} from "../../../Shared/components/json-view/json-view-dialog.component";
import {DiscussionsForumRoutes} from "../../../DiscussionForum/discussion-forum.routes";
import {ForumTypeToUrl} from "../../../DiscussionForum/functions";
import {FiltrationParams} from "@app/models/filtration-params";
import {DiscussionForumApiService} from "../../../DiscussionForum/services/api.service";
import {catchError, map, tap} from "rxjs/operators";
import {IForumResolverData} from "../../resolvers/forum-categories.resolver";
import {
    ForumCategoryConfiguratorComponent,
    IForumCategoryConfiguratorConfig
} from "../forum-category-configurator/forum-category-configurator.component";
import {AlertService} from "@alert/services/alert.service";

export interface IRequestParams {
    search?: string;
}

class CategoriesFiltrationParams extends FiltrationParams<IRequestParams> implements IRequestParams {
    search;

    constructor() {
        super();
    }

    toObject(): IRequestParams {
        return {
            search: this.search
        };
    }
}

@Component({
    selector: 'forum-categories',
    templateUrl: './forum-categories.component.html',
    styleUrls: ['./forum-categories.component.scss']
})
export class ForumCategoriesComponent extends PaginationComponent<ICategoryDTO> implements OnInit {
    categories: ICategoryDTO[];
    searchHandler = new SearchHandler();
    requestParams = new CategoriesFiltrationParams();

    constructor(private _dialog: MatDialog,
                private _discussionsService: DiscussionsService,
                private _activatedRoute: ActivatedRoute,
                private _forumApiService: DiscussionForumApiService,
                private _alertService: AlertService) {
        super();
    }

    ngOnInit() {
        const resolvedDiscussions = ((this._activatedRoute.snapshot.data).resolvedData as Observable<IForumResolverData>);
        resolvedDiscussions.subscribe((data: IForumResolverData) => {
            this.setPaginationHandler(data.categories);
        });
    }

    getItems(): Observable<IPaginationResponse<ICategoryDTO>> {
        return this._forumApiService.getCategories(this.paginationParams)
            .pipe(
                map((c) => {
                    return {
                        items: c.data,
                        total: c.itemsCount
                    };
                })
            );
    }

    responseHandler(response: [IPaginationResponse<ICategoryDTO>, PageEvent]): void {
        this.categories = response[0].items;
    }

    handleCreateCategory() {
        this._dialog.open(ForumCategoryConfiguratorComponent, {
            data: {
                submitHandler: (name, description, closeModal) => {
                    return this._forumApiService.createCategory({
                        name,
                        description
                    })
                        .pipe(
                            tap(() => {
                                closeModal();
                                this.resetPagination();
                            }),
                            catchError((e) => {
                                console.error(e);

                                return of(null);
                            })
                        );
                }
            } as IForumCategoryConfiguratorConfig
        });
    }

    handleUpdateCategory(category: ICategoryDTO) {
        this._dialog.open(ForumCategoryConfiguratorComponent, {
            data: {
                name: category.name,
                description: category.description,
                submitHandler: (name, description, closeModal) => {
                    return this._forumApiService.updateCategory(category.id, {
                        name,
                        description
                    })
                        .pipe(
                            tap(() => {
                                closeModal();
                                this.resetPagination();
                            }),
                            catchError((e) => {
                                console.error(e);

                                return of(null);
                            })
                        );
                }
            } as IForumCategoryConfiguratorConfig
        });
    }

    handleDeleteCategory(category: ICategoryDTO) {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                onConfirm: () => {
                    this._forumApiService.deleteCategory(category.id)
                        .subscribe({
                            next: () => {
                                this.resetPagination();
                            },
                            error: (e) => {
                                console.error(e);
                                this._alertService.error('Failed to delete category');

                                return of(null);
                            }
                        });
                }
            } as IConfirmModalConfig
        });
    }

    showDetails(category: ICategoryDTO) {
        this._dialog.open<JSONViewDialogComponent, IJSONViewDialogData>(JSONViewDialogComponent, {
            data: {
                title: 'Category Details',
                json: category,
            }
        });
    }

    search(searchTerm: string) {
        this.requestParams.search = searchTerm;
        this.resetPagination();
    }

    getDiscussionUrl(discussion: DiscussionDTO): string {
        return `/${DiscussionsForumRoutes.Forums}/${ForumTypeToUrl(discussion.forumType)}/${DiscussionsForumRoutes.Discussions}/${discussion.id}`;
    }
}
