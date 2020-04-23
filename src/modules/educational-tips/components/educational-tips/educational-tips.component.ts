import {Component, Input} from '@angular/core';
import {EducationalTipsService} from "@app/services/educational-tips.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {TranslateService} from "@ngx-translate/core";
import {SharedTranslateService} from "@app/localization/shared.token";

@Component({
    selector: 'educational-tips',
    templateUrl: './educational-tips.component.html',
    styleUrls: ['./educational-tips.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SharedTranslateService
        }
    ]
})
export class EducationalTipsComponent {
    showTips: boolean = false;
    link: string;

    @Input() componentName: ComponentIdentifier;
    @Input() alwaysShow?: boolean = false;

    constructor(private _tipsService: EducationalTipsService) {
    }

    ngOnInit() {
        if (this.alwaysShow) {
            this.showTips = true;
        } else {
            this.showTips = this._tipsService.isTipsShown();
            this._tipsService.showTipsChange$
                .subscribe((value) => {
                    this.showTips = value;
                });
        }
        this._tipsService.getLinkForComponent(this.componentName)
            .subscribe(link => {
                this.link = link;
            }, e => {
                this.showTips = false;
                console.log(e);
            });
    }

}
