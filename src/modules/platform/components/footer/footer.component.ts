import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TimeZone, TimeZoneManager, TzUtils, UTCTimeZone} from "TimeZones";
import {interval, Observable} from "rxjs";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {BrokerService} from "@app/services/broker.service";
import {JsUtil} from "../../../../utils/jsUtil";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {select, Store} from "@ngrx/store";
import {BottomPanelComponentGroups, BottomPanelComponents} from "@platform/data/enums";
import {activeBottomComponent} from "@platform/store/selectors";
import {bottomPanelComponentGroup, defaultBottomPanelGroupComponent} from "@platform/data/functions";
import {SelectBottomComponentAction} from "@platform/store/actions/platform.actions";
import {AppState} from "@app/store/reducer";
import {ComponentIdentifier} from "@app/models/app-config";
import {PlatformTranslateService} from "@platform/localization/token";


@Component({
    selector: 'footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    providers: [{
        provide: TranslateService, useExisting: PlatformTranslateService
    }]
})
export class FooterComponent implements OnInit {
    BottomPanelComponentGroups = BottomPanelComponentGroups;
    ComponentIdentifier = ComponentIdentifier;
    activeComponent: BottomPanelComponents;
    date: string;

    @Input() set needSave(value: boolean) {
        this.notSaved = value;
    }
    @Output() saveLayoutE: EventEmitter<void> = new EventEmitter();

    get appTypeCaption(): Observable<string> {
        return this._translateService.get(`footer.${this._applicationTypeService.applicationType}`);
    }

    get username(): string {
        return this._brokerService.userInfo ?
            this._brokerService.userInfo.username : 'Not connected';
    }

    get exchange(): string {
        return this._brokerService.activeBroker ?
            this._brokerService.activeBroker.instanceType : 'Not connected';
    }

    get isBrokerConnected(): boolean {
        return this._brokerService.isConnected;
    }

    notSaved: boolean = false;

    constructor(private _store: Store<AppState>,
        private _timeZoneManager: TimeZoneManager,
        private _translateService: TranslateService,
        private _applicationTypeService: ApplicationTypeService,
        private _brokerService: BrokerService,
        private _tzUtils: TzUtils) {
    }

    ngOnInit() {
        this._store.pipe(
            select(activeBottomComponent),
            takeUntil(componentDestroyed(this))
        ).subscribe((component: BottomPanelComponents) => {
            this.activeComponent = component;
        });

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

    isScriptingActive(): boolean {
        return this.activeComponent != null
            && bottomPanelComponentGroup(this.activeComponent) === BottomPanelComponentGroups.Scripting;
    }

    isTradingActive(): boolean {
        return this.activeComponent != null
            && bottomPanelComponentGroup(this.activeComponent) === BottomPanelComponentGroups.Trading;
    }

    isBacktestingActive(): boolean {
        return this.activeComponent != null
            && bottomPanelComponentGroup(this.activeComponent) === BottomPanelComponentGroups.Backtest;
    }

    selectComponentGroup(group: BottomPanelComponentGroups) {
        const isGroupSelected = this.activeComponent != null && bottomPanelComponentGroup(this.activeComponent) === group;

        if (isGroupSelected) {
            this._store.dispatch(new SelectBottomComponentAction(null));
        } else {
            this._store.dispatch(new SelectBottomComponentAction(
                defaultBottomPanelGroupComponent(group)
            ));
        }
    }

    saveLayout() {
        this.saveLayoutE.emit();
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

    ngOnDestroy() {
    }
}
