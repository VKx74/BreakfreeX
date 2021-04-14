import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { IInstrument } from "@app/models/common/instrument";
import {
    AlertCondition
} from "../../models/Enums";
import { Modal } from "Shared";
import { PriceAlert } from "../../models/AlertBase";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { NewPriceAlertOptions } from 'modules/AutoTradingAlerts/models/NewAlertOptions';
import { InstrumentService } from '@app/services/instrument.service';
import { AlertStatus, AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';

export interface IPriceAlertDialogPreSettings {
    instrument: IInstrument;
    price: number;
    condition: AlertCondition;
}

export interface IPriceAlertDialogConfig {
    alert?: PriceAlert;
    settings?: IPriceAlertDialogPreSettings;
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
        if (this._instrument !== value) {
            this._instrument = value;
            this._setNotificationText();
        }
    }

    public get selectedCondition(): AlertCondition {
        return this._selectedCondition;
    }
    public set selectedCondition(value: AlertCondition) {
        if (this._selectedCondition !== value) {
            this._selectedCondition = value;
            this._setNotificationText();
        }
    }

    public get alertPrice(): number {
        return this._alertPrice;
    }
    public set alertPrice(value: number) {
        if (this._alertPrice !== value) {
            this._alertPrice = value;
            this._setNotificationText();
        }
    }

    processingSubmit: boolean = false;
    useExpiration: boolean = true;
    showPopup: boolean = true;
    sendSMS: boolean = false;
    sendEmail: boolean = false;
    saveAndStart: boolean = true;
    canRunAlert: boolean = true;
    message: string = "";
    expiration: number = new Date(new Date().getTime() + (1000 * 24 * 60 * 60 * 5)).getTime();

    get conditions(): AlertCondition[] {
        return [AlertCondition.GreaterThan, AlertCondition.LessThan];
    }

    conditionTitlesTranslate = (conditions: any) => this._translateService.get(`conditionTitles.${conditions}`);

    constructor(
        _injector: Injector,
        @Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService,
        private _alertsService: AlertsService,
        private _alertService: AlertService,
        private _instrumentService: InstrumentService,
        @Inject(MAT_DIALOG_DATA) public data: IPriceAlertDialogConfig) {
        super(_injector);

        this.canRunAlert = this._alertsService.canRunMoreAlerts(AlertType.PriceAlert);
        this.saveAndStart = this.canRunAlert;

        if (data && data.alert) {
            this.selectedCondition = data.alert.condition;
            this.alertPrice = data.alert.value;
            this.sendEmail = data.alert.useEmail;
            this.sendSMS = data.alert.useSMS;
            this.showPopup = data.alert.usePush;
            if (data.alert.expiring && data.alert.expiring > new Date().getTime()) {
                this.expiration = data.alert.expiring;
            }
            this._instrumentService.getInstruments(null, data.alert.instrument).subscribe((instruments) => {
                for (const i of instruments) {
                    if (i.id.toLowerCase() === data.alert.instrument.toLowerCase() &&
                        i.exchange.toLowerCase() === data.alert.exchange.toLowerCase()) {
                        this.instrument = i;
                        this.message = data.alert.notificationMessage;
                    }
                }
            });
        } else {
            if (!this._alertsService.canAddMoreAlerts()) {
                this._alertService.info(this._translateService.get("createLimit"));
                this.close();
                return;
            }

            if (data && data.settings) {
                this.selectedCondition = data.settings.condition;
                this.alertPrice = data.settings.price;
                this.instrument = data.settings.instrument;
                this._setNotificationText();
            }
        }
    }

    ngOnInit() {
    }

    playSound() {
        // this._audioService.playSound(this.controls.sound.controls.selectedSound.value);
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

    canCreateAlert() {
        if (!this.instrument) {
            return false;
        }

        if (this.alertPrice === null || this.alertPrice === undefined) {
            return false;
        }

        return true;
    }

    private _create() {
        let option = this._getData();
        this.processingSubmit = true;

        this._alertsService.createPriceAlert(option).subscribe((alert) => {
            this.processingSubmit = false;
            this.close(true);
        }, (error) => {
            this._showError(error);
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
            this._showError(error);
            this.processingSubmit = false;
            console.error(error);
        });
    }

    private _showError(error: any) {
        if (error) {
            if (typeof error === "string") {
                this._alertService.error(error);
                return;
            }
            if (typeof error.error === "string") {
                this._alertService.error(error.error);
                return;
            }
        }

        this._alertService.error(this._translateService.get("failedToCreateAlert"));
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
            value: this.alertPrice,
            expiring: this.expiration,
            status: this.saveAndStart ? AlertStatus.Running : AlertStatus.Stopped
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
