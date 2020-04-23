import { Component, OnInit } from '@angular/core';
import {AppRoutes} from "AppRoutes";
import {LandingRoutes} from "../../landing.routes";
import {ADMIN_ITEMS, ComponentAccessService} from "@app/services/component-access.service";
import {Roles} from "@app/models/auth/auth.models";
import {IdentityService} from "@app/services/auth/identity.service";

@Component({
  selector: 'landing-container-sidebar',
  templateUrl: './landing-container-sidebar.component.html',
  styleUrls: ['./landing-container-sidebar.component.scss', '../../../sidebar/styles/sidebar.scss']
})
export class LandingContainerSidebarComponent implements OnInit {
  AppRoutes = AppRoutes;
  LandingRoutes = LandingRoutes;
  role: string;

  constructor( private _identityService: IdentityService) { }

  ngOnInit() {
    this.role = this._identityService.role;
  }

  get isAdminPanelShown() {
    const role = this.role;
    return ComponentAccessService.isAccessibleComponentsArray(ADMIN_ITEMS)
        && (role === Roles.Admin
            || role === Roles.KYCOfficer
            || role === Roles.NewsOfficer
            || role === Roles.SocialMediaOfficer
            || role === Roles.SupportOfficer
            || role === Roles.SystemMonitoringOfficer);
  }

}
