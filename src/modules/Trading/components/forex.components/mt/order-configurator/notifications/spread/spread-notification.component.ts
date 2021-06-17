import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from 'modules/Storage/services/local-storage.service';
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
    public saveDecision: boolean = false;
    
    public get params(): SpreadNotificationComponentData {
        return this.data;
    }

    constructor(injector: Injector, private localStorageService: LocalStorageService) {
        super(injector);
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    accept() {
        this.close(true);
        this._trySaveDecision(true);
    }

    refuse() {
        this.close(false);
        this._trySaveDecision(false);
    }

    private _trySaveDecision(decision: boolean) {
        if (this.saveDecision) {
            this.localStorageService.set(LocalStorageService.IsSpreadAutoProcessing, decision);
        }
    }
}
