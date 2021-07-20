import {Component, Injector, OnInit} from '@angular/core';
import {AbstractControlOptions, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Modal} from "Shared";
import {forkJoin, Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {JsUtil} from "../../../../utils/jsUtil";
import {PlatformTranslateService} from "../../localization/token";

export interface ILayoutNameModalConfig {
    value?: string | number;
    isSave: boolean;
}

@Component({
    selector: 'layout-name-modal',
    templateUrl: './layout-name.component.html',
    styleUrls: ['./layout-name.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: PlatformTranslateService
        }
    ]
})
export class LayoutNameModalComponent extends Modal<ILayoutNameModalConfig> implements OnInit {
    public formGroup: FormGroup;

    public get isSave(): boolean {
        return this.data.isSave;
    }

    constructor(private _translateService: TranslateService,
                injector: Injector) {
        super(injector);
    }

    public ngOnInit() {
        this.formGroup = new FormGroup({
            value: new FormControl(this.data.value || '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]),
        });
    }

    public reject() {
        this.close();
    }

    public enterValue() {
        if (this.formGroup.valid) {
            this.close(this.formGroup.value.value);
        }
    }
}
