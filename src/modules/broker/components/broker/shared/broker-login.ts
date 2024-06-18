import {Component, OnInit, Input} from '@angular/core';
import {AlertService} from "@alert/services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import { BrokerFactory, CreateBrokerActionResult } from '@app/factories/broker.factory';
import { EBrokerInstance } from '@app/interfaces/broker/broker';
import { BrokerService } from '@app/services/broker.service';


export class BrokerLogin {
    public showSpinner = false;

    @Input()
    public policyAccepted: boolean;

    @Input()
    public brokerInstance: EBrokerInstance;

    get brokerConnected(): boolean {
        return this._brokerService.activeBroker !== null && this._brokerService.activeBroker !== undefined;
    }

    constructor(protected _brokerFactory: BrokerFactory,
        protected _translateService: TranslateService,
        protected _brokerService: BrokerService,
        protected _alertService: AlertService) {
    }

    protected _connect(broker: EBrokerInstance, initData: any) {
        this.showSpinner = true;

        if (!!this._brokerService.activeBroker)
        {
            this._brokerService.disposeActiveBroker().subscribe((_) => {
                this._connectInternal(broker, initData);
            });
        } else {
            this._connectInternal(broker, initData);
        }
    }

    protected _connectInternal(broker: EBrokerInstance, initData: any)
    {
        this._brokerFactory.tryCreateInstance(broker, initData)
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
                this._alertService.error(this._getError(error), this._translateService.get('broker.broker'));
            });
    }

    protected _getError(e: any) {
        if (e instanceof Error) {
            if (e.message) {
                return e.message;
            }
        }

        if (e instanceof String) {
            return e as string;
        }
        
        return this._translateService.get('broker.createFailed');
    }

    protected _savedAccountExists(brokerType?: EBrokerInstance): boolean {
        const brokers = this._brokerService.getSavedBroker(brokerType);
        return brokers && brokers.length > 0;
    }

    protected _disconnect(): void {
        this.showSpinner = true;
        this._brokerService.disposeActiveBroker()
        .subscribe(() => {
            this.showSpinner = false;
        });   
    }

    protected _notifySucess(message) {
        this._alertService.success(message, this._getLocalizedTitle());
    }

    protected _notifyError(message) {
        this._alertService.error(message, this._getLocalizedTitle());
    }

    protected _getLocalizedTitle(): Observable<string> {
        return this._translateService.get('broker.broker');
    }
}
