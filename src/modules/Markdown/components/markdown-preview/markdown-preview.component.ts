import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MarkdownHelperService} from "../../services/markdown-helper.service";

@Component({
    selector: 'markdown-preview',
    templateUrl: './markdown-preview.component.html',
    styleUrls: ['./markdown-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownPreviewComponent implements OnInit {
    html: string;

    @Input() set markdown(markdown: string) {
        this.html = this._mdHelper.mdToHtml(markdown);
    }

    get markdown() {
        return this.html || '';
    }

    constructor(private _mdHelper: MarkdownHelperService) {}

    ngOnInit() {}
}
