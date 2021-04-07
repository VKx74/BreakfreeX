import {Component, Inject, Injector, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {AutoTradingAlertsTranslateService} from "../../localization/token";
import {IInstrument} from "@app/models/common/instrument";
import {
    AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType
} from "../../models/Enums";
import {forkJoin, Observable} from 'rxjs';
import {Modal} from "Shared";
import {AlertBase} from "../../models/AlertBase";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';

export interface IAlertDialogConfig {
    alert?: AlertBase;
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
    triggerSetupTranslate = (setup: any) => this._translateService.get(`triggerSetupStr.${setup}`);

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

    public submit() {
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

    private _setNotificationText() {
        this.message = "";

        if (!this.selectedTriggerSetup) {
            return;
        }

        if (!this.selectedTriggerTimeframe) {
            return;
        }

        let task1 = this.timeframeTitlesTranslate(this.selectedTriggerTimeframe);
        let task2 = this.triggerSetupTranslate(this.selectedTriggerSetup);

        forkJoin([task1, task2]).subscribe((data) => {
            let symbol = this.instrument ? this.instrument.symbol : "All instruments";
            let triggerType = this.selectedTriggerType === TriggerType.NewSetup ? "New Sonar trade(s)" : "Sonar trade(s) Disappeared";
            this.message = `${triggerType} for ${symbol} ${data[0]} ${data[1]}`;
        });
    }
}
