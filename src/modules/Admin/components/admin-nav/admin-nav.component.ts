import {Component, OnInit} from '@angular/core';
import {Roles} from "@app/models/auth/auth.models";
import {ComponentIdentifier} from "@app/models/app-config";
import {
    ShuftiproAccountManagerComponent,
    ShuftiproAccountManagerConfig, ShuftiproAccountManagerResult
} from "../../../shuftipro-account-manager/components/shuftipro-account-manager/shuftipro-account-manager.component";
import {MatDialog} from "@angular/material/dialog";
import {ExchangeStatusConfiguratorComponent} from "../../../navigation/components/exchange-status-configurator/exchange-status-configurator.component";
import {ExchangeStatus, SystemNotificationsService} from "../../../Notifications/services/system-notifications.service";

@Component({
    selector: 'admin-nav',
    templateUrl: './admin-nav.component.html',
    styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent implements OnInit {
    exchangeStatuses: {[name: number]: string} = {
        [ExchangeStatus.OpenNormal]: 'Open normal',
        [ExchangeStatus.OpenRestricted]: 'Open restricted',
        [ExchangeStatus.PreOpen]: 'Pre open',
        [ExchangeStatus.Maintenance]: 'Maintenance',
        [ExchangeStatus.Closed]: 'Closed',
    };

    Roles = Roles;
    ExchangeStatus = this.exchangeStatuses[this._sysNotificationService.exchangeStatus];
    ComponentIdentifier = ComponentIdentifier;
    shuftiproAccountEmail = '';
    shuftiproStatus = '';
    isShuftiproHealthy: boolean;


    constructor(private _dialog: MatDialog,
                private _sysNotificationService: SystemNotificationsService
                ) {
    }

    ngOnInit() {
    }

    changeShuftiproAccount() {
        const shuftiproAccountManagerConfig: ShuftiproAccountManagerConfig = {
            currentEmail: this.shuftiproAccountEmail
        };
        this._dialog.open(ShuftiproAccountManagerComponent, {
            data: shuftiproAccountManagerConfig
        })
            .afterClosed()
            .subscribe((result: ShuftiproAccountManagerResult) => {
                if (result && result.newEmail) {
                    this.shuftiproAccountEmail = result.newEmail;
                }
            }, e => {
                console.log(e);
            });
    }

    showExchangeStatusSetting() {
        this._dialog.open(ExchangeStatusConfiguratorComponent).beforeClosed().subscribe(exchangeStatus => {
            if (exchangeStatus) {
                this.ExchangeStatus = exchangeStatus;
            }
        });
    }

}
