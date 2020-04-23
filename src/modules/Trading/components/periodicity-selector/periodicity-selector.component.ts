import {Component, forwardRef, Input} from '@angular/core';
import {IPeriodicity} from "../../../../app/models/common/periodicity";
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../../localization/token";
import {SelectorComponent, SelectorTemplate} from "../../../UI/components/selector/selector.component";
import {NG_VALUE_ACCESSOR} from "@angular/forms";
import {JsUtil} from "../../../../utils/jsUtil";


@Component({
    selector: 'periodicity-selector',
    template: SelectorTemplate,
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PeriodicitySelectorComponent),
            multi: true
        }
    ]
})
export class PeriodicitySelectorComponent extends SelectorComponent<IPeriodicity> {
    @Input() selectedOption: IPeriodicity = IPeriodicity.minute;
    @Input() options: IPeriodicity[] = [IPeriodicity.minute, IPeriodicity.hour, IPeriodicity.day];

    constructor(private _translateService: TranslateService) {
        super();
    }

    ngOnInit() {
        this.optionCaption = (periodicity: IPeriodicity) =>
            this._translateService.get(`periodicity.${JsUtil.numericEnumNameByValue(IPeriodicity, periodicity)}`);
    }
}
