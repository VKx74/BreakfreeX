import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {UITranslateService} from "../../localization/token";

@Component({
    selector: 'pin-input-modal',
    templateUrl: './pin-input-modal.component.html',
    styleUrls: ['./pin-input-modal.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class PinInputModalComponent extends Modal {
    constructor(_injector: Injector) {
        super(_injector);
    }

    ngOnInit() {
    }

    submit(pin: string) {
        this.close(pin);
    }
}
