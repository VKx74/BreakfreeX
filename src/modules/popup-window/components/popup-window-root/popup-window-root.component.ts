import {Component, OnInit, ViewChild} from '@angular/core';
import {ThemeService} from "@app/services/theme.service";
import {LocalizationService} from "Localization";
import {GoldenLayoutPopupComponent} from "angular-golden-layout";

@Component({
    selector: 'popup-window-root',
    templateUrl: './popup-window-root.component.html',
    styleUrls: ['./popup-window-root.component.scss']
})
export class PopupWindowRootComponent implements OnInit {
    @ViewChild(GoldenLayoutPopupComponent, {static: false}) layoutPopup: GoldenLayoutPopupComponent;

    constructor(private _themeService: ThemeService,
                private _localizationService: LocalizationService) {

        this._themeService.setupElementCssClasses(document.body);
        this._localizationService.setupMomentLocale(moment);
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {

    }
}
