export enum EMT5MessageType {
    GetBrokers = "GetBrokers",
    Login = "Login",
    Logout = "Logout"
}

export abstract class MT5RequestMessageBase {
    private static counter = 1;

    public MessageId: string;
    public Type: EMT5MessageType;

    constructor(type: EMT5MessageType) {
        this.Type = type;
        this.MessageId = `${new Date().getTime()}_${MT5RequestMessageBase.counter++}`;
    }
}

export abstract class MT5ResponseMessageBase {
    public MessageId: string;
    public IsSuccess: boolean;
    public Data?: any;
    public ErrorMessage?: string;
}

export interface IMT5Server {
    BrokerName: string;
    Servers: string[];
}

export interface IMT5LoginData {
    User: string;
    Password: string;
    ServerName: string;
}

export class MT5GetServersRequest extends MT5RequestMessageBase {}

export class MT5GetServersResponse extends MT5ResponseMessageBase {
    public Data: IMT5Server[];
}

export class MT5LoginRequest extends MT5RequestMessageBase {
    public Data: IMT5LoginData;
}

export class MT5LogoutRequest extends MT5RequestMessageBase {}