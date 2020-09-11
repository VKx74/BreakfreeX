import {Component, OnInit, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {Observable, of} from "rxjs";
import {OandaBrokerService, IOandaLoginAction} from "@app/services/oanda.exchange/oanda.broker.service";
import { BrokerFactory, CreateBrokerActionResult } from '@app/factories/broker.factory';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';

@Component({
    selector: 'oanda-broker-login',
    templateUrl: './oanda.broker.login.component.html',
    styleUrls: ['./oanda.broker.login.component.scss']
})
export class OandaBrokerLoginComponent implements OnInit {
    addAccountForm: FormGroup;
    showSpinner = false;
    newSelectedAccount: string;

    selectedBroker: string;

    @Input()
    public policyAccepted: boolean;
    
    get brokers(): string[] {
        return ["Oanda"];
    } 

    get selectedSubAccount(): string {
        return this.brokerConnected ? 
            (this._brokerService.activeBroker as OandaBrokerService).activeSubAccount : "";
    }

    get tradingAccounts(): string[] {
        return this.brokerConnected ? 
            (this._brokerService.activeBroker as OandaBrokerService).tradingAccounts : [];
    }

    get brokerConnected(): boolean {
        return this._brokerService.activeBroker !== null && this._brokerService.activeBroker !== undefined;
    }

    get activeAccount(): string {
        return this.brokerConnected ? 
            (this._brokerService.activeBroker as OandaBrokerService).activeAccount : "";
    }

    constructor(private _brokerFactory: BrokerFactory,
                private _translateService: TranslateService,
                private _brokerService: BrokerService,
                private _alertService: AlertService) {

        this.newSelectedAccount = this.selectedSubAccount;

        this.addAccountForm = new FormGroup({
            accessToken: new FormControl('', [Validators.minLength(2)])
        });
    }

    ngOnInit() {        
        this.addAccountForm = new FormGroup({
            accessToken: new FormControl('', [Validators.minLength(2)])
        });
    }

    switchAccount() {
        this.showSpinner = true;
        (this._brokerService.activeBroker as OandaBrokerService).selectTradingAccount(this.newSelectedAccount).subscribe(value => {
            this.showSpinner = false;
            if (value.result) {
                this.newSelectedAccount = "";
                this._alertService.success(this._translateService.get('broker.brokerDisconnected'));
            } else {
                this._alertService.error(this._translateService.get('broker.failedDisconnectBroker'));
                console.table(value);
            }
        });
    }

    selectTradingAccount(account: string) {
        this.newSelectedAccount = account;
    }

    connect() {        
        if (!this.policyAccepted) {
            return;
        }
        
        if (this.addAccountForm.invalid) {
            this._notifyError(this._translateService.get('broker.createAccountError'));           
            return;
        }

        const initData: IOandaLoginAction = {
            ApiToken: this.addAccountForm.controls['accessToken'].value
        };

        this.showSpinner = true;
        this._brokerFactory.tryCreateInstance(EBrokerInstance.OandaBroker, initData)
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
                                this.newSelectedAccount = this.selectedSubAccount;
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
        this._brokerService.disposeActiveBroker().subscribe(value => {
            this.showSpinner = false;
            if (value.result) {
                this.newSelectedAccount = "";
                this._alertService.success(this._translateService.get('broker.brokerDisconnected'));
            } else {
                this._alertService.error(this._translateService.get('broker.failedDisconnectBroker'));
                console.table(value);
            }
        });
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
