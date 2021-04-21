import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { AutoTradingAlertsTranslateService } from 'modules/AutoTradingAlerts/localization/token';

@Component({
  selector: 'notifications-log-grid',
  templateUrl: 'notifications-log-grid.component.html',
  styleUrls: ['notifications-log-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsLogGridComponent extends AlertGridBase<NotificationLog> {
  public get NotificationLimits(): NotificationLimits {
    return this._alertsService.NotificationLimits;
  }

  constructor(protected _dialog: MatDialog,
    protected _alertsService: AlertsService,
    protected _alertService: AlertService,
    @Inject(AutoTradingAlertsTranslateService) protected _translateService: TranslateService,
    protected _cdr: ChangeDetectorRef) {
    super(_dialog, _alertsService, _alertService, _translateService, _cdr);
  }
  
  getTypeTitle(alert: NotificationLog): Observable<string> {
    switch (alert.notificationType) {
      case AlertNotificationType.Email: return this._translateService.get("notificationTitles.email");
      case AlertNotificationType.SMS: return this._translateService.get("notificationTitles.sms");
      case AlertNotificationType.Push: return this._translateService.get("notificationTitles.push");
    }
  }

  getStatusTitle(alert: NotificationLog): Observable<string> {
    switch (alert.notificationStatus) {
      case NotificationStatus.Sent: return this._translateService.get("notificationStatusTitles.sent");
      case NotificationStatus.Failed: return this._translateService.get("notificationStatusTitles.failed");
      case NotificationStatus.OutOfLImit: return this._translateService.get("notificationStatusTitles.outOfLimit");
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
