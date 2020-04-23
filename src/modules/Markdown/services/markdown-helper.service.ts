import {Injectable} from "@angular/core";

declare let Markdown: any;

@Injectable()
export class MarkdownHelperService {
    mdToHtml(markdown: string): string {
        const converter = Markdown.getSanitizingConverter();
        return converter.makeHtml(markdown);
    }
}
