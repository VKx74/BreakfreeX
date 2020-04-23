import {Component} from '@angular/core';
import {Roles} from "@app/models/auth/auth.models";
// import {SystemMonitoringItem, SystemMonitoringType} from "@app/models/system-monitoring/models";
import {SystemMonitoringService} from "../../../services/system-monitoring.service";
import {Router} from "@angular/router";
import {
  SystemMonitoringQueryParams,
  SystemMonitoringSubtype,
  SystemMonitoringType,
  URLS_MAP
} from "../../../data/system-monitoring.models";

@Component({
  selector: 'system-monitoring-menu',
  templateUrl: './system-monitoring-menu.component.html',
  styleUrls: ['./system-monitoring-menu.component.scss']
})
export class SystemMonitoringMenuComponent {
  readonly URLS_MAP = URLS_MAP;
  Roles = Roles;
  types = Object.keys(SystemMonitoringType);
  subtypes = Object.keys(SystemMonitoringSubtype);
  SystemMonitoringType = SystemMonitoringType;
  SystemMonitoringSubtype = SystemMonitoringSubtype;

  constructor(private _systemMonitoringService: SystemMonitoringService, private _router: Router) {
  }

  isTypeVisible(type: string): boolean {
    if (!URLS_MAP[type]) {
      return false;
    }

    for (let t in this.subtypes) {
      if (URLS_MAP[type][this.subtypes[t]]) {
        return true;
      }
    }
    return false;
  }

  navigate(type: string, subtype: string) {
    this._router.navigate(['/admin/system-monitoring'], {
      queryParams: new SystemMonitoringQueryParams(type, subtype)
    });
  }

  toProperString(str: string) {
    // TODO: Implement
    return `${str[0].toUpperCase()}${str.slice(1)}`.replace('/(\w*(?=[A-Z]))/', '777');
  }
}
