import { Component, Inject, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseGoldenLayoutItemComponent } from '@layout/base-golden-layout-item.component';
import { AutoTradingAlertsTranslateService } from 'modules/AutoTradingAlerts/localization/token';
import { MatDialog } from "@angular/material/dialog";
import { AlertBase, PriceAlert, SonarAlert } from 'modules/AutoTradingAlerts/models/AlertBase';
import { ConfirmModalComponent } from "UI";
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { PriceAlertDialogComponent } from '../price-alert-dialog/price-alert-dialog.component';
import { SonarAlertDialogComponent } from '../sonar-alert-dialog/sonar-alert-dialog.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { InstrumentService } from '@app/services/instrument.service';
import { AlertType } from 'modules/AutoTradingAlerts/models/EnumsDTO';
import { TriggerTimeframe } from 'modules/AutoTradingAlerts/models/Enums';
import { AlertConverters } from 'modules/AutoTradingAlerts/services/alert.converters';
import { IInstrument } from '@app/models/common/instrument';
import { AlertService } from '@alert/services/alert.service';
import { Actions, LinkingAction } from '@linking/models';
import { BaseLayoutItem } from '@layout/base-layout-item';

export enum AlertTabs {
  PriceAlerts = 0,
  SonarAlerts = 1,
  AlertsLog = 2,
  NotificationLog = 3
}

@Component({
  selector: 'alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['alerts.component.scss']
})
export class AlertComponent extends BaseLayoutItem {
  AlertTabs = AlertTabs;
  selectedTabIndex: AlertTabs = AlertTabs.PriceAlerts;

  constructor(@Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService,
    private _alertService: AlertService, protected _instrumentService: InstrumentService,
    private _dialog: MatDialog) {
      super();
  }

  ngOnInit() {
    this.initialized.next(this);
  }

  ngOnDestroy() {
    this.beforeDestroy.next(this);
  }

  tabChanged(data: MatTabChangeEvent) {
    this.selectedTabIndex = data.index;
  }

  showAlertDialog() {
    if (this.selectedTabIndex === AlertTabs.SonarAlerts) {
      this._dialog.open(SonarAlertDialogComponent, {});
    } else {
      this._dialog.open(PriceAlertDialogComponent, {});
    }
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

  public handleOpenChart(alert: AlertBase) {
    if (!alert) {
      return false;
    }

    let searchSymbol = "";
    let searchExchange = "";
    let granularity = 0;

    if (alert.type === AlertType.PriceAlert) {
      const priceAlert = alert as PriceAlert;
      searchSymbol = priceAlert.instrument;
      searchExchange = priceAlert.exchange;
    }

    if (alert.type === AlertType.SonarAlert) {
      const sonarAlert = alert as SonarAlert;
      searchSymbol = sonarAlert.instrument;
      if (sonarAlert.timeframe !== TriggerTimeframe.AllTimeframes) {
        granularity = AlertConverters.MapTriggerTimeframeToGranularity(sonarAlert.timeframe);
      }
    }

    this._instrumentService.getInstruments(null, searchSymbol).subscribe((data: IInstrument[]) => {
      if (!data || !data.length) {
        this._alertService.warning(this._translateService.get("failedToViewChart"));
        return;
      }

      let instrument = data[0];
      for (const i of data) {
        if (!searchExchange && searchSymbol === i.id) {
          instrument = i;
        } else if (searchExchange === i.exchange && searchSymbol === i.id) {
          instrument = i;
        }
      }

      let linkAction: LinkingAction = null;
      if (granularity) {
        linkAction = {
          type: Actions.ChangeInstrumentAndTimeframe,
          data: {
            instrument: instrument,
            timeframe: granularity
          }
        };
      } else {
        linkAction = {
          type: Actions.ChangeInstrument,
          data:  instrument
        };
      }
      this.onOpenChart.next(linkAction);
    }, (error) => {
      this._alertService.warning(this._translateService.get("failedToViewChart"));
    });
  }

  getState() {
    return null;
  }
  setState(state: any) {
  }

  protected getComponentState() {
    return null;
  }
}
