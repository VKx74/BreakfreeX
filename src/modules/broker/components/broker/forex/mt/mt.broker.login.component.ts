import {Component, OnInit, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {OandaBrokerService, IOandaLoginAction} from "@app/services/oanda.exchange/oanda.broker.service";
import { BrokerFactory, CreateBrokerActionResult } from '@app/factories/broker.factory';
import { EBrokerInstance, IBrokerState } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';
import { MT5BrokerServersProvider } from '@app/services/mt/mt5.servers.service';
import { MTConnectionData, MTServer } from 'modules/Trading/models/forex/mt/mt.models';
import bind from "bind-decorator";
import { IMTLoginData } from 'modules/Trading/models/forex/mt/mt.communication';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MT4BrokerServersProvider } from '@app/services/mt/mt4.servers.service';
import { MTBrokerServersProvider } from '@app/services/mt/mt.servers.service';

@Component({
    selector: 'mt-broker-login',
    templateUrl: './mt.broker.login.component.html',
    styleUrls: ['./mt.broker.login.component.scss']
})
export class MTBrokerLoginComponent implements OnInit {
    private _allBrokers = "All brokers";

    public showSpinner = false;
    public login = "";
    public password = "";
    public selectedServer: MTServer;
    public selectedBroker: string;
    public _brokers: string[] = [];
    public _servers: MTServer[] = [];
    public brokerFormControl: FormControl = new FormControl();
    public serverFormControl: FormControl = new FormControl();

    @Input()
    public policyAccepted: boolean;

    @Input()
    public brokerInstance: EBrokerInstance;

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

    constructor(private _brokerFactory: BrokerFactory,
                private _translateService: TranslateService,
                private _brokerService: BrokerService,
                private _mt5ServersProvider: MT5BrokerServersProvider,
                private _mt4ServersProvider: MT4BrokerServersProvider,
                private _alertService: AlertService) {
    }

    @bind
    captionText(value: MTServer) {
        return of (value.Name);
    } 

    // getServerBySelectedBroker(): MTServer[] { 
    //     const res: MTServer[] = [];
    //     for (const server of this._servers) {
    //         if (server.Broker === this.selectedBroker || this.selectedBroker === this._allBrokers) {
    //             res.push(server);
    //         }
    //     }
    //     return res;
    // }
    
    onBrokerSelected(event: MatAutocompleteSelectedEvent) { 
        if (this.selectedBroker !== event.option.value) {
            this.selectedBroker = event.option.value;
            this.selectedServer = null;
            this.serverFormControl.setValue(this.selectedServer);
        }
        // this.selectDefaultServer();
    }

    onServerSelected(event: MatAutocompleteSelectedEvent) {
        this.selectedServer = event.option.value; 
    }

    serverTitle(server: MTServer) {
        return server ? server.Name : "";
    }

    // selectDefaultServer() { 
    //     const availableServers = this.getServerBySelectedBroker();
    //     if (availableServers.length) {
    //         this.selectedServer = availableServers[0];
    //     }
    // }

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

        this.showSpinner = true;
        this._brokerFactory.tryCreateInstance(this.brokerInstance, initData)
            .subscribe((value: CreateBrokerActionResult) => {
                this.showSpinner = false;
                if (!value.result) {
                    this._alertService.error(value.msg, this._translateService.get('broker.broker'));
                } else {
                    const brokerInstance = value.brokerInstance;

                    if (brokerInstance) {
                        this._brokerService.setActiveBroker(brokerInstance).subscribe(setBrokerResult => {
                            if (!setBrokerResult.result) {
                                this._alertService.error(setBrokerResult.msg, this._translateService.get('broker.broker'));
                                brokerInstance.dispose().subscribe(disposeResult => {
                                });
                            } else {
                                this._alertService.success(this._translateService.get('broker.connectedBroker'), this._translateService.get('broker.broker'));
                            }
                        }, setBrokerError => {
                            brokerInstance.dispose().subscribe(disposeResult => {
                            });
                            this._alertService.error(this._translateService.get('broker.setFailed'), this._translateService.get('broker.broker'));
                        });
                    } else {
                        this._alertService.error(this._translateService.get('broker.createFailed'), this._translateService.get('broker.broker'));
                    }
                }
            }, error => {
                this.showSpinner = false;
                this._alertService.error(this._translateService.get('broker.createFailed'), this._translateService.get('broker.broker'));
            });
    }

    savedAccountExists(): boolean {
        const brokers = this._brokerService.getSavedBroker();
        return brokers && brokers.length > 0;
    }

    disconnect(): void {
        this.showSpinner = true;
        // this._brokerService.disposeActiveBroker().subscribe(value => {
        //     this.showSpinner = false;
        //     if (value.result) {
        //         this.newSelectedAccount = "";
        //         this._alertService.success(this._translateService.get('broker.brokerDisconnected'));
        //     } else {
        //         this._alertService.error(this._translateService.get('broker.failedDisconnectBroker'));
        //         console.table(value);
        //     }
        // });
    }

    private _notifySucess(message) {
        this._alertService.success(message, this._getLocalizedTitle());
    }

    private _notifyError(message) {
        this._alertService.error(message, this._getLocalizedTitle());
    }

    private _getLocalizedTitle(): Observable<string> {
        return this._translateService.get('broker.broker');
    }
}
