import { Component, OnInit } from '@angular/core';
import {AlertHistory} from "../../models/AlertHistory";
import {AutoTradingAlertService} from "../../services/auto-trading-alert.service";
import {Observable} from "rxjs";

@Component({
  selector: 'alert-log-widget',
  templateUrl: './alert-log-widget.component.html',
  styleUrls: ['../new-alert-widget/alert-widget.component.scss']
})
export class AlertLogWidgetComponent implements OnInit {
  alertsHistory$: Observable<AlertHistory[]>;


  constructor(
      private _autoTradingAlertService: AutoTradingAlertService,
  ) { }

  ngOnInit() {
    this.alertsHistory$ = this._autoTradingAlertService.getAlertsHistoryStream();
  }

}
