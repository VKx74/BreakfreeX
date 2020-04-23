import {Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {EditorComponent} from "ngx-monaco-editor/editor.component";
import {TranslateService} from "@ngx-translate/core";
import {IdeTranslateService} from "../../localization/token";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {IDEConfig, IDEConfigToken} from "../../ide-config";

@Component({
    selector: 'ide',
    templateUrl: './ide.component.html',
    styleUrls: ['./ide.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: IdeTranslateService
        }
    ]
})
export class IdeComponent implements OnInit {
    @Input() options: any;
    @Input() code: string = '';

    @Output() onLoad = new EventEmitter<any>();
    @Output() onChange = new EventEmitter<string>();
    @ViewChild(EditorComponent, {static: false}) editor: EditorComponent;

    loading: boolean = true;

    constructor(@Inject(IDEConfigToken) private _config: IDEConfig) {
    }

    ngOnInit() {
    }

    handleModelChange(code: string) {
        if (code === this.code) {
            return;
        }

        this.code = code;
        this.onChange.emit(this.code);
    }

    handleEditorLoaded(e) {
        this.loading = false;

        this._config.theme$
            .pipe(
                takeUntil(componentDestroyed(this))
            )
            .subscribe((themeName: string) => {
                const editor = (window as any).monaco.editor;

                if (editor) {
                    editor.setTheme(themeName);
                }
            });


        this.onLoad.emit(e);
    }

    ngOnDestroy() {

    }
}
