import { Component, Inject, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseLayoutItemComponent } from '@layout/base-layout-item.component';
import { AutoTradingAlertsTranslateService } from 'modules/AutoTradingAlerts/localization/token';
import { MatDialog } from "@angular/material/dialog";
import { AlertBase } from 'modules/AutoTradingAlerts/models/AlertBase';
import { ConfirmModalComponent } from "UI";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { PriceAlertDialogComponent } from '../price-alert-dialog/price-alert-dialog.component';
import { SonarAlertDialogComponent } from '../sonar-alert-dialog/sonar-alert-dialog.component';

export enum AlertTabs {
  Alerts = 1,
  AlertsLog = 2
}

@Component({
  selector: 'alert-widget',
  templateUrl: './alert-widget.component.html',
  styleUrls: ['alert-widget.component.scss']
})
export class AlertWidgetComponent extends BaseLayoutItemComponent {
  static componentName = 'BreakfreeAlerts';
  AlertTabs = AlertTabs;
  selectedTabIndex: number = AlertTabs.Alerts;

  constructor(@Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService,
    private _alertsService: AlertsService,
    private _dialog: MatDialog, protected _injector: Injector) {
    super(_injector);
    super.setTitle(
      this._translateService.stream('alertsComponentName')
    );
  }

  ngOnInit() {
  }

  tabChanged(data: number) {
    this.selectedTabIndex = data;
  }

  showAlertDialog() {
    this._dialog.open(SonarAlertDialogComponent, {});
  }

  restartAllInactive() {
    this._dialog.open(ConfirmModalComponent, {
      data: {
        message: this._translateService.get('alertWidget.restartAllInactiveQuestion'),
        onConfirm: () => {
          this._restartAll();
        }
      }
    });
  }

  stopAll() {
    this._dialog.open(ConfirmModalComponent, {
      data: {
        message: this._translateService.get('alertWidget.stopAllQuestion'),
        onConfirm: () => {
          this._stopAll();
        }
      }
    });
  }

  deleteAllInactive() {
    this._dialog.open(ConfirmModalComponent, {
      data: {
        message: this._translateService.get('alertWidget.deleteAllInactiveQuestion'),
        onConfirm: () => {
          this._deleteAllInactive();
        }
      }
    });
  }

  private _restartAll() {
    // const alerts = this.alerts$.getValue();
    // const inactiveAlerts = alerts ? alerts.filter(a => !a.isStarted) : [];

    // if (inactiveAlerts.length) {
    //   forkJoin(
    //     inactiveAlerts.map((a) => {
    //       return this._processAlertAction(this._autoTradingAlertService.startAlert(a), a.externalId);
    //     })
    //   )
    //     .subscribe({
    //       next: () => {
    //         this._alertService.success(this._translateService.get('alertsRestarted'));
    //       },
    //       error: (error) => {
    //         this._alertService.error(this._translateService.get('failedToRestartAlerts'));
    //         console.log(error);
    //       }
    //     });
    // }
  }

  private _stopAll() {
    // const alerts = this.alerts$.getValue();

    // if (alerts && alerts.length) {
    //   forkJoin(alerts.filter(a => a.isStarted).map((a) => {
    //     return this._processAlertAction(this._autoTradingAlertService.stopAlert(a), a.externalId);
    //   }))
    //     .subscribe({
    //       next: () => {
    //         this._alertService.success(this._translateService.get('alertsStopped'));
    //       },
    //       error: (errors) => {
    //         this._alertService.error(this._translateService.get('failedToStopAlerts'));
    //         console.log(errors);
    //       }
    //     });
    // }
  }

  private _deleteAllInactive() {
    // const alerts = this.alerts$.getValue();
    // const inactiveAlerts = alerts ? alerts.filter(a => !a.isStarted) : [];

    // if (inactiveAlerts.length) {
    //   forkJoin(
    //     inactiveAlerts
    //       .map((a) => {
    //         return this._processAlertAction(this._autoTradingAlertService.deleteAlert(a.externalId), a.externalId);
    //       })
    //   )
    //     .subscribe(values => {
    //       this._alertService.success(this._translateService.get('alertsRemoved'));
    //     }, errors => {
    //       this._alertService.error(this._translateService.get('failedToRemoveAlerts'));
    //       console.log(errors);
    //     });
    // }
  }


  protected getComponentState() {
    return null;
  }
}
