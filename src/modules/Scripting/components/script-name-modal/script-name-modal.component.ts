import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {Observable} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {finalize} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {ScriptsTranslateService} from "@scripting/localization/token";

export enum ScriptNameModalMode {
    Create,
    Rename
}

export type ScriptNameModalSubmitHandler = (scriptName: string, modal: ScriptNameModalComponent) => Observable<any>;

export interface IScriptNameModalConfig {
    mode: ScriptNameModalMode;
    submitHandler: ScriptNameModalSubmitHandler;
    scriptName?: string;
}

@Component({
    selector: 'script-name-modal',
    templateUrl: './script-name-modal.component.html',
    styleUrls: ['./script-name-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ScriptsTranslateService
        }
    ]
})
export class ScriptNameModalComponent extends Modal<IScriptNameModalConfig> {
    Modes = ScriptNameModalMode;
    formGroup: FormGroup;
    processing: boolean;

    get mode() {
        return this.data.mode;
    }

    get submitHandler() {
        return this.data.submitHandler;
    }

    constructor(_injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            scriptName: new FormControl(this.data.scriptName || '', [Validators.required])
        });
    }

    submit() {
        if (this.formGroup.invalid) {
            return;
        }

        this.processing = true;
        this.submitHandler(this.formGroup.controls['scriptName'].value, this)
            .pipe(finalize(() => this.processing = false))
            .subscribe();
    }

}
