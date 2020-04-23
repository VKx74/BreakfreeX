import {RouterModule, Routes, RunGuardsAndResolvers} from "@angular/router";
import {RootComponent} from "./components/root/root.component";
import {QaRoutes} from "./qa.routes";
import {NgModule} from "@angular/core";
import {QuestionsComponent} from "./components/questions/questions.component";
import {QuestionDetailedComponent} from "./components/question-detailed/question-detailed.component";
import {QuestionsResolver} from "./resolvers/questions.resolver";
import {QuestionResolver} from "./resolvers/question.resolver";
import {AskQuestionComponent} from "./components/ask-question/ask-question.component";
import {MarkdownInputResolver} from "../../app/resolvers/markdown-input.resolver";
import {EditQuestionComponent} from "./components/edit-question/edit-question.component";
import {EditQuestionResolver} from "./resolvers/edit-question.resolver";

const routes: Routes = [
    {
        path: '',
        component: RootComponent,
        resolve: {
            assets: MarkdownInputResolver
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: QaRoutes.Questions
            },
            {
                path: QaRoutes.AskQuestion,
                component: AskQuestionComponent,
            },
            {
                path: QaRoutes.EditQuestion,
                component: EditQuestionComponent,
                resolve: {
                    question: EditQuestionResolver
                }
            },
            {
                path: QaRoutes.Question,
                component: QuestionDetailedComponent,
                data: {
                    reuse: false
                },
                resolve: {
                    question: QuestionResolver
                }
            },
            {
                path: QaRoutes.Questions,
                component: QuestionsComponent,
                resolve: {
                    questions: QuestionsResolver
                },
                data: {
                    reuse: false
                },
                runGuardsAndResolvers: 'paramsOrQueryParamsChange'
            }
        ]
    },
    {
        path: '',
        redirectTo: QaRoutes.Dashboard,
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class QaRouterModule {
}
