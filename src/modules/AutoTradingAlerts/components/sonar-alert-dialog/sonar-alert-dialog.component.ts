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

export enum TriggerType {
    NewSetup = "NewSetup",
    SetupDisappeared = "SetupDisappeared"
}

export enum TriggerTimeframe {
    AllTimeframes = "allTimeframes",
    Min15 = "15m",
    Hour1 = "1h",
    Hour4 = "4h",
    Day1 = "1d"
}

export enum TriggerSetup {
    AllSetups = "allSetups",
    Swing = "swing",
    BRC = "brc",
    EXT = "ext"
}

@Component({
    selector: 'sonar-alert-dialog',
    templateUrl: './sonar-alert-dialog.component.html',
    styleUrls: ['./sonar-alert-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class SonarAlertDialogComponent extends Modal<IAlertDialogConfig> implements OnInit {
    private _instrument: IInstrument;
    private _selectedTriggerType: TriggerType = TriggerType.NewSetup;
    private _selectedTriggerTimeframe: TriggerTimeframe = TriggerTimeframe.AllTimeframes;
    private _selectedTriggerSetup: TriggerSetup = TriggerSetup.AllSetups;
    TriggerType = TriggerType;
    TriggerTimeframe = TriggerTimeframe;

    public get allowedTriggerTimeframe(): TriggerTimeframe[] {
        return [
            TriggerTimeframe.AllTimeframes,
            TriggerTimeframe.Min15, 
            TriggerTimeframe.Hour1, 
            TriggerTimeframe.Hour4, 
            TriggerTimeframe.Day1
        ];
    } 

    public get allowedTriggerSetup(): TriggerSetup[] {
        return [
            TriggerSetup.AllSetups,
            TriggerSetup.Swing, 
            TriggerSetup.BRC, 
            TriggerSetup.EXT
        ];
    } 
    
    public get selectedTriggerType(): TriggerType {
        return this._selectedTriggerType;
    }
    public set selectedTriggerType(value: TriggerType) {
        this._selectedTriggerType = value;
        this._setNotificationText();
    }

    public get instrument(): IInstrument {
        return this._instrument;
    }
    public set instrument(value: IInstrument) {
        this._instrument = value;
        this._setNotificationText();
    }

    public get selectedTriggerTimeframe(): TriggerTimeframe {
        return this._selectedTriggerTimeframe;
    }
    public set selectedTriggerTimeframe(value: TriggerTimeframe) {
        this._selectedTriggerTimeframe = value;
        this._setNotificationText();
    }

    public get selectedTriggerSetup(): TriggerSetup {
        return this._selectedTriggerSetup;
    }
    public set selectedTriggerSetup(value: TriggerSetup) {
        this._selectedTriggerSetup = value;
        this._setNotificationText();
    }

    processingSubmit: boolean = false;
    useExpiration: boolean = false;
    showPopup: boolean = true;
    sendSMS: boolean = false;
    sendEmail: boolean = false;
    message: string = "";

    timeframeTitlesTranslate = (tf: any) => this._translateService.get(`timeFrameToStr.${tf}`);
    triggerSetupTranslate = (tf: any) => this._translateService.get(`triggerSetupStr.${tf}`);

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

        if (!this.selectedTriggerSetup) {
            return;
        }

        if (!this._selectedTriggerTimeframe) {
            return;
        }

        // this.conditionTitlesTranslate(this.selectedCondition).subscribe((conditionTitle) => {
        //     this.message = `${this.instrument.symbol} ${conditionTitle} ${this.alertPrice}`;
        // });
    }
}
