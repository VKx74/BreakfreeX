import {Component, Inject, OnDestroy, Optional, Input} from "@angular/core";
import {TradingTranslateService} from "../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {LocalizationService} from "Localization";
import {ApplicationType} from "@app/enums/ApplicationType";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {TimeZone, TimeZoneManager, TzUtils, UTCTimeZone} from "TimeZones";
import {combineLatest, interval, Observable} from "rxjs";
import {map, switchMap, takeUntil, tap} from "rxjs/operators";
import {JsUtil} from "../../../../utils/jsUtil";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {BrokerService} from "@app/services/broker.service";
// @ts-ignore
import moment = require('moment');
import {IOutputAreaSizes} from "angular-split";
import {ToggleBottomPanelSizeService} from "@platform/components/dashboard/toggle-bottom-panel-size.service";
import {EventsHelper} from "@app/helpers/events.helper";
@Component({
    selector: 'trade-manager',
    templateUrl: 'trade-manager.component.html',
    styleUrls: ['trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class TradeManagerComponent implements OnDestroy {
    date: string;
    activeBroker$ = this._brokerService.activeBroker$;
    brokerInitialized$ = this._brokerService.brokerInitializationState$;
    applicationType$ = this._applicationTypeService.applicationTypeChanged;
    ApplicationType = ApplicationType;
    readonly openBottomPanel = 150;
    readonly openBottomPanelHeight = 250;
    readonly minimizeBottomPanel = 26;

    get isOpen () {
        return this._bottomPanelSizeService.sizeBottomPanel() >= this.openBottomPanel;
    }

    get isMinimized() {
        return this._bottomPanelSizeService.sizeBottomPanel() < this.openBottomPanel;
    }

    constructor(private _localizationService: LocalizationService,
                private _applicationTypeService: ApplicationTypeService,
                private _timeZoneManager: TimeZoneManager,
                private _brokerService: BrokerService,
                private _tzUtils: TzUtils,
                private _translateService: TranslateService,
                private _bottomPanelSizeService: ToggleBottomPanelSizeService,
                ) {

        // if (this._goldenLayoutItemComponent) {
        //     this._goldenLayoutItemComponent.setTitle(
        //         this._translateService.get('tradeManagerComponentName')
        //     );
        // }
    }

    ngOnInit() {
        interval(500)
            .pipe(
                switchMap(() => {
                    return this._formatDate(this._timeZoneManager.timeZone);
                }),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((formattedDate: string) => {
                this.date = formattedDate;
            });
    }

    ngOnDestroy(): void {
    }

    minimize() {
       this._bottomPanelSizeService.setBottomPanelSize(this.minimizeBottomPanel);
       EventsHelper.triggerWindowResize();
    }

    open() {
        this._bottomPanelSizeService.setBottomPanelSize(this.openBottomPanelHeight);
        EventsHelper.triggerWindowResize();
    }


    private _formatDate(timeZone: TimeZone): Observable<string> {
        return this._tzUtils.getTimeZoneCaption(timeZone, false)
            .pipe(
                map((timeZoneCaption: string) => {
                    const mDate = moment(TzUtils.convertDateTz(JsUtil.UTCDate(new Date()), UTCTimeZone, timeZone));
                    const dateTime = mDate.format('DD/MM/YYYY HH:mm:ss');

                    return `${dateTime} (${timeZoneCaption})`;
                })
            );
    }
}
