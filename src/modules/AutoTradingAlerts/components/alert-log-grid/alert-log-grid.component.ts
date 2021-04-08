import { Component, OnInit } from '@angular/core';
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertHistory } from 'modules/AutoTradingAlerts/models/AlertHistory';
import { AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';

@Component({
  selector: 'alert-log-grid',
  templateUrl: 'alert-log-grid.component.html',
  styleUrls: ['alert-log-grid.component.scss']
})
export class AlertLogGridComponent implements OnInit {
  get alerts(): AlertHistory[] {
    return this._alertsService.AlertHistory;
  }

  constructor(private _alertsService: AlertsService) { 
    this._alertsService.init();
  }

  ngOnInit() {
  }

  getConditionTitle(alert: AlertHistory): string {
    switch (alert.type) {
      case AlertType.PriceAlert: return "Price Alert";
      case AlertType.SonarAlert: return "Sonar Alert";
    }
  }
}
