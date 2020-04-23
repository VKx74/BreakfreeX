/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Fintatech B.V., https://fintatech.com
    Downloading, installing or otherwise using this software or source code shall be made only under Fintatech License agreement. If you do not granted Fintatech License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;

export const conf: IRichLanguageConfiguration = {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

    comments: {
        lineComment: '#',
    },

    brackets: [
        ['{', '}'],
        ['(', ')']
    ],

    // onEnterRules: [
    //     // {
    //     //     // e.g. /** | */
    //     //     beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
    //     //     afterText: /^\s*\*\/$/,
    //     //     action: { indentAction: _monaco.languages.IndentAction.IndentOutdent, appendText: ' * ' }
    //     // },
    //     // {
    //     //     // e.g. /** ...|
    //     //     beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
    //     //     action: { indentAction: _monaco.languages.IndentAction.None, appendText: ' * ' }
    //     // },
    //     // {
    //     //     // e.g.  * ...|
    //     //     beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
    //     //     action: { indentAction: _monaco.languages.IndentAction.None, appendText: '* ' }
    //     // },
    //     // {
    //     //     // e.g.  */|
    //     //     beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
    //     //     action: { indentAction: _monaco.languages.IndentAction.None, removeText: 1 }
    //     // }
    // ],

    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string'] },
    ],
};
