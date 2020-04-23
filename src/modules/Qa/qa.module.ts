import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RootComponent} from './components/root/root.component';
import {QaRouterModule} from "./qa.router";
import {QATranslateService} from "./localization/token";
import {TranslateServiceFactory} from "Localization";
import {QuestionComponent} from './components/question/question.component';
import {PopularTagsComponent} from './components/popular-tags/popular-tags.component';
import {PopularQuestionsComponent} from './components/popular-questions/popular-questions.component';
import {QuestionDetailedComponent} from './components/question-detailed/question-detailed.component';
import {AskQuestionBtnComponent} from './components/ask-question-btn/ask-question-btn.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {QuestionsComponent} from './components/questions/questions.component';
import {QuestionSummaryComponent} from './components/question-summary/question-summary.component';
import {AnswersComponent} from './components/answers/answers.component';
import {QuestionsService} from "./services/questions.service";
import {QuestionsResolver} from "./resolvers/questions.resolver";
import {QuestionResolver} from "./resolvers/question.resolver";
import {TabsComponent} from './components/tabs/tabs.component';
import {AnswersService} from "./services/answers.service";
import {VoteComponent} from './components/vote/vote.component';
import {QaApiService} from "./services/api.service";
import {PostCommentsComponent} from './components/post-comments/post-comments.component';
import {CommentsService} from "./services/comments.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "Shared";
import {AskQuestionComponent} from './components/ask-question/ask-question.component';
import {ForumSharedModule} from "../ForumShared/forum-shared.module";
import {AnswerInputComponent} from './components/answer-input/answer-input.component';
import {LandingRoutes} from "../Landing/landing.routes";
import {AppRoutes} from "AppRoutes";
import {QaModuleBasePath} from "./BasePath";
import {QaHelperService} from "./services/qa-helper.service";
import {PostCommentComponent} from './components/post-comment/post-comment.component';
import {CommentInputComponent} from './components/comment-input/comment-input.component';
import {PostComponent} from './components/post/post.component';
import {QuestionPostComponent} from './components/question-post/question-post.component';
import {AnswerPostComponent} from './components/answer-post/answer-post.component';
import {EditQuestionComponent} from './components/edit-question/edit-question.component';
import {QuestionFormComponent} from './components/question-form/question-form.component';
import {EditQuestionResolver} from "./resolvers/edit-question.resolver";
import {MarkdownModule} from "../Markdown/markdown.module";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {PaginatorModule} from "@paginator/paginator.module";
import {TagsInputModule} from "@tagsInput/tags-input.module";
import {MatDialogModule} from "@angular/material/dialog";
import {UIModule} from "UI";
import {MatTabsModule} from "@angular/material/tabs";
import {UploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input-config.token";
import {AlertService} from "@alert/services/alert.service";
import {UploadFile} from "@file-uploader/data/UploadFIle";
import {IUploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input.component";

@NgModule({
    declarations: [
        RootComponent,
        QuestionComponent,
        PopularTagsComponent,
        PopularQuestionsComponent,
        QuestionDetailedComponent,
        AskQuestionBtnComponent,
        SidebarComponent,
        QuestionsComponent,
        QuestionSummaryComponent,
        AnswersComponent,
        TabsComponent,
        VoteComponent,
        PostCommentsComponent,
        AskQuestionComponent,
        AnswerInputComponent,
        PostCommentComponent,
        CommentInputComponent,
        PostComponent,
        QuestionPostComponent,
        AnswerPostComponent,
        EditQuestionComponent,
        QuestionFormComponent,
        PopularTagsComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        QaRouterModule,
        SharedModule,
        ForumSharedModule,

        MarkdownModule,
        PaginatorModule,
        MatDialogModule,
        UIModule,

        MatFormFieldModule,
        MatInputModule,
        TagsInputModule,
        MatTabsModule,
    ],
    entryComponents: [],
    exports: [
        SidebarComponent
    ],
    providers: [
        QaApiService,
        QuestionsService,
        QuestionsResolver,
        QuestionResolver,
        EditQuestionResolver,
        AnswersService,
        CommentsService,
        QaHelperService,
        {
            provide: QATranslateService,
            useFactory: TranslateServiceFactory('qa'),
            deps: [Injector]
        },
        {
            provide: QaModuleBasePath,
            useValue: `/${AppRoutes.Landing}/${LandingRoutes.QA}`
        },
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
export class QaModule {
}
