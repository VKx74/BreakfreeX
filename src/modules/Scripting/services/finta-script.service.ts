/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Breakfree, https://breakfree.cc
    Downloading, installing or otherwise using this software or source code shall be made only under Breakfree License agreement. If you do not granted Breakfree License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {CompileScriptDTO} from "../models/dtos";
import {AppConfigService} from "../../../app/services/app.config.service";

/**
 *@description Class provides the wrapper above Finta Script API
 *
 * @export
 * @class FintaScriptService
 */
@Injectable()
export class FintaScriptService {
    constructor(private _http: HttpClient) {
    }

    // #endregion
}
