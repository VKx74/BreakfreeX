import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from 'modules/Trading/localization/token';
import { Modal } from "Shared";

export interface InfoNotificationComponentData {
    title: string;
    data: string;
}

@Component({
    selector: 'info-notification',
    templateUrl: './info-notification.component.html',
    styleUrls: ['./info-notification.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class InfoNotificationComponent extends Modal<InfoNotificationComponentData> implements OnInit {
    
    public get params(): InfoNotificationComponentData {
        return this.data;
    }

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    hide() {
        this.close();
    }
}
