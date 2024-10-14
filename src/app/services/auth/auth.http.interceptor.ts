/*
    IMPORTANT NOTICE:  This software and source code is owned and licensed by Breakfree, https://breakfree.cc
    Downloading, installing or otherwise using this software or source code shall be made only under Breakfree License agreement. If you do not granted Breakfree License agreement, you must promptly delete the software, source code and all associated downloadable materials and you must not use the software for any purpose whatsoever.
*/

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {IdentityService} from "./identity.service";
import {AuthenticationService} from "./auth.service";
import {mergeMap} from 'rxjs/operators';
import {AppConfigService} from "../app.config.service";
import {AuthInterceptorSkipHeader} from "./constants";

/**
 *@description Class provides the interceptor to inject user token to each request
 *
 * @export
 * @class HttpInterceptorService
 * @implements {HttpInterceptor}
 */
@Injectable()
export class AuthHttpInterceptorService implements HttpInterceptor {
    // #region Constructors (1)

    constructor(private _identity: IdentityService, private _auth: AuthenticationService) {
    }

    // #endregion

    // #region Public Methods (1)

    /**
     * @description Method injects user token to request
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     * @memberof HttpInterceptorService
     */
    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers.has(AuthInterceptorSkipHeader)) {
            const clone = req.clone({
                headers: req.headers.delete(AuthInterceptorSkipHeader)
            });

            return next.handle(clone);

        }

        const urls = AppConfigService.config.endpointsBearerAuthRequired;
        let authNeeded = false;
        for (let i = 0; i < urls.length; i++) {
            if (req.url.startsWith(urls[i])) {
                authNeeded = true;
                break;
            }
        }

        // let contentType = req.headers.get('content-type') || "application/json";

        const headers = {
            // 'Content-Type': contentType,
            // 'Accept': 'application/json'
        };

        if (authNeeded && this._identity.isAuthorized) {
            headers['apiKey'] = AppConfigService.config.apiKey;

            if (this._identity.id) {
                headers['userid'] = this._identity.id;
            }

            if (this._identity.token) {
                headers['Authorization'] = 'Bearer ' + this._identity.token;
            }
        }

        const request = req.clone({
            setHeaders: headers
        });

        const self = this;

        if (this._identity.isAuthorized && this._identity.isExpired) {
            return this._identity.refreshTokens()
                .pipe(mergeMap((resp) => {
                    if (self._identity.isAuthorized) {
                        return next.handle(request);
                    } else {
                        return next.handle(req);
                    }
                }));
        } else {
            return next.handle(request);
        }
    }

    // #endregion
}
