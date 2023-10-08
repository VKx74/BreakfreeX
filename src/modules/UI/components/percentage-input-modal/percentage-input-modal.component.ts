import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";

export interface IPercentageInputModalConfig {
    value?: number;
    title?: string;
    inputCaption?: string;
    inputPlaceholder?: string;
}

@Component({
    selector: 'percentage-input-modal',
    templateUrl: './percentage-input-modal.component.html',
    styleUrls: ['./percentage-input-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class PercentageInputModalComponent extends Modal<IPercentageInputModalConfig> implements OnInit {
    public value?: number;
    public title?: string;
    public inputCaption?: string;
    public inputPlaceholder?: string;

    constructor(private _translateService: TranslateService,
                injector: Injector) {
        super(injector);
    }

    public ngOnInit() {
        const data = Object.assign({}, this.data);
        this.value = data.value;
        this.title = data.title;
        this.inputCaption = data.inputCaption;
        this.inputPlaceholder = data.inputPlaceholder;
    }

    public reject() {
        this.close();
    }

    public enterValue() {
        this.close(this.value);
    }

    public resetAuto() {
        this.close(-1);
    }
}
