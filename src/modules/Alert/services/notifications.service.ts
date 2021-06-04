import {Observable, of} from "rxjs";

export enum NotificationType {
    Success,
    Error,
    Info
}

export abstract class NotificationsService {

    abstract show(message: Observable<string> | string, title?: string | Observable<string>, notificationType?: NotificationType);
}
