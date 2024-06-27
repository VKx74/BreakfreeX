import {ChangeDetectorRef, Component, Inject, Input, OnInit, Optional, TemplateRef} from '@angular/core';
import {Observable, of} from "rxjs";
import {ProcessState, ProcessStateType} from "@app/helpers/ProcessState";
import {ComponentPreloaderConfigToken} from "./config.token";

export interface IComponentPreloaderConfig {
    getPendingCaption?: () => Observable<string>;
    getErrorCaption?: () => Observable<string>;
}

const defaultConfig: IComponentPreloaderConfig = {
    getPendingCaption: () => {
        return of('Loading...');
    },
    getErrorCaption: () => {
        return of('Failed to load data');
    }
};

@Component({
    selector: 'component-preloader',
    templateUrl: './component-preloader.component.html',
    styleUrls: ['./component-preloader.component.scss']
})
export class ComponentPreloaderComponent implements OnInit {
    private _config: IComponentPreloaderConfig = defaultConfig;
    processState = new ProcessState(ProcessStateType.Pending);

    @Input() set observable(value: Observable<any>) {
        this.handleObservable(value);
    }

    @Input() pendingCaption: string;
    @Input() errorCaption: string;
    @Input() template: TemplateRef<any>;

    constructor(@Inject(ComponentPreloaderConfigToken) @Optional() config: IComponentPreloaderConfig, private ref: ChangeDetectorRef) {
        if (config) {
            this._config = Object.assign({}, this._config, config);
        }
    }

    ngOnInit() {
    }

    getPendingCaption(): Observable<string> {
        return this._config.getPendingCaption();
    }

    getErrorCaption(): Observable<string> {
        return this._config.getErrorCaption();
    }

    handleObservable(observable: Observable<any>) {
        this.processState.setPending();
        observable
            .subscribe({
                next: () => {
                    this.processState.setSucceeded();
                    this.ref.detectChanges();
                },
                error: () => {
                    this.processState.setFailed();
                    this.ref.detectChanges();
                }
            });
    }
}
