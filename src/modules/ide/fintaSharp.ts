/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Fintatech B.V., https://fintatech.com
    Downloading, installing or otherwise using this software or source code shall be made only under Fintatech License agreement. If you do not granted Fintatech License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/
import {monarchTokens} from "./fintaSharp/monarchTokens";
import {completionItem} from "./fintaSharp/completionItem";
import {conf} from "./fintaSharp/languageConfig";
import {signatureHelp} from "./fintaSharp/signatureHelp";
import {theme} from "./fintaSharp/theme";

export module fintaSharp {
    export const MONARCH_TOKENS = monarchTokens;
    export const COMPLETION_ITEM = completionItem;
    export const LANGUAGE_CONFIGURATION = conf;
    export const SIGNATURE_HELP = signatureHelp;
    export const THEME = theme;
}
