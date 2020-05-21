import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {PlatformTranslateService} from "@platform/localization/token";
import {ProcessState} from "@app/helpers/ProcessState";
import {Workspace} from "@platform/data/workspaces";
import {WorkspaceIds, WorkspaceRepository} from "@platform/services/workspace-repository.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {LayoutStorageService} from "@app/services/layout-storage.service";
import {Subscription} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {AlertService} from "@alert/services/alert.service";
import {GoldenLayoutComponent, LayoutManagerService} from "angular-golden-layout";

@Component({
    selector: 'workspaces',
    templateUrl: './workspaces.component.html',
    styleUrls: ['./workspaces.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        },
        LayoutStorageService
    ]
})
export class WorkspacesComponent implements OnInit, OnDestroy {
    private _saveLayout = true;
    private _workspacesSubscription: Subscription;
    private _intervalLink: any;
    private _updateInterval = 1000 * 60 * 2;
    WorkspaceIds = WorkspaceIds;
    workspaces: Workspace[];
    layout: GoldenLayoutComponent;

    get loadWorkspacesProcessState(): ProcessState {
        return this._workspaceRepository.loadWorkspacesState;
    }

    private _layoutStateChanged: boolean = false;

    get layoutChanged() {
        // return this._layoutManager.layout;
        return this._layoutStateChanged;
    }

    constructor(private _layoutManager: LayoutManagerService,
                private _identityService: IdentityService,
                private _alertManager: AlertService,
                private _layoutStorageService: LayoutStorageService,
                private _workspaceRepository: WorkspaceRepository,
                private _translateService: TranslateService
                ) {
    }

    ngOnInit() {
        this.layout = this._layoutManager.layout;
        this._workspacesSubscription = this._workspaceRepository.loadWorkspaces()
            .subscribe({
                next: (workspaces: Workspace[]) => {
                    this.workspaces = workspaces;
                },
                error: (e) => {
                    console.error(e);
                }
            });

        this.layout.$stateChanged
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe(() => {
                this._layoutStateChanged = true;
            });

        
        this._intervalLink = setInterval(this.autoSave.bind(this), this._updateInterval);       
    }

    ngOnDestroy() {
        if (this._workspacesSubscription) {
            this._workspacesSubscription.unsubscribe();
        }

        if (this._intervalLink) {
            clearInterval(this._intervalLink);
        }
    }

    applyWorkspace(workspace: Workspace) {
        this._layoutManager.loadState(workspace.layoutState, true);
    }

    saveLayout() {
        if (this._identityService.isAuthorized && this._saveLayout) {
            const layoutState = this.layout.saveState();
            this._layoutStorageService.saveLayoutState(layoutState, true)
                .subscribe(
                    (data) => {
                        this._layoutStateChanged = false;
                        this._alertManager.success(this._translateService.get("workspaceNames.savedLayout"));
                    });
        }
    }
    
    autoSave() {
        if (this._identityService.isAuthorized && this._saveLayout) {
            const layoutState = this.layout.saveState();
            this._layoutStorageService.saveLayoutState(layoutState, true).subscribe((data) => { this._layoutStateChanged = false; });
        }
    }
}
