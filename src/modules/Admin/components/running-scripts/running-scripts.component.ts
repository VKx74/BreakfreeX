import {Component, OnInit} from '@angular/core';
import {RunningMetadata} from "@scripting/models/IScriptCloudRepositoryService";
import {Observable, of} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {switchMap, takeUntil, tap} from "rxjs/operators";
import {concat} from "@decorators/concat";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {AlertService} from "@alert/services/alert.service";
import {ScriptingApiService} from "@scripting/services/scripting-api.service";
import {ConfirmModalComponent, IConfirmModalConfig} from "UI";
import {MatDialog} from "@angular/material/dialog";
import {IdentityService} from "@app/services/auth/identity.service";

@Component({
    selector: 'running-scripts',
    templateUrl: './running-scripts.component.html',
    styleUrls: ['./running-scripts.component.scss']
})
export class RunningScriptsComponent implements OnInit {
    runningScripts: RunningMetadata[] = [];

    constructor(private _route: ActivatedRoute,
                private _scriptingApiService: ScriptingApiService,
                private _dialog: MatDialog,
                private _i: IdentityService,
                private _alertService: AlertService) {
    }

    ngOnInit() {
        (this._route.snapshot.data['runningScripts'] as Observable<RunningMetadata[]>)
            .subscribe({
                next: (data: RunningMetadata[]) => {
                    this.runningScripts = data;
                }
            });
    }

    openConfirmDialog(script: RunningMetadata) {
        this._dialog.open<IConfirmModalConfig>(ConfirmModalComponent, {
            data: {
                onConfirm: () => this._scriptingApiService.stopScript(script.runningId, script.userId)
                    .subscribe((res) => {
                        this.runningScripts = this.runningScripts.filter(s => s.runningId !== res.runningId);
                    }, (e) => {
                        console.error(e);
                        this._alertService.error('Failed to stop script');
                    })
            }
        });
    }

    ngOnDestroy() {

    }
}
