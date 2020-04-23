import {Component, OnInit} from '@angular/core';
import {AdminRoutes} from "../../admin.routes";
import {ComponentIdentifier} from "@app/models/app-config";
import {Roles} from "@app/models/auth/auth.models";

@Component({
  selector: 'admin-panel-main-component',
  templateUrl: './admin-panel-main-component.html',
  styleUrls: ['./admin-panel-main-component.scss']
})

export class AdminPanelMainComponent implements OnInit {
    Roles = Roles;
    AdminRoutes = AdminRoutes;
    ComponentIdentifier = ComponentIdentifier;

  constructor() { }

  ngOnInit() {

  }


}
