import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {OandaBrokerService, IOandaLoginAction} from "@app/services/oanda.exchange/oanda.broker.service";
import { BrokerFactory, CreateBrokerActionResult } from '@app/factories/broker.factory';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';
import { MT5BrokerServersProvider } from '@app/services/mt5/mt5.servers.service';
import { MT5Server } from 'modules/Trading/models/forex/mt/mt.models';
import bind from "bind-decorator";
import { IMT5LoginData } from 'modules/Trading/models/forex/mt/mt.communication';

@Component({
    selector: 'mt5-broker-login',
    templateUrl: './mt5.broker.login.component.html',
    styleUrls: ['./mt5.broker.login.component.scss']
})
export class MT5BrokerLoginComponent implements OnInit {
    public showSpinner = false;
    public login = "";
    public password = "";
    public selectedServer: MT5Server;
    public selectedBroker: string;
    public _brokers: string[] = [];
    public _servers: MT5Server[] = [];

    public get brokers(): string[] {
        return this._brokers;
    }

    get brokerConnected(): boolean {
        return this._brokerService.activeBroker !== null && this._brokerService.activeBroker !== undefined;
    }

    constructor(private _brokerFactory: BrokerFactory,
                private _translateService: TranslateService,
                private _brokerService: BrokerService,
                private _serversProvider: MT5BrokerServersProvider,
                private _alertService: AlertService) {

        this._serversProvider.loadServers().subscribe((servers: MT5Server[]) => {
            for (const server of servers) {
                this._servers.push(server);

                if (this._brokers.indexOf(server.Broker) === -1) {
                    this._brokers.push(server.Broker);
                }
            }

            if (this._brokers.length) {
                this.selectedBroker = this._brokers[0];
            }

            this.selectDefaultServer();
        }, (error) => {

        });

        // this.selectedServer = this.servers[0];
    }

    @bind
    captionText(value: MT5Server) {
        return of (value.Name);
    } 

    getServerBySelectedBroker(): MT5Server[] { 
        const res: MT5Server[] = [];
        for (const server of this._servers) {
            if (server.Broker === this.selectedBroker) {
                res.push(server);
            }
        }
        return res;
    }

    onBrokerSelected(broker: string) { 
        this.selectedBroker = broker;
        this.selectDefaultServer();
    }

    onServerSelected(server: MT5Server) {
        this.selectedServer = server; 
    }

    selectDefaultServer() { 
        const availableServers = this.getServerBySelectedBroker();
        if (availableServers.length) {
            this.selectedServer = availableServers[0];
        }
    }

    ngOnInit() {     
    }

    connect() {        
        const initData: IMT5LoginData = {
            Password: this.password,
            ServerName: this.selectedServer.Name,
            User: this.login
        };

        this.showSpinner = true;
        this._brokerFactory.tryCreateInstance(EBrokerInstance.MT5, initData)
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
