import {Component, OnInit} from '@angular/core';
import {ToolsRoutes} from "../../tools.routes";

@Component({
    selector: 'tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
    tabs = [
        {
            name: 'tools.news',
            url: ToolsRoutes.news,
        },
        {
            name: 'tools.alertsWidget',
            url: ToolsRoutes.alertsManager
        },
        // {
        //     name: 'tools.trends',
        //     url: ToolsRoutes.trends,
        // },
        {
            name: 'tools.economicCalendar',
            url: ToolsRoutes.economicCalendar,
        },
        {
            name: 'tools.publicChat',
            url: ToolsRoutes.publicChat,
        },
        {
            name: 'tools.privateChat',
            url: ToolsRoutes.privateChat,
        },
        {
            name: 'tools.notifications',
            url: ToolsRoutes.notifications
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
