import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {NotificationService} from "@app/services/notification.service";
import {NotificationAction, NotificationMessage} from "@app/models/notifications/notification";

@Injectable()
export class BacktestNotificationService {
    onClose$ = new Subject();

    get isConnected(): boolean {
        return this._notificationService.isOpened;
    }

    backtestFinished = new Subject<string>();
    backtestStopped = new Subject<string>();

    constructor(private _notificationService: NotificationService) {
        this._notificationService.onMessage$.subscribe((notification: NotificationMessage) => {
            this._handleNotification(notification);
        });

        this._notificationService.onClose$
            .subscribe(() => {
                this.onClose$.next();
            });
    }

    private _handleNotification(notification: NotificationMessage) {
        switch (notification.action) {
            case NotificationAction.BacktestFinishedMessage:
                const runningId = (JSON.parse(notification.payload) as { RunningId: string }).RunningId;

                this.backtestFinished.next(runningId);
                break;
        }
    }
}
