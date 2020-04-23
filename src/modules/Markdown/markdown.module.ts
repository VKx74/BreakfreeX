import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MarkdownInputComponent} from "./components/markdown-input/markdown-input.component";
import {MarkdownPreviewComponent} from "./components/markdown-preview/markdown-preview.component";
import {MarkdownHelperService} from "./services/markdown-helper.service";

@NgModule({
    declarations: [
        MarkdownInputComponent,
        MarkdownPreviewComponent,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        MarkdownInputComponent,
        MarkdownPreviewComponent,
    ],
    providers: [
        MarkdownHelperService,
    ]
})
export class MarkdownModule {
}
