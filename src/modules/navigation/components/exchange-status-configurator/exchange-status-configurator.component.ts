import {Component, Injector} from '@angular/core';
import {Modal} from "Shared";
import {JsUtil} from "../../../../utils/jsUtil";
import {ExchangeStatus, SystemNotificationsService} from "../../../Notifications/services/system-notifications.service";
import {of} from "rxjs";
import {AlertService} from "@alert/services/alert.service";

@Component({
    selector: 'exchange-status-configurator',
    templateUrl: './exchange-status-configurator.component.html',
    styleUrls: ['./exchange-status-configurator.component.scss']
})
export class ExchangeStatusConfiguratorComponent extends Modal {
    statuses: ExchangeStatus[];
    selectedStatus: ExchangeStatus;
    processing = false;

    exchangeStatuses: {[name: number]: string} = {
        [ExchangeStatus.OpenNormal]: 'Open normal',
        [ExchangeStatus.OpenRestricted]: 'Open restricted',
        [ExchangeStatus.PreOpen]: 'Pre open',
        [ExchangeStatus.Maintenance]: 'Maintenance',
        [ExchangeStatus.Closed]: 'Closed',
    };

    statusCaption = (status: ExchangeStatus) => {
        return of(this.exchangeStatuses[status]);
    }

    constructor(injector: Injector,
                private _alertService: AlertService,
                private _sysNotificationService: SystemNotificationsService) {
        super(injector);
        this.statuses = JsUtil.numericEnumToArray(ExchangeStatus);
        this.selectedStatus = this._sysNotificationService.exchangeStatus;
    }

    ngOnInit() {
    }

    selectStatus(newStatus: ExchangeStatus) {
        this.selectedStatus = newStatus;
    }

    save() {
        this.processing = true;
        this._sysNotificationService.updateExchangeStatus(this.selectedStatus)
            .subscribe(status => {
                this._alertService.success('System status was successfully updated');
                this._sysNotificationService.exchangeStatus = this.selectedStatus;
                this.processing = false;
                this.close(this.exchangeStatuses[this.selectedStatus]);
            }, error1 => {
                this._alertService.error('Failed to change system status');
                this.processing = false;
                console.log(error1);
            });
    }

}
