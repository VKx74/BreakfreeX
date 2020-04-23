import {Component} from '@angular/core';
import {UITranslateService} from "../../localization/token";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'coming-soon',
    template: `
        <div class="coming-soon">
            <span translate="comingSoon"></span>
        </div>
    `,
    styleUrls: ['coming-soon.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: UITranslateService
        }
    ]
})
export class ComingSoonComponent {
}
