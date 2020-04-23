export enum Actions {
    ChangeInstrument
}

export abstract class LinkingAction {
    type: Actions;
    data: any;
}

export class LinkingMessage {
    action: LinkingAction;
    senderId: string;
}