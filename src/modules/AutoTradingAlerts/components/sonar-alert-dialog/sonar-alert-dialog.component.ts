import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { AutoTradingAlertsTranslateService } from "../../localization/token";
import { IInstrument } from "@app/models/common/instrument";
import {
    TriggerSetup, TriggerTimeframe, TriggerType
} from "../../models/Enums";
import { forkJoin } from 'rxjs';
import { Modal } from "Shared";
import { SonarAlert } from "../../models/AlertBase";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { InstrumentService } from '@app/services/instrument.service';
import { NewSonarAlertOptions } from 'modules/AutoTradingAlerts/models/NewAlertOptions';
import { AlertExecutionStrategy, AlertStatus, AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertService } from '@alert/services/alert.service';
import { IdentityService, SubscriptionType } from '@app/services/auth/identity.service';
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { CheckoutComponent } from 'modules/BreakfreeTrading/components/checkout/checkout.component';

export interface ISonarDialogConfig {
    alert?: SonarAlert;
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
export class SonarAlertDialogComponent extends Modal<ISonarDialogConfig> implements OnInit {
    private _instrument: IInstrument;
    private _allowedTriggerTimeframe: TriggerTimeframe[] = [];
    private _selectedTriggerType: TriggerType = TriggerType.NewSetup;
    private _selectedTriggerOptions: AlertExecutionStrategy = AlertExecutionStrategy.Once;
    private _selectedTriggerTimeframe: TriggerTimeframe;
    private _selectedTriggerSetup: TriggerSetup = TriggerSetup.AllSetups;

    private get _isPro(): boolean {
        return this._identityService.subscriptionType === SubscriptionType.Pro ||
        this._identityService.subscriptionType === SubscriptionType.Trial;
    }

    TriggerType = TriggerType;
    AlertExecutionStrategy = AlertExecutionStrategy;
    TriggerTimeframe = TriggerTimeframe;

    public get allowedTriggerTimeframe(): TriggerTimeframe[] {
       return this._allowedTriggerTimeframe;
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
        if (this._selectedTriggerType !== value) {
            this._selectedTriggerType = value;
            this._setNotificationText();
        }
    }

    public get instrument(): IInstrument {
        return this._instrument;
    }
    public set instrument(value: IInstrument) {
        if (this._instrument !== value) {
            this._instrument = value;
            this._setNotificationText();
        }
    }

    public get selectedTriggerTimeframe(): TriggerTimeframe {
        return this._selectedTriggerTimeframe;
    }
    public set selectedTriggerTimeframe(value: TriggerTimeframe) {
        if (this._selectedTriggerTimeframe !== value) {
            this._selectedTriggerTimeframe = value;
            this._setNotificationText();
        }
    }

    public get selectedTriggerOptions(): AlertExecutionStrategy {
        return this._selectedTriggerOptions;
    }
    public set selectedTriggerOptions(value: AlertExecutionStrategy) {
        if (this._selectedTriggerOptions !== value) {
            this._selectedTriggerOptions = value;
        }
    }

    public get selectedTriggerSetup(): TriggerSetup {
        return this._selectedTriggerSetup;
    }
    public set selectedTriggerSetup(value: TriggerSetup) {
        if (this._selectedTriggerSetup = value) {
            this._selectedTriggerSetup = value;
            this._setNotificationText();
        }
    }

    processingSubmit: boolean = false;
    useExpiration: boolean = true;
    showPopup: boolean = true;
    sendSMS: boolean = true;
    sendEmail: boolean = true;
    saveAndStart: boolean = true;
    canRunAlert: boolean = true;
    playSound: boolean = true;
    message: string = "";
    expiration: number = new Date(new Date().getTime() + (1000 * 24 * 60 * 60 * 5)).getTime();

    timeframeTitlesTranslate = (tf: any) => this._translateService.get(`timeFrameToStr.${tf}`);
    triggerSetupTranslate = (setup: any) => this._translateService.get(`triggerSetupStr.${setup}`);

    constructor(
        _injector: Injector,
        @Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService,
        private _alertsService: AlertsService,
        private _alertService: AlertService,
        private _instrumentService: InstrumentService,
        private _identityService: IdentityService,
        private _tradingProfileService: TradingProfileService,
        private _identity: IdentityService,
        private _dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: ISonarDialogConfig) {
        super(_injector);

        this._formAllowedTimeframes();
        this.canRunAlert = this._alertsService.canRunMoreAlerts(AlertType.SonarAlert);
        this.saveAndStart = this.canRunAlert;

        if (data && data.alert) {
            this.selectedTriggerType = data.alert.triggerType;
            this.selectedTriggerTimeframe = data.alert.timeframe;
            this.selectedTriggerOptions = data.alert.executionStrategy;
            this.selectedTriggerSetup = data.alert.setup;
            this.sendEmail = data.alert.useEmail;
            this.sendSMS = data.alert.useSMS;
            this.showPopup = data.alert.usePush;
            this.playSound = data.alert.playSound;

            if (data.alert.expiring && data.alert.expiring > new Date().getTime()) {
                this.expiration = data.alert.expiring;
            }

            if (data.alert.instrument) {
                this._instrumentService.getInstruments(null, data.alert.instrument).subscribe((instruments) => {
                    for (const i of instruments) {
                        if (i.id.toLowerCase() === data.alert.instrument.toLowerCase()) {
                                this.instrument = i;
                                this.message = data.alert.notificationMessage;
                            }
                    }
                });
            } else {
                this.message = data.alert.notificationMessage;
            }
        } else {
            if (!this._alertsService.canUseSonarAlerts()) {
                this._alertService.info(this._translateService.get("createSonarRestriction"));
                this.close();
            } else if (!this._alertsService.canAddMoreAlerts()) {
                this._alertService.info(this._translateService.get("createLimit"));
                this.close();
            }
        }
    }

    ngOnInit() {
    }

    handleInstrumentChange(instrument: IInstrument) {
        this.instrument = instrument;
    }

    public submit() {
        if (this._identity.isGuestMode) {
            this._processCheckout();
            return;
        }

        if (this.data && this.data.alert) {
            this._edit();
        } else {
             this._create();
        }
    }

    private _create() {
        let option = this._getData();
        this.processingSubmit = true;
        
        this._alertsService.createSonarAlert(option).subscribe((alert) => {
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
        
        this._alertsService.updateSonarAlert(option, this.data.alert.id).subscribe((alert) => {
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

        this._alertService.error("Failed to create alert.");
    }

    private _getData(): NewSonarAlertOptions {
        return {
            instrument: this._instrument ? this._instrument.id : null,
            notificationMessage: this.message,
            useEmail: this.sendEmail,
            usePush: this.showPopup,
            useSMS: this.sendSMS,
            setup: this.selectedTriggerSetup,
            timeframe: this.selectedTriggerTimeframe,
            triggerType: this.selectedTriggerType,
            triggerOptions: this.selectedTriggerOptions,
            expiring: this.expiration,
            playSound: this.playSound,
            status: this.saveAndStart ? AlertStatus.Running : AlertStatus.Stopped
        };
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
            let triggerType = this.selectedTriggerType === TriggerType.NewSetup ? "New trade(s)" : "Trade(s) Disappeared";
            this.message = `${triggerType} for ${symbol} ${data[0]} ${data[1]}`;
        });
    }

    private _formAllowedTimeframes() {
        if (!this._identityService.isAuthorizedCustomer) {
            return;
        }

        let is15MinAllowed = this._identityService.is15MinAllowed();
        let isHourAllowed = this._identityService.isHourAllowed();
        let is4HourAllowed = this._identityService.is4HourAllowed();

        if (is15MinAllowed) {
            this._allowedTriggerTimeframe.push(TriggerTimeframe.AllTimeframes);
            this._allowedTriggerTimeframe.push(TriggerTimeframe.Min15);
        }

        if (isHourAllowed) {
            this._allowedTriggerTimeframe.push(TriggerTimeframe.Hour1);
        }
        
        if (is4HourAllowed) {
            this._allowedTriggerTimeframe.push(TriggerTimeframe.Hour4);
        }

        this._allowedTriggerTimeframe.push(TriggerTimeframe.Day1);
        this._selectedTriggerTimeframe = this._allowedTriggerTimeframe[0];
    }

    private _processCheckout() {
        this._dialog.open(CheckoutComponent, { backdropClass: 'backdrop-background' });
    }
}
