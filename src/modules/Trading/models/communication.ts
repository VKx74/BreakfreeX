export enum BrokerMessageType {
    Auth = "Auth"
}

export interface IBrokerAuth {
    Token: string;
}

export abstract class BrokerRequestMessageBase {
    private static counter = 1;

    public MessageId: string;
    public Type: any;

    constructor(type: any) {
        this.Type = type;
        this.MessageId = `${new Date().getTime()}_${BrokerRequestMessageBase.counter++}`;
    }
}

export abstract class BrokerResponseMessageBase {
    public MessageId: string;
    public IsSuccess: boolean;
    public Data?: any;
    public ErrorMessage?: string;
    public Type?: string;
}

export class BrokerAuthRequest extends BrokerRequestMessageBase {
    public Data: IBrokerAuth;

    constructor() {
        super(BrokerMessageType.Auth);
    }
}