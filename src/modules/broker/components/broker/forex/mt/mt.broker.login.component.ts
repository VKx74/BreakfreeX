import { Component } from '@angular/core';
import { FormControl } from "@angular/forms";
import { AlertService } from "@alert/services/alert.service";
import { TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";
import { BrokerFactory } from '@app/factories/broker.factory';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';
import { MTConnectionData, MTServer } from 'modules/Trading/models/forex/mt/mt.models';
import bind from "bind-decorator";
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MTBrokerServersProvider } from '@app/services/mt/mt.servers.service';
import { BrokerLogin } from '../../shared/broker-login';
import { MT5BrokerServersProvider } from '@app/services/mt/mt5.servers.service';
import { MT4BrokerServersProvider } from '@app/services/mt/mt4.servers.service';

@Component({
    selector: 'mt-broker-login',
    templateUrl: './mt.broker.login.component.html',
    styleUrls: ['./mt.broker.login.component.scss']
})
export class MTBrokerLoginComponent extends BrokerLogin {
    private _allBrokers = "All brokers";

    public login = "";
    public password = "";
    public selectedServer: MTServer;
    public selectedBroker: string;
    public _brokers: string[] = [];
    public _servers: MTServer[] = [];
    public brokerFormControl: FormControl = new FormControl();
    public serverFormControl: FormControl = new FormControl();

    public get brokers(): string[] {
        return this._brokers;
    }

    public get filteredBrokers(): string[] {
        const filterText = this.brokerFormControl.value;
        if (!filterText) {
            return this._brokers;
        }

        return this._brokers.filter(_ => _.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
    }

    public get filteredServers(): MTServer[] {
        let filterText = "";
        const filterObject = this.serverFormControl.value;
        const selectedBroker = this.brokerFormControl.value;
        const filteredByBrokers = this._servers.filter(_ => {
            return !selectedBroker || selectedBroker === this._allBrokers || selectedBroker === _.Broker;
        });

        if (!filterObject) {
            return filteredByBrokers;
        }

        if (filterObject.Name && filterObject.Broker) {
            return [filterObject];
        } else {
            filterText = this.serverFormControl.value;
        }

        if (!filterText) {
            return filteredByBrokers;
        }

        return filteredByBrokers.filter(_ => _.Name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1);
    }

    get brokerConnected(): boolean {
        return this._brokerService.activeBroker !== null && this._brokerService.activeBroker !== undefined;
    }

    constructor(protected _brokerFactory: BrokerFactory,
        protected _translateService: TranslateService,
        protected _brokerService: BrokerService,
        protected _mt5ServersProvider: MT5BrokerServersProvider,
        protected _mt4ServersProvider: MT4BrokerServersProvider,
        protected _alertService: AlertService) {
        super(_brokerFactory, _translateService, _brokerService, _alertService);
    }

    @bind
    captionText(value: MTServer) {
        return of(value.Name);
    }

    onBrokerSelected(event: MatAutocompleteSelectedEvent) {
        if (this.selectedBroker !== event.option.value) {
            this.selectedBroker = event.option.value;
            this.selectedServer = null;
            this.serverFormControl.setValue(this.selectedServer);
        }
    }

    onServerSelected(event: MatAutocompleteSelectedEvent) {
        this.selectedServer = event.option.value;
    }

    serverTitle(server: MTServer) {
        return server ? server.Name : "";
    }

    ngOnInit() {
        this.showSpinner = true;
        let provider: MTBrokerServersProvider = null;

        if (this.brokerInstance === EBrokerInstance.MT5) {
            provider = this._mt5ServersProvider;
        } else if (this.brokerInstance === EBrokerInstance.MT4) {
            provider = this._mt4ServersProvider;
        }

        if (provider) {
            provider.loadServers().subscribe((servers: MTServer[]) => {
                this.showSpinner = false;
                this._brokers.push(this._allBrokers);
                for (const server of servers) {
                    this._servers.push(server);

                    if (this._brokers.indexOf(server.Broker) === -1) {
                        this._brokers.push(server.Broker);
                    }
                }
                this.selectedBroker = this._allBrokers;
                this.brokerFormControl.setValue(this.selectedBroker);
                // this.selectDefaultServer();
            }, (error) => {
                this.showSpinner = false;
            });
        }
    }

    inputClicked(event: any) {
    }

    inputServerClicked(event: any) {
    }

    brokerSelected(account: IBrokerState) {
        for (const server of this._servers) {
            if (server.Name === account.server) {
                this.selectedServer = server;
                this.selectedBroker = server.Broker;
                this.brokerFormControl.setValue(this.selectedBroker);
                this.serverFormControl.setValue(this.selectedServer);
                break;
            }
        }

        if (account.state && account.state.Login) {
            this.login = (account.state as MTConnectionData).Login.toString();
        }

        if (account.state && account.state.Password) {
            this.password = (account.state as MTConnectionData).Password;
        }
    }

    connect() {
        if (!this.policyAccepted || !this.selectedServer) {
            return;
        }

        const initData: MTConnectionData = {
            Password: this.password,
            ServerName: this.selectedServer.Name,
            Login: Number(this.login)
        };

        this._connect(this.brokerInstance, initData);
    }

    savedAccountExists(): boolean {
        return this._savedAccountExists(this.brokerInstance);
    }

    disconnect(): void {
        this._disconnect();
    }
}
