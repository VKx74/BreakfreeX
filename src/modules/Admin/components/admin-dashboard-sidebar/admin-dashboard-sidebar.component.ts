import {Component} from "@angular/core";
import {Roles} from "@app/models/auth/auth.models";
import {SystemMonitoringService} from "../../services/system-monitoring.service";
import {AdminRoutes} from "../../admin.routes";
import {ComponentIdentifier} from "@app/models/app-config";
import {SystemMonitoringType, SystemMonitoringSubtype} from "../../data/system-monitoring.models";

@Component({
    selector: 'admin-dashboard-sidebar',
    templateUrl: 'admin-dashboard-sidebar.component.html',
    styleUrls: ['admin-dashboard-sidebar.component.scss'],
})
export class AdminDashboardSidebarComponent {
    ComponentIdentifier = ComponentIdentifier;
    Roles = Roles;
    AdminRoutes = AdminRoutes;
    SystemMonitoringType = SystemMonitoringType;
    SystemMonitoringSubtype = SystemMonitoringSubtype;

    constructor() {
    }
}
