import {Component, Inject, Injector, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {AutoTradingAlertsTranslateService} from "../../localization/token";
import {IInstrument} from "@app/models/common/instrument";
import {
    EPriceAlertCondition
} from "../../models/Enums";
import {Observable} from 'rxjs';
import {Modal} from "Shared";
import {AlertBase} from "../../models/AlertBase";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';

export interface IAlertDialogConfig {
    alert?: AlertBase;
}

@Component({
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class AlertDialogComponent extends Modal<IAlertDialogConfig> implements OnInit {
    private _instrument: IInstrument;
    private _selectedCondition: EPriceAlertCondition = EPriceAlertCondition.GreaterThan;
    private _alertPrice: number = 1;

    public get instrument(): IInstrument {
        return this._instrument;
    }
    public set instrument(value: IInstrument) {
        this._instrument = value;
        this._setNotificationText();
    }

    public get selectedCondition(): EPriceAlertCondition {
        return this._selectedCondition;
    }
    public set selectedCondition(value: EPriceAlertCondition) {
        this._selectedCondition = value;
        this._setNotificationText();
    }

    public get alertPrice(): number {
        return this._alertPrice;
    }
    public set alertPrice(value: number) {
        this._alertPrice = value;
        this._setNotificationText();
    }

    minDate = new Date;
    processingSubmit: boolean = false;
    useExpiration: boolean = false;
    showPopup: boolean = true;
    sendSMS: boolean = false;
    sendEmail: boolean = false;
    message: string = "";

    get conditions(): EPriceAlertCondition[] {
        return [EPriceAlertCondition.GreaterThan, EPriceAlertCondition.LessThan];
    }

    conditionTitlesTranslate = (conditions: any) => this._translateService.get(`conditionTitles.${conditions}`);

    constructor(
        _injector: Injector,
        private _translateService: TranslateService,
        private _alertsService: AlertsService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        super(_injector);
    }

    ngOnInit() {
    }

    playSound() {
        // this._audioService.playSound(this.controls.sound.controls.selectedSound.value);
    }

    combineTimeNew(date: any, time: any): number {
        let mdate = moment(date);
        let hours = moment(time, 'HH:mm A');
        let combine = mdate.set('hour', Number(hours.hour())).set('minute', Number(hours.minutes()));

        return moment(combine).valueOf();
    }

    handleInstrumentChange(instrument: IInstrument) {
        this.instrument = instrument;
    }

    onSubmitDialog() {
        // const isEditMode = this.data.alert;
        // const obs = isEditMode ? this.editAlert(this.data.alert.externalId) : this.createAlert();

        // this.processingSubmit = true;
        // obs.subscribe({
        //     next: () => {
        //         this.processingSubmit = false;
        //         this.close();
        //     },
        //     error: () => {
        //         this.processingSubmit = false;
        //     }
        // });
        return null;
    }

    public editAlert(id: string): Observable<any> {
        // return this._autoTradingAlertService.updateAlert(id, this._getAlertSettingsNew(), this._getSourceSettingsNew())
        //     .pipe(
        //         tap({
        //             next: () => {
        //                 this._alertService.success(this._translateService.get('alertUpdated'));
        //             },
        //             error: (error) => {
        //                 this._alertService.error(this._translateService.get('failedToEditAlert'));
        //                 console.error(error);
        //             }
        //         })
        //     );
        return null;
    }

    public createAlert(): Observable<any> {
        // return this._autoTradingAlertService.createAlert(this._getAlertSettingsNew(), this._getSourceSettingsNew())
        //     .pipe(
        //         tap({
        //             next: () => {
        //                 this._alertService.success(this._translateService.get('alertCreated'));
        //             },
        //             error: (error) => {
        //                 this._alertService.error(this._translateService.get('failedToCreateAlert'));
        //                 console.error(error);
        //             }
        //         })
        //     );
        return null;
    }

    private _setNotificationText() {
        this.message = "";

        if (!this.instrument) {
            return;
        }

        if (!this.selectedCondition) {
            return;
        }

        if (!this.alertPrice) {
            return;
        }

        this.conditionTitlesTranslate(this.selectedCondition).subscribe((conditionTitle) => {
            this.message = `${this.instrument.symbol} ${conditionTitle} ${this.alertPrice}`;
        });
    }
}
