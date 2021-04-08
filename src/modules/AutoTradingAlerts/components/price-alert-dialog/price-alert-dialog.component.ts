import {Component, Inject, Injector, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {AutoTradingAlertsTranslateService} from "../../localization/token";
import {IInstrument} from "@app/models/common/instrument";
import {
    AlertCondition
} from "../../models/Enums";
import {Modal} from "Shared";
import { PriceAlert} from "../../models/AlertBase";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { NewPriceAlertOptions } from 'modules/AutoTradingAlerts/models/NewAlertOptions';
import { Console } from 'console';
import { InstrumentService } from '@app/services/instrument.service';
import { EExchange } from '@app/models/common/exchange';
import { EExchangeInstance } from '@app/interfaces/exchange/exchange';

export interface IPriceAlertDialogConfig {
    alert?: PriceAlert;
}

@Component({
    selector: 'price-alert-dialog',
    templateUrl: './price-alert-dialog.component.html',
    styleUrls: ['./price-alert-dialog.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AutoTradingAlertsTranslateService
        }
    ]
})
export class PriceAlertDialogComponent extends Modal<IPriceAlertDialogConfig> implements OnInit {
    private _instrument: IInstrument;
    private _selectedCondition: AlertCondition = AlertCondition.GreaterThan;
    private _alertPrice: number = 1;

    public get instrument(): IInstrument {
        return this._instrument;
    }
    public set instrument(value: IInstrument) {
        this._instrument = value;
        this._setNotificationText();
    }

    public get selectedCondition(): AlertCondition {
        return this._selectedCondition;
    }
    public set selectedCondition(value: AlertCondition) {
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

    processingSubmit: boolean = false;
    useExpiration: boolean = false;
    showPopup: boolean = true;
    sendSMS: boolean = false;
    sendEmail: boolean = false;
    message: string = "";

    get conditions(): AlertCondition[] {
        return [AlertCondition.GreaterThan, AlertCondition.LessThan];
    }

    conditionTitlesTranslate = (conditions: any) => this._translateService.get(`conditionTitles.${conditions}`);

    constructor(
        _injector: Injector,
        private _translateService: TranslateService,
        private _alertsService: AlertsService,
        private _instrumentService: InstrumentService,
        @Inject(MAT_DIALOG_DATA) public data: IPriceAlertDialogConfig) {
        super(_injector);

        if (data && data.alert) {
            this.selectedCondition = data.alert.condition;
            this.alertPrice = data.alert.value;
            this.sendEmail = data.alert.useEmail;
            this.sendSMS = data.alert.useSMS;
            this.showPopup = data.alert.usePush;
            this._instrumentService.getInstruments(null, data.alert.instrument).subscribe((instruments) => {
                for (const i of instruments) {
                    if (i.id.toLowerCase() === data.alert.instrument.toLowerCase() &&
                        i.exchange.toLowerCase() === data.alert.exchange.toLowerCase()) {
                            this.instrument = i;
                            this.message = data.alert.notificationMessage;
                        }
                }
            });
        }
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

    submit() {
       if (this.data && this.data.alert) {
           this._edit();
       } else {
            this._create();
       }
    }

    private _create() {
        let option = this._getData();
        this.processingSubmit = true;
        
        this._alertsService.createPriceAlert(option).subscribe((alert) => {
            this.processingSubmit = false;
            this.close(true);
        }, (error) => {
            this.processingSubmit = false;
            console.error(error);
        });
    }
    
    private _edit() {
        let option = this._getData();
        this.processingSubmit = true;
        
        this._alertsService.updatePriceAlert(option, this.data.alert.id).subscribe((alert) => {
            this.processingSubmit = false;
            this.close(true);
        }, (error) => {
            this.processingSubmit = false;
            console.error(error);
        });
    }

    private _getData(): NewPriceAlertOptions {
        return {
            condition: this._selectedCondition,
            exchange: this._instrument.exchange,
            instrument: this._instrument.id,
            notificationMessage: this.message,
            useEmail: this.sendEmail,
            usePush: this.showPopup,
            useSMS: this.sendSMS,
            value: this.alertPrice
        };
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
