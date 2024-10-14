/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Breakfree, https://breakfree.cc
    Downloading, installing or otherwise using this software or source code shall be made only under Breakfree License agreement. If you do not granted Breakfree License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/
import {monarchTokens} from './fintaScript/monarchTokens';
import {completionItem} from './fintaScript/completionItem';
import {conf} from './fintaScript/languageConfig';
import {signatureHelp} from './fintaScript/signatureHelp';

export module fintaScript {
    export const MONARCH_TOKENS = monarchTokens;
    export const COMPLETION_ITEM = completionItem;
    export const LANGUAGE_CONFIGURATION = conf;
    export const SIGNATURE_HELP = signatureHelp;
}
