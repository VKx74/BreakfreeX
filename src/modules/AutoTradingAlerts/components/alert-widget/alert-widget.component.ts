import { Component, Inject, Injector, ViewChild } from '@angular/core';
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

@Component({
  selector: 'alert-widget',
  templateUrl: './alert-widget.component.html',
  styleUrls: ['alert-widget.component.scss']
})
export class AlertWidgetComponent extends BaseGoldenLayoutItemComponent {

  static componentName = 'BreakfreeAlerts';
  static previewImgClass = 'crypto-icon-alert';

  @ViewChild("alerts", { static: false }) private _component: BaseLayoutItem;

  protected useDefaultLinker(): boolean {
    return true;
  }

  constructor(@Inject(AutoTradingAlertsTranslateService) private _translateService: TranslateService, protected _injector: Injector) {
    super(_injector);
    super.setTitle(
      this._translateService.stream('alertsComponentName')
    );
  }

  ngOnInit() {
  }

  protected getComponentState() {
    return null;
  }

  handleOpenChart(action: LinkingAction) {
    this.linker.sendAction(action);
  }

  componentInitialized(component: BaseLayoutItem) {
  }
}
