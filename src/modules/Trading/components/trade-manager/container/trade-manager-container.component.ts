import {Component, Injector} from "@angular/core";
import { EBrokerInstance, IBroker } from "@app/interfaces/broker/broker";
import { BrokerService } from "@app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import { TradingTranslateService } from "modules/Trading/localization/token";
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { ConfirmModalComponent } from "UI";
import { OrderConfiguratorModalComponent } from "../order-configurator-modal/order-configurator-modal.component";
import { SymbolMappingComponent } from "../../forex.components/mt/symbol-mapping/symbol-mapping.component";
import { AlertService } from "@alert/services/alert.service";
import { MatDialog } from "@angular/material/dialog";
import { LinkingAction } from "@linking/models";

@Component({
    selector: 'trade-manager-container',
    templateUrl: 'trade-manager-container.component.html',
    styleUrls: ['trade-manager-container.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class TradeManagerContainerComponent {
    protected linker: Linker;
    EBrokerInstance = EBrokerInstance;
    
    get brokerInstance(): EBrokerInstance {
        return this.brokerService.activeBroker ? this.brokerService.activeBroker.instanceType : null;
    }

    get linkerColor(): string {
        return this.linker.getLinkingId();
    }

    get brokerConnected(): boolean {
        return !!(this.brokerService.activeBroker);
    }

    get broker(): IBroker {
        return this.brokerService ? this.brokerService.activeBroker : null;
    } 
    
    get showCancelAll(): boolean {
        return true;
    }  

    constructor(private brokerService: BrokerService, 
        protected _injector: Injector,
        protected _alertService: AlertService,
        private _dialog: MatDialog) {
        this.linker = this._injector.get(LinkerFactory).getLinker();
        this.linker.setDefaultLinking();
    }

    cancelAllPending() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Cancel orders',
                message: `Do you want to cancel all pending orders?`,
                onConfirm: () => {
                   this._cancelAllPending();
                }
            }
        });
    }

    placeOrder() {
        this._dialog.open(OrderConfiguratorModalComponent);
    }

    reconnect() {
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Reconnect',
                message: `Reconnect to current broker account?`,
                onConfirm: () => {
                   this._reconnect();
                }
            }
        });
    }

    disconnect() {        
        this.brokerService.disposeActiveBroker()
        .subscribe(() => {});      
    }

    showSymbolMapping() {    
        this._dialog.open(SymbolMappingComponent);    
    }  
    
    handleColorSelected(color: string) {
        this.linker.setLinking(color);
    }

    public handleOpenChart(action: LinkingAction) { 
        this.linker.sendAction(action);
    }

    private _cancelAllPending() {
        this._alertService.info("Canceling");
        let result = this.broker.cancelAll();
        result.subscribe(() => {
            this._alertService.success("Canceled");
          }, (error) => {
            this._alertService.info("Error to cancel one of the orders");
        });
    }

    private _reconnect() {
        this._alertService.info("Reconnecting");
        this.brokerService.reconnect().subscribe((res) => {
            if (res.result) {
                this._alertService.success("Broker reconnected");
            } else {
                this._alertService.warning("Failed to reconnect to broker");
            }
        }, (error) => {
            this._alertService.warning("Failed to reconnect to broker");
        });
    }
}
