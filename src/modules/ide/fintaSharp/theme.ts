/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Fintatech B.V., https://fintatech.com
    Downloading, installing or otherwise using this software or source code shall be made only under Fintatech License agreement. If you do not granted Fintatech License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

import {Theme} from "@app/enums/Theme";

export const IDEThemes = {
    [Theme.Beet]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#21191b"
        }
    },
    [Theme.Dark]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#06060d"
        }
    },
    [Theme.Gray]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#393939"
        }
    },
    [Theme.Light]: {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#edeff2"
        }
    },
    [Theme.Olive]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#212d1b"
        }
    },
    [Theme.Orange]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#17191b"
        }
    },
    [Theme.Purple]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#211925"
        }
    },
    [Theme.Sky]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#171925"
        }
    },
    [Theme.Teal]: {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#003333"
        }
    },
};


export const theme = {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
        "editor.background": "#17191b"
    }
};
