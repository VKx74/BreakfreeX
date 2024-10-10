/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Breakfree, https://breakfree.cc
    Downloading, installing or otherwise using this software or source code shall be made only under Breakfree License agreement. If you do not granted Breakfree License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

import {NgxMonacoEditorConfig} from 'ngx-monaco-editor';
import {fintaSharp} from './fintaSharp';
import {IDEThemes} from "./fintaSharp/theme";

export module monacoConfig {
    export const BreakfreeConfig: NgxMonacoEditorConfig = {
        baseUrl: './assets',
        onMonacoLoad: () => {
            monaco.languages.register({ id: 'fintaSharp' });
            monaco.languages.setLanguageConfiguration('fintaSharp', fintaSharp.LANGUAGE_CONFIGURATION);

            (<any>window).monaco.languages.setMonarchTokensProvider('fintaSharp', fintaSharp.MONARCH_TOKENS);

            // (<any>window).monaco.languages.registerSignatureHelpProvider('fintaSharp', fintaSharp.SIGNATURE_HELP);


            defineThemes(monaco.editor, IDEThemes);

            // (<any>window).monaco.editor.defineTheme('myCoolTheme', fintaSharp.THEME);

            (<any>window).monaco.languages.registerCompletionItemProvider('fintaSharp', fintaSharp.COMPLETION_ITEM);
        }


    };

    function defineThemes(editor, themes) {
        for (let themeName in themes) {
            editor.defineTheme(themeName, themes[themeName]);
        }
    }
}
