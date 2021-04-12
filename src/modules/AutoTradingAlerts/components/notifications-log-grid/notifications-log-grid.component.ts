import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertHistory } from 'modules/AutoTradingAlerts/models/AlertHistory';
import { AlertNotificationType, AlertType, NotificationStatus } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertGridBase } from '../alert-grid-base/alert-grid-base';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '@alert/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { NotificationLog } from 'modules/AutoTradingAlerts/models/NotificationLog';
import { NotificationLimits } from 'modules/AutoTradingAlerts/models/NotificationLimits';

@Component({
  selector: 'notifications-log-grid',
  templateUrl: 'notifications-log-grid.component.html',
  styleUrls: ['notifications-log-grid.component.scss']
})
export class NotificationsLogGridComponent extends AlertGridBase<NotificationLog> {
  public get NotificationLimits(): NotificationLimits {
    return this._alertsService.NotificationLimits;
  }

  constructor(protected _dialog: MatDialog,
    protected _alertsService: AlertsService,
    protected _alertService: AlertService,
    protected _translateService: TranslateService,
    protected _cdr: ChangeDetectorRef) {
    super(_dialog, _alertsService, _alertService, _translateService, _cdr);
  }
  
  getTypeTitle(alert: NotificationLog): string {
    switch (alert.notificationType) {
      case AlertNotificationType.Email: return "Email";
      case AlertNotificationType.SMS: return "SMS";
      case AlertNotificationType.Push: return "Push";
    }
  }

  getStatusTitle(alert: NotificationLog): string {
    switch (alert.notificationStatus) {
      case NotificationStatus.Sent: return "Sent";
      case NotificationStatus.Failed: return "Failed";
      case NotificationStatus.OutOfLImit: return "Out Of LImit";
    }
  }

  protected loadItems(): Observable<NotificationLog[]> {
    return of(this._alertsService.NotificationLogs);
  }

  protected _subscribeOnUpdates(): Subscription {
    return this._alertsService.onNotificationLogsChanged.subscribe(() => {
      this.updateItems();
    });
  }
}
