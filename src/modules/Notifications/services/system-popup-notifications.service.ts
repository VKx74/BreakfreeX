import {Injectable} from "@angular/core";
import { SystemNotificationsService } from "./system-notifications.service";
import { SystemNotification } from "../models/models";
import { MarkdownHelperService } from "modules/Markdown/services/markdown-helper.service";

@Injectable()
export class SystemPopUpNotificationsService {
    private _interval: any;
    private _notifications: SystemNotification[] = [];
    private _notificationsProcessed: string[] = [];

    constructor(private _systemNotificationsService: SystemNotificationsService, private _mdHelper: MarkdownHelperService) {
    }

    private showNotification(notification: SystemNotification)
    {
        let container = document.createElement("div");
        let body = document.getElementsByTagName("body")[0];
        body.appendChild(container);
        setTimeout(() => {
            container.classList.add("sys-notification-popup-container");
        }, 1000);

        container.addEventListener("click", () => {
            container.remove();
            this.showNotifications();
        });

        let title = document.createElement("div");
        let text = document.createElement("div");
        let content = document.createElement("div");
        let icon = document.createElement("div");
        icon.classList.add("sys-notification-popup-icon");
        content.classList.add("sys-notification-popup-content");
        text.classList.add("sys-notification-popup-text");
        title.classList.add("sys-notification-popup-title");

        icon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
        title.innerHTML = notification.title;
        text.innerHTML = this._mdHelper.mdToHtml(notification.description);
        content.appendChild(title);
        content.appendChild(text);
        container.appendChild(icon);
        container.appendChild(content);
    }    

    startListening()
    {
        this.loadData();
        if (this._interval) {
            return;
        }

        this._interval = setInterval(() => {
            this.loadData();
        }, 1000 * 60 * 5);
    }

    stopListening()
    {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }
    
    private loadData()
    {
        this._systemNotificationsService.getNotifications().subscribe((data) => {
            this._notifications = data.notifications;
            this.showNotifications();
        });
    } 
    
    private showNotifications()
    {
        if (!this._notifications) {
            return;
        }

        for (let n of this._notifications) {
            if (!n.id) {
                continue;
            }
            if (this._notificationsProcessed.indexOf(n.id) >= 0) {
                continue;
            }

            this._notificationsProcessed.push(n.id);
            this.showNotification(n);
            return;
        }
    }
}
