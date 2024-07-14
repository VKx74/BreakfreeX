import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";
import { TradingDirection } from '@app/services/algo.service';

@Component({
    selector: 'trading-direction-input-modal',
    templateUrl: './trading-direction-input-modal.component.html',
    styleUrls: ['./trading-direction-input-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class TradingDirectionModalComponent extends Modal implements OnInit {

    constructor(private _translateService: TranslateService,
                injector: Injector) {
        super(injector);
    }

    public ngOnInit() {
    }

    public reject() {
        this.close();
    }

    public short() {
        this.close(TradingDirection.Short);
    }

    public long() {
        this.close(TradingDirection.Long);
    }

    public auto() {
        this.close(TradingDirection.Auto);
    }
}
