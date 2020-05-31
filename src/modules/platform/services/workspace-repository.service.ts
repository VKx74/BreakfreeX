import {Injectable} from "@angular/core";
import {forkJoin, Observable, ReplaySubject} from "rxjs";
import {Workspace} from "@platform/data/workspaces";
import {HttpClient} from "@angular/common/http";
import {AuthInterceptorSkipHeader} from "@app/services/auth/constants";
import {map, tap} from "rxjs/operators";
import {ProcessState, ProcessStateType} from "@app/helpers/ProcessState";
import {DefaultUserTags} from "@app/enums/DefaultUserTags";

export enum WorkspaceIds {
    BasicUser = 'basic-user',
    AdvancedUser = 'advanced-user',
    AdvancedTrader = 'advanced-trader',
    Institutional = 'institutional',
    Empty = 'empty'
}

export const WorkspacesRootPath = './assets/workspaces';

const WorkspacesPaths = [
    `${WorkspacesRootPath}/basic-user.json`,
    `${WorkspacesRootPath}/advanced-trader.json`,
    `${WorkspacesRootPath}/institutional.json`,
    `${WorkspacesRootPath}/advanced-user.json`,
    `${WorkspacesRootPath}/empty.json`
];



@Injectable()
export class WorkspaceRepository {
    loadWorkspacesState = new ProcessState(ProcessStateType.None);
    workspaces$ = new ReplaySubject<Workspace[]>(1);

    constructor(private _http: HttpClient) {
    }

    loadWorkspaces(): Observable<Workspace[]> {
        if (this.loadWorkspacesState.isNone()) {
            this.loadWorkspacesState.setPending();

            return forkJoin(
                WorkspacesPaths.map((path: string) => {
                    return this._http.get<Workspace>(path, {headers: {[AuthInterceptorSkipHeader]: ''}});
                })
            ).pipe(
                tap({
                    next: (workspaces: Workspace[]) => {
                        this.workspaces$.next(workspaces);
                        this.loadWorkspacesState.setSucceeded();
                    },
                    error: (e) => {
                        this.loadWorkspacesState.setFailed();
                        this.workspaces$.error(e);
                    }
                })
            );
        }

        return this.workspaces$.asObservable() as Observable<Workspace[]>;
    }

    getDefaultWorkspaceByUserTags(userTags: string[]): Observable<Workspace> {
        return this.loadWorkspaces()
            .pipe(
                map((workspaces: Workspace[]) => {
                    return this._getWorkspaceByUserTags(userTags, workspaces);
                })
            );
    }

    private _getWorkspaceByUserTags(userTags: string[], workspaces: Workspace[]): Workspace {
        if (userTags.includes(DefaultUserTags.Business)) {
            return workspaces.find(w => w.id === WorkspaceIds.AdvancedTrader);
        }

        if (userTags.includes(DefaultUserTags.AdvancedUser)) {
            return workspaces.find(w => w.id === WorkspaceIds.AdvancedUser);
        }

        if (userTags.includes(DefaultUserTags.Investor)) {
            return workspaces.find(w => w.id === WorkspaceIds.Institutional);
        }

        if (userTags.includes(DefaultUserTags.BasicUser)) {
            return workspaces.find(w => w.id === WorkspaceIds.BasicUser);
        }

        return workspaces.find(w => w.id === WorkspaceIds.Empty);
    }
}
