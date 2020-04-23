import {
    EAlertType,
    EChannelAlertCondition,
    EMovingAlertCondition,
    EPriceAlertCondition,
    EDataSourceType
} from "./Enums";
import {Subject} from "rxjs";
import {AlertDataSourceBase} from "./AlertDataSourceBase";
import {AlertSettings} from "./AlertSettingsBase";
import {JsUtil} from "../../../utils/jsUtil";
import {TradeSettings} from "./TradeSettingsBase";

export enum EAlertState {
    Stopped,
    Started,
    Stopping,
    Starting
}

export abstract class AlertBase {
    protected _alertName: string;
    protected _externalId: string;
    protected _runningId: string;
    protected _dataSource: AlertDataSourceBase;
    protected _onCloud: boolean = true;
    protected _state: EAlertState = EAlertState.Stopped;
    public updated$ = new Subject<any>();

    public abstract get alertType(): EAlertType;

    public abstract condition: EPriceAlertCondition | EChannelAlertCondition | EMovingAlertCondition;

    get alertName(): string {
        return this._alertName;
    }

    get externalId(): string {
        return this._externalId;
    }

    get runningId(): string {
        return this._runningId;
    }

    get state(): EAlertState {
        return this._state;
    }

    get isStarted(): boolean {
        return this._state === EAlertState.Started;
    }

    get isOnCloud(): boolean {
        return this._onCloud;
    }

    get dataSource(): AlertDataSourceBase {
        return this._dataSource;
    }

    get canRunOnFrontend(): boolean {
        return this._dataSource && this._dataSource.dataSourceType === EDataSourceType.RealtimeDataSource;
    }

    set dataSource(value: AlertDataSourceBase) {
        this._dataSource = value;
        this.updated$.next();
    }

    public onAlertTriggered = new Subject<AlertBase>();

    public useExpiration = false;

    public expiration = Date.now();

    public showPopup = true;

    public playSound = true;

    public sendEmail = false;

    public sendSMS = false;

    // public notificationPhoneNumber = '';

    // public notificationEmail = '';

    public soundId = '';

    public comment = '';

    public configuredTrade?: TradeSettings = null;

    constructor() {
        this._alertName = JsUtil.generateAlertName();
    }

    public getSettings(): AlertSettings {
        return {
            AlertType: this.alertType,
            Condition: this.condition,
            AlertName: this.alertName,
            UseExpiration: this.useExpiration,
            Expiration: this.expiration,
            ShowPopup: this.showPopup,
            PlaySound: this.playSound,
            SoundId: this.soundId,
            // NotificationPhoneNumber: this.notificationPhoneNumber,
            // NotificationEmail: this.notificationEmail,
            AlertId: "",
            Comment: this.comment,
            SendEmail: this.sendEmail,
            SendSMS: this.sendSMS,
            ConfiguredTrade: this.configuredTrade,
        };
    }

    public applySettings(settings: AlertSettings) {
        this._alertName = settings.AlertName;
        this.condition = settings.Condition;
        this.useExpiration = settings.UseExpiration;
        this.expiration = settings.Expiration;
        this.showPopup = settings.ShowPopup;
        this.playSound = settings.PlaySound;
        this.soundId = settings.SoundId;
        this.sendEmail = settings.SendEmail;
        // this.notificationPhoneNumber = settings.NotificationPhoneNumber;
        // this.notificationEmail = settings.NotificationEmail;
        this.sendSMS = settings.SendSMS;
        this.comment = settings.Comment;
        this.configuredTrade = settings.ConfiguredTrade;
        this.updated$.next();
    }

    public bindId(id: string) {
        this._externalId = id;
    }

    public setState(state: EAlertState, runningId: string = "") {
        this._state = state;
        this._runningId = runningId;
        this.updated$.next();
    }

    public seCloudExecution() {
        this._onCloud = true;
    }

    public abstract getDescription(): string;

    protected raiseAlertTriggered() {
        if (this.isStarted) {
            this.onAlertTriggered.next(this);
        }
    }

    protected getConditionTitle(): string {
        switch (this.condition) {
            case EPriceAlertCondition.Crossing:
                return 'Crossing';
            case EPriceAlertCondition.GreaterThan:
                return 'Greater Than';
            case EPriceAlertCondition.LessThan:
                return 'Less Than';
            case EPriceAlertCondition.CrossingDown:
                return 'Crossing Down';
            case EPriceAlertCondition.CrossingUp:
                return 'Crossing Up';

            case EChannelAlertCondition.InsideChannel:
                return 'Inside Channel';
            case EChannelAlertCondition.OutsideChannel:
                return 'Outside Channel';
            case EChannelAlertCondition.ExitingChannel:
                return 'Exiting Channel';
            case EChannelAlertCondition.EnteringChannel:
                return 'Entering Channel';

            case EMovingAlertCondition.MovingUp:
                return 'Moving Up';
            case EMovingAlertCondition.MovingDown:
                return 'Moving Down';
            case EMovingAlertCondition.MovingUpPercentage:
                return 'Moving Up %';
            case EMovingAlertCondition.MovingDownPercentage:
                return 'Moving Down %';
        }
    }
}

