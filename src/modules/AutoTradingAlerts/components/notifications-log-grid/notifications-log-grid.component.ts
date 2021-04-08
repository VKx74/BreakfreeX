import { Component, OnInit } from '@angular/core';
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertNotificationType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { NotificationLog } from 'modules/AutoTradingAlerts/models/NotificationLog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'notifications-log-grid',
  templateUrl: 'notifications-log-grid.component.html',
  styleUrls: ['notifications-log-grid.component.scss']
})
export class NotificationsLogGridComponent implements OnInit {
  get alerts(): NotificationLog[] {
    return this._alertsService.NotificationLogs;
  }

  constructor(protected _alertsService: AlertsService, protected _translateService: TranslateService) { 
    this._alertsService.init();
  }

  ngOnInit() {
  }
  
  getTypeTitle(alert: NotificationLog): string {
    switch (alert.notificationType) {
      case AlertNotificationType.Email: return "Email";
      case AlertNotificationType.SMS: return "SMS";
      case AlertNotificationType.Push: return "Push";
    }
  }
}
