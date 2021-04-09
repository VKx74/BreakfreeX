import { AlertType } from "modules/AutoTradingAlerts/models/EnumsDTO";

export enum AlertMessageType {
    Auth = "Auth",
}

export interface IAlertAuth {
    Token: string;
}

export interface IAlertTriggeredData {
    AlertId: number;
    NotificationMessage: string;
    Type: "string";
}

export interface IAlertChangedData {
    AlertId: number;
}

export enum AlertResponseMessageType
{
    None = "none",
    Error = "error",
    Success = "success",

    AlertStateChanged = "alertStateChanged",
    AlertTriggered = "alertTriggered",
    AlertChanged = "alertChanged",
}

export abstract class AlertRequestMessageBase {
    private static counter = 1;

    public MessageId: string;
    public Type: AlertMessageType;

    constructor(type: AlertMessageType) {
        this.Type = type;
        this.MessageId = `${new Date().getTime()}_${AlertRequestMessageBase.counter++}`;
    }
}

export abstract class AlertResponseMessageBase {
    public MessageId: string;
    public Data?: any;
    public Type: AlertResponseMessageType;
}



// Requests 

export class AlertAuthRequest extends AlertRequestMessageBase {
    public Data: IAlertAuth;

    constructor() {
        super(AlertMessageType.Auth);
    }
}


// Responses


export class AlertTriggeredResponse extends AlertResponseMessageBase {
    public Data: IAlertTriggeredData;
}

export class AlertStateChangedResponse extends AlertResponseMessageBase {
    public Data: IAlertChangedData;
}