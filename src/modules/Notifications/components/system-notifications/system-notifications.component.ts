import { Component, OnInit } from '@angular/core';
import {SystemNotification, SystemNotificationsResponseModel} from "../../models/models";
import {SystemNotificationsService} from "../../services/system-notifications.service";
import {TzUtils} from "TimeZones";
import {TranslateService} from "@ngx-translate/core";
import {NotificationsTranslateService} from "../../localization/token";
import {ComponentIdentifier} from "@app/models/app-config";

@Component({
  selector: 'system-notifications',
  templateUrl: './system-notifications.component.html',
  styleUrls: ['./system-notifications.component.scss',
    '../../styles/_shared.scss'],
  providers: [
    {
      provide: TranslateService,
      useExisting: NotificationsTranslateService
    }
  ]
})
export class SystemNotificationsComponent implements OnInit {
  notifications: SystemNotification[] = [];
  selectedNotification: string;
  lastUpdate: number = 0;

  get ComponentIdentifier() {
    return ComponentIdentifier;
  }

  constructor(private _systemNotificationsService: SystemNotificationsService) {
    this._systemNotificationsService.getNotifications()
        .subscribe((data: SystemNotificationsResponseModel) => {
          this._systemNotificationsService.isNewNotification = false;
          this.lastUpdate = data.lastUpdate;
          this.notifications = data.notifications.sort((a, b) => b.updateDate - a.updateDate);
        }, e => {
          console.log(e);
        });
  }

  ngOnInit() {
  }

  isSelectedNotification(notification: SystemNotification): boolean {
    return this.selectedNotification === notification.id;
  }

  isNotificationUnread(notification: SystemNotification): boolean {
    return this.lastUpdate < notification.updateDate;
  }

  showDescription(notification: SystemNotification) {
    this.selectedNotification = this.selectedNotification === notification.id ? null : notification.id;
  }

  utcTimeToLocal(time: number): number {
    return TzUtils.utcToLocalTz(new Date(time)).getTime();
  }
}
