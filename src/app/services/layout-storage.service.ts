import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from "rxjs/operators";
import { IdentityService } from './auth/identity.service';
import { AppConfigService } from './app.config.service';
import { IGoldenLayoutComponentState } from "angular-golden-layout";
import { ILayoutState } from '@app/models/layout-state';

export class LayoutDto {
    name: string;
    description: string;
    state: any;
}

export class UpdateLayoutDto {
    name: string;
    description: string;
    layoutId: string;
    state: any;
}

export class LayoutResponseDto {
    layoutId: string;
    name: string;
    description: string;
    savedTime: number;
}

@Injectable()
export class LayoutStorageService {
    private _currentDashboardName: string;
    private _currentDashboardLayoutId: string;

    private get _dashboardURL(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}Dashboard`;
    }

    private get _layoutURL(): string {
        return `${AppConfigService.config.apiUrls.userDataStoreREST}Layouts`;
    }

    private get _isGuest(): boolean {
        return this._identity.isGuestMode;
    }

    public lastUpdateTime: number;
    public autoSaveInitialized: boolean;

    public get currentDashboardName(): string {
        return this._currentDashboardName;
    }

    public get currentDashboardId(): string {
        return this._currentDashboardLayoutId;
    }

    constructor(private http: HttpClient,
        private _identity: IdentityService) {
    }

    getDashboard(): Observable<IGoldenLayoutComponentState | ILayoutState> {
        if (this._isGuest) {
            return throwError("");
        }

        return this.http.get<any>(this._dashboardURL).pipe(
            map((data: any) => {
                return JSON.parse(data);
            }));
    }

    createLayout(state: any, name: any, description: string): Observable<LayoutResponseDto> {
        if (this._isGuest) {
            return of(null);
        }

        const data: LayoutDto = {
            state: state,
            description: description,
            name: name
        };

        return this.http.post<LayoutResponseDto>(`${this._layoutURL}`, data)
            .pipe(
                catchError(e => {
                    throw Error(e);
                })
            );
    }

    loadLayouts(): Observable<LayoutResponseDto[]> {
        if (this._isGuest) {
            return of([]);
        }

        return this.http.get<LayoutResponseDto[]>(`${this._layoutURL}/all`)
            .pipe(
                catchError(e => {
                    throw Error(e);
                })
            );
    }

    loadLayout(id: string): Observable<any> {
        if (this._isGuest) {
            return of(null);
        }

        return this.http.get<any>(`${this._layoutURL}?id=${id}`)
            .pipe(
                map((data: any) => {
                    if (!data || !data.state) {
                        return null;
                    }
                    
                    return {
                        ...data,
                        state: JSON.parse(data.state)
                    };
                }),
                catchError(e => {
                    throw Error(e);
                })
            );
    }

    deleteLayout(id: string): Observable<any> {
        if (this._isGuest) {
            return of(null);
        }

        return this.http.delete<any>(`${this._layoutURL}?id=${id}`)
            .pipe(
                catchError(e => {
                    throw Error(e);
                })
            );
    }

    updateActiveLayout(state: ILayoutState): Observable<any> {
        if (this._isGuest) {
            return of(null);
        }

        return this.http.post(`${this._layoutURL}/update-active-layout`, state)
            .pipe(
                catchError(e => {
                    throw Error(e);
                })
            );
    }

    removeDashboard(): Observable<any> {
        if (this._isGuest) {
            return of(null);
        }

        return this.http.delete(this._dashboardURL, {});
    }

    removeUserDashboard(userId: string): Observable<any> {
        if (this._isGuest) {
            return of(null);
        }

        return this.http.delete(`${AppConfigService.config.apiUrls.userDataStoreREST}Dashboard/${userId}`);
    }

    setCurrentDashboard(name: string, id: string) {
        this._currentDashboardName = name;
        this._currentDashboardLayoutId = id;
    }
}
