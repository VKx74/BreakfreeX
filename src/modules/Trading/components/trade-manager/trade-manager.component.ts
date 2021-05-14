import {Component, OnDestroy} from "@angular/core";
import {TradingTranslateService} from "../../localization/token";
import {TranslateService} from "@ngx-translate/core";
import {LocalizationService} from "Localization";
import {TimeZone, TimeZoneManager, TzUtils, UTCTimeZone} from "TimeZones";
import {interval, Observable} from "rxjs";
import {map, switchMap, takeUntil, tap} from "rxjs/operators";
import {JsUtil} from "../../../../utils/jsUtil";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {BrokerService} from "@app/services/broker.service";
// @ts-ignore
import moment = require('moment');
import {ToggleBottomPanelSizeService} from "@platform/components/dashboard/toggle-bottom-panel-size.service";
import {EventsHelper} from "@app/helpers/events.helper";
import { EBrokerInstance } from '@app/interfaces/broker/broker';
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
    EBrokerInstance = EBrokerInstance;
    readonly openBottomPanel = 150;
    readonly openBottomPanelHeight = 250;
    readonly minimizeBottomPanel = 26;

    get instanceType() {
        const broker = this._brokerService.activeBroker;
        return broker ? broker.instanceType : null;
    }

    get isOpen () {
        return this._bottomPanelSizeService.sizeBottomPanel() >= this.openBottomPanel;
    }

    get isMinimized() {
        return this._bottomPanelSizeService.sizeBottomPanel() < this.openBottomPanel;
    }

    get isGuest(): boolean {
        return this._brokerService.isGuest;
    }

    constructor(private _timeZoneManager: TimeZoneManager,
                private _brokerService: BrokerService,
                private _tzUtils: TzUtils,
                private _bottomPanelSizeService: ToggleBottomPanelSizeService,
                ) {
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
