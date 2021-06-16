import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from 'modules/Trading/localization/token';
import { Modal } from "Shared";

export interface SpreadNotificationComponentData {
    spread: number;
}

@Component({
    selector: 'spread-notification',
    templateUrl: './spread-notification.component.html',
    styleUrls: ['./spread-notification.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class SpreadNotificationComponent extends Modal<SpreadNotificationComponentData> implements OnInit {
    
    public get params(): SpreadNotificationComponentData {
        return this.data;
    }

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    accept() {
        this.close(true);
    }

    refuse() {
        this.close(false);
    }
}
