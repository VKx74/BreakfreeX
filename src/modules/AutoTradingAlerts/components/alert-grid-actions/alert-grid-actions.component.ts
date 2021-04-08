import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertBase } from "../../models/AlertBase";
import { AlertStatus } from 'modules/AutoTradingAlerts/models/EnumsDTO';

@Component({
    selector: 'alert-grid-actions',
    templateUrl: './alert-grid-actions.component.html',
    styleUrls: ['./alert-grid-actions.component.scss']
})
export class AlertGridActionsComponent {
    @Input() item: AlertBase;
    @Output() onRemove = new EventEmitter<AlertBase>();
    @Output() onEdit = new EventEmitter<AlertBase>();
    @Output() onLaunch = new EventEmitter<AlertBase>();

    constructor() {

    }

    isRunning(): boolean {
        if (!this.item) {
            return false;
        }

        return this.item.status === AlertStatus.Running;
    }

    handleAlertLaunchButtonClick() {
        this.onLaunch.next(this.item);
    }

    showAlertDialog() {
        this.onEdit.next(this.item);
    }

    removeAlert() {
        this.onRemove.next(this.item);
    }
}
