import {Component, Injector} from "@angular/core";
import { EBrokerInstance } from "@app/interfaces/broker/broker";
import { BrokerService } from "@app/services/broker.service";
import {TranslateService} from "@ngx-translate/core";
import { TradingTranslateService } from "modules/Trading/localization/token";
import { Linker, LinkerFactory } from "@linking/linking-manager";
import { MatDialog } from "@angular/material";
import { ConfirmModalComponent } from "UI";
import { MTOrderConfiguratorModalComponent } from "../../forex.components/mt/order-configurator-modal/mt-order-configurator-modal.component";
import { SymbolMappingComponent } from "../../forex.components/mt/symbol-mapping/symbol-mapping.component";
import { AlertService } from "@alert/services/alert.service";

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

    get linkerColor(): string {
        return this.linker.getLinkingId();
    }

    get brokerConnected(): boolean {
        return !!(this.brokerService.activeBroker);
    }

    get instanceType() {
        const brokerService = this.brokerService;

        return brokerService && brokerService.activeBroker && brokerService.activeBroker.instanceType;
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
                //    this._cancelAllPending();
                }
            }
        });
    }

    placeOrder() {
        this._dialog.open(MTOrderConfiguratorModalComponent);
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
