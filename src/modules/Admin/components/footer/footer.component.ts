import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import {TimeZone, TzUtils, UTCTimeZone} from "TimeZones";
import {interval, Observable} from "rxjs";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {BrokerService} from "@app/services/broker.service";
import {PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {Roles} from "@app/models/auth/auth.models";
import {
    ShuftiproAccountManagerComponent, ShuftiproAccountManagerConfig,
    ShuftiproAccountManagerResult
} from "../../../shuftipro-account-manager/components/shuftipro-account-manager/shuftipro-account-manager.component";
import {MatDialog} from "@angular/material/dialog";
import {JsUtil} from "../../../../utils/jsUtil";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";

@Component({
    selector: 'footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    providers: [{
        provide: TranslateService, useExisting: AppTranslateService
    }]
})
export class FooterComponent implements OnInit {
    date: string;
    isShuftiproHealthy: boolean;
    shuftiproStatus = '';
    shuftiproAccountEmail = '';
    changeShuftiproAccountProcessing = false;

    get Roles() {
        return Roles;
    }

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

    private _translateService: TranslateService;
    private _applicationTypeService: ApplicationTypeService;
    private _brokerService: BrokerService;

    constructor(private _personalInfoService: PersonalInfoService,
                private _dialog: MatDialog,
                private _tzUtils: TzUtils) {
    }

    ngOnInit() {
        interval(500)
            .pipe(
                switchMap(() => {
                    return this._formatDate(UTCTimeZone);
                }),
                takeUntil(componentDestroyed(this))
            )
            .subscribe((formattedDate: string) => {
                this.date = formattedDate;
            });

        this._personalInfoService.getHealthStatus()
            .subscribe((data: string) => {
                this.isShuftiproHealthy = true;
                this.shuftiproStatus = data;
            }, (error) => {
                this.isShuftiproHealthy = false;
                this.shuftiproStatus = error.error;
            });

        this._personalInfoService.getShuftiproAccountEmail()
            .subscribe((email: string) => {
                this.shuftiproAccountEmail = email;
            }, e => {
                console.log(e);
            });
    }

    changeShuftiproAccount() {
        this.changeShuftiproAccountProcessing = true;
        const shuftiproAccountManagerConfig: ShuftiproAccountManagerConfig = {
            currentEmail: this.shuftiproAccountEmail
        };
        this._dialog.open(ShuftiproAccountManagerComponent, {
            data: shuftiproAccountManagerConfig
        })
            .afterClosed()
            .subscribe((result: ShuftiproAccountManagerResult) => {
                this.changeShuftiproAccountProcessing = false;
                if (result && result.newEmail) {
                    this.shuftiproAccountEmail = result.newEmail;
                }
            }, e => {
                this.changeShuftiproAccountProcessing = false;
                console.log(e);
            });
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
