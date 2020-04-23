import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ForumSharedModule} from "../ForumShared/forum-shared.module";
import {DiscussionForumApiService} from "./services/api.service";
import {DiscussionPostsService} from "./services/discussion-posts.service";
import {DiscussionsService} from "./services/discussions.service";
import {DiscussionsComponent} from './components/discussions/discussions.component';
import {DiscussionSummaryComponent} from './components/discussion-summary/discussion-summary.component';
import {RootComponent} from './components/root/root.component';
import {DiscussionForumRouter} from "./discussion-forum.router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "Shared";
import {DiscussionsResolver} from "./resolvers/discussions.resolver";
import {DiscussionDetailedResolver} from "./resolvers/discussion-detailed.resolver";
import {DiscussionDetailedComponent} from "./components/discussion-detailed/discussion-detailed.component";
import {DiscussionComponent} from "./components/discussion/discussion.component";
import {CreateDiscussionPostComponent} from './components/create-discussion-post/create-discussion-post.component';
import {DiscussionPostComponent} from './components/discussion-post/discussion-post.component';
import {CreateDiscussionBtnComponent} from "./components/create-discussion-btn/create-discussion-btn.component";
import {CreateDiscussionComponent} from './components/create-discussion/create-discussion.component';
import {MarkdownModule} from "../Markdown/markdown.module";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {PaginatorModule} from "@paginator/paginator.module";
import {UIModule} from "UI";
import {MatDialogModule} from "@angular/material/dialog";
import {EditDiscussionComponent} from "./components/edit-discussion/edit-discussion.component";
import {EditDiscussionPostComponent} from "./components/edit-discussion-post/edit-discussion-post.component";
import {DiscussionForumTypeToken} from "./forum-type.token";
import {ForumType} from "./enums/enums";
import {ForumFacadeService} from "./services/forum-facade.service";
import {ForumModuleBaseUrlToken} from "./forum-module-base-url.token";
import {PopularDiscussionsComponent} from "./components/popular-discussions/popular-discussions.component";
import {PopularTagsComponent} from "./components/popular-tags/popular-tags.component";
import {SidebarComponent} from "./components/sidebar/sidebar.component";
import {PopularCategoriesComponent} from './components/popular-categories/popular-categories.component';
import {MenuSidebarComponent} from './components/menu-sidebar/menu-sidebar.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {SearchDiscussionsComponent} from './components/search-discussions/search-discussions.component';
import {OnEnterDirectiveModule} from "@on-enter/on-enter-directive.module";
import {SearchDiscussionsResolver} from "./resolvers/search-discussions.resolver";
import {BreadcrumbsService} from "./services/breadcrumbs.service";
import {MatMenuModule} from "@angular/material/menu";
import {CategoriesComponent} from './components/categories/categories.component';
import {CategoriesResolver} from "./resolvers/categories.resolver";
import {MatSelectModule} from "@angular/material/select";
import {CreateUpdateDiscussionResolver} from "./resolvers/create-update-discussion.resolver";
import {DiscussionConfiguratorComponent} from './components/discussion-configurator/discussion-configurator.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {SearchDiscussionsFilterComponent} from './components/search-discussions-filter/search-discussions-filter.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {AlertService} from "@alert/services/alert.service";
import {ToasterAlertService} from "@alert/services/toaster-alert.service";
import {CardComponent} from './components/card/card.component';
import {ForumsComponent} from './components/forums/forums.component';
import {EditDiscussionResolver} from "./resolvers/edit-discussion.resolver";
import {LocalizationModule} from "Localization";
import {TranslateModule} from "@ngx-translate/core";
import {CategoryComponent} from './components/category/category.component';
import {CategoriesGridComponent} from './components/categories-grid/categories-grid.component';
import {ForumsPageResolver} from "./resolvers/forums-page.resolver";
import {LandingRoutes} from "../Landing/landing.routes";
import {AppRoutes} from "AppRoutes";
import {SidebarModule} from "../sidebar/sidebar.module";
import {UploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input-config.token";
import {UploadFile} from "@file-uploader/data/UploadFIle";
import {IUploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input.component";
import {LoadingModule} from "ngx-loading";

@NgModule({
    declarations: [
        DiscussionsComponent,
        DiscussionSummaryComponent,
        RootComponent,
        DiscussionDetailedComponent,
        DiscussionComponent,
        CreateDiscussionPostComponent,
        DiscussionPostComponent,
        CreateDiscussionBtnComponent,
        CreateDiscussionComponent,
        EditDiscussionComponent,
        EditDiscussionPostComponent,
        PopularDiscussionsComponent,
        PopularTagsComponent,
        SidebarComponent,
        PopularCategoriesComponent,
        MenuSidebarComponent,
        NavbarComponent,
        SearchDiscussionsComponent,
        CategoriesComponent,
        DiscussionConfiguratorComponent,
        SearchDiscussionsFilterComponent,
        CardComponent,
        ForumsComponent,
        CategoryComponent,
        CategoriesGridComponent
    ],
    imports: [
        CommonModule,
        DiscussionForumRouter,
        ForumSharedModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MarkdownModule,
        UIModule,
        TranslateModule.forRoot(),
        LocalizationModule.forRoot(),
        OnEnterDirectiveModule,

        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        PaginatorModule,
        MatDialogModule,
        MatSelectModule,
        MatSidenavModule,
        MatProgressBarModule,
        SidebarModule,
        LoadingModule
    ],
    entryComponents: [],
    providers: [
        DiscussionForumApiService,
        DiscussionPostsService,
        DiscussionsService,
        DiscussionsResolver,
        EditDiscussionResolver,
        SearchDiscussionsResolver,
        DiscussionDetailedResolver,
        CategoriesResolver,
        CreateUpdateDiscussionResolver,
        ForumsPageResolver,
        ForumFacadeService,
        BreadcrumbsService,

        {
            provide: AlertService,
            useFactory: () => {
                return new ToasterAlertService();
            },
        },

        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'outline'
            }
        },
        {
            provide: ForumModuleBaseUrlToken,
            useValue: `/${AppRoutes.Landing}/${LandingRoutes.Forums}`
        },
        {
            provide: DiscussionForumTypeToken,
            useValue: ForumType.Investor
        },
        // TODO: Try to remove
        {
            provide: UploadFileInputConfig,
            useFactory: (alertService: AlertService) => {
                return {
                    maxSizeMb: 5,
                    maxFileSizeMb: 5,
                    allowedFiles: [], // all files
                    allowMultipleFiles: false,
                    incorrectFileSizeHandler: (file: UploadFile | UploadFile[], maxFileSizeMB: number) => {
                        alertService.warning(`File has incorrect size. Max allowed size: ${maxFileSizeMB} MB`);
                    },
                    incorrectFileTypeHandler: (file: UploadFile | UploadFile[], allowedTypes: string[]) => {
                        alertService.warning(`File has incorrect type. Allowed types: ${allowedTypes.join(', ')}`);
                    }
                } as IUploadFileInputConfig;
            },
            deps: [
                AlertService
            ]
        }
    ]
})
export class DiscussionsForumModule {
}
