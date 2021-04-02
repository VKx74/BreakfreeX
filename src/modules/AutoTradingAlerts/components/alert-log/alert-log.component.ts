import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertHistory } from 'modules/AutoTradingAlerts/models/AlertHistory';

@Component({
  selector: 'alert-log',
  templateUrl: './alert-log.component.html',
  styleUrls: ['../app-alert/app-alert.component.scss']
})
export class AlertLogComponent implements OnInit {
  alertsHistory$: Observable<AlertHistory[]>;

  constructor(private _alertsService: AlertsService) { }

  ngOnInit() {
    // this.alertsHistory$ = this._alertsService.getAlertsHistoryStream();
  }
}
