import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { AlertHistory } from 'modules/AutoTradingAlerts/models/AlertHistory';
import { AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { AlertGridBase } from '../alert-grid-base/alert-grid-base';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from '@alert/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { AutoTradingAlertsTranslateService } from 'modules/AutoTradingAlerts/localization/token';

@Component({
  selector: 'alert-log-grid',
  templateUrl: 'alert-log-grid.component.html',
  styleUrls: ['alert-log-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertLogGridComponent extends AlertGridBase<AlertHistory> {

  constructor(protected _dialog: MatDialog,
    protected _alertsService: AlertsService,
    protected _alertService: AlertService,
    @Inject(AutoTradingAlertsTranslateService) protected _translateService: TranslateService,
    protected _cdr: ChangeDetectorRef) {
    super(_dialog, _alertsService, _alertService, _translateService, _cdr);
  }

  getConditionTitle(alert: AlertHistory): Observable<string> {
    switch (alert.type) {
      case AlertType.PriceAlert: return this._translateService.get("priceAlert");
      case AlertType.SonarAlert: return this._translateService.get("sonarAlert");
    }
  }

  protected loadItems(): Observable<AlertHistory[]> {
    return of(this._alertsService.AlertHistory);
  }

  protected _subscribeOnUpdates(): Subscription {
    return this._alertsService.onAlertsHistoryChanged.subscribe(() => {
      this.updateItems();
    });
  }
}
