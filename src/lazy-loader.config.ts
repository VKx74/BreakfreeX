import {IScript} from "@app/services/file-lazy-loader.service";

export const LazyLoaderConfig = {
    Markdown: {
        scripts: [
            {
                src: 'libs/pagedown/Markdown.Converter.js'
            },
            {
                src: 'libs/pagedown/Markdown.Editor.Custom.js'
            },
            {
                src: 'libs/pagedown/Markdown.Sanitizer.js'
            }
        ] as IScript[]
    }
};