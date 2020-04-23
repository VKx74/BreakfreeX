import { Component, OnInit } from '@angular/core';
import {AutoTradingAlertsRoutes} from "../../auto-trading-alerts.routes";
import {ToolsRoutes} from "../../../tools/tools.routes";
import {Router} from "@angular/router";

@Component({
  selector: 'tabs-alerts',
  templateUrl: './tabs-alerts.component.html',
  styleUrls: ['./tabs-alerts.component.scss']
})
export class TabsAlertsComponent implements OnInit {

  activeTab = '';
  showRout = true;

  get tabsRouters() {
    return AutoTradingAlertsRoutes;
  }


  constructor(private _router: Router) {
    if (this._router.url.indexOf(ToolsRoutes.alertsManager) < 0) {
      this.showRout = false;
      this.activeTab = this.tabsRouters.Alerts;
    }
  }

  ngOnInit() {
  }

}
