import {Component, Injector} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {Modal} from "Shared";
import {AutoTradingAlertsTranslateService} from "../../localization/token";

export interface IStartAlertModalConfig {
  onConfirm: (onCloud: boolean) => void;
}

@Component({
  selector: 'start-alert',
  templateUrl: './start-alert.component.html',
  styleUrls: ['./start-alert.component.scss'],
  providers: [
    {
      provide: TranslateService,
      useExisting: AutoTradingAlertsTranslateService
    }
  ]
})
export class StartAlertComponent extends Modal<IStartAlertModalConfig> {
  onConfirm: (onCloud: boolean) => void;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    const data = this.data;

    this.onConfirm = data.onConfirm ? data.onConfirm : null;
  }

  confirm(onCloud?: boolean) {
    if (this.onConfirm) {
      this.onConfirm(onCloud);
    }
    this.close();
  }
}
