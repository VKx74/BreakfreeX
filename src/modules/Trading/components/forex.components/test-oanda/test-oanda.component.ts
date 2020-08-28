import { Component, Injector, Inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TradingTranslateService } from "../../../localization/token";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { EBrokerInstance } from "../../../../../app/interfaces/broker/broker";
import { BrokerDialogComponent, BrokerDialogData } from "../../../../broker/components/broker/broker-dialog/broker-dialog.component";
import { tap } from "rxjs/operators";
import { BrokerService } from "../../../../../app/services/broker.service";
import { MatDialog } from "@angular/material/dialog";
import { ForexOrderConfiguratorModalComponent } from "../forex-order-configurator-modal/forex-order-configurator-modal.component";

@Component({
    selector: 'test-oanda',
    templateUrl: 'test-oanda.component.html',
    styleUrls: ['test-oanda.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class TestOandaComponent extends BaseLayoutItemComponent {
    EBrokerInstance = EBrokerInstance;

    static componentName = 'Test Oanda Component';
    static previewImgClass = 'crypto-icon-trade-manager';
    private _brokerConnected:boolean;

    get brokerConnected(){
        return this._brokerConnected;
    }

    get instanceType() {
        const brokerService = this._brokerService;

        return brokerService && brokerService.activeBroker && brokerService.activeBroker.instanceType;
    }

    protected getComponentState(): any {
        return null;
    }

    connect() : void {
        const ref = this._dialog.open<BrokerDialogComponent, BrokerDialogData>(BrokerDialogComponent, {
            data: {
                brokerType: EBrokerInstance.OandaBroker
            }
        }).afterClosed()
            .pipe(
                tap(() => {
                    if (!this._brokerService.activeBroker) {
                        //this.clearSelectedBroker();
                    }
                })
            )
            .subscribe(res => {
                // console.log('BROKER', res);
                // if (res) {
                //     this._brokerService.saveState()
                //         .subscribe(state => {
                //             console.log('SAVE BROKER STATE', state);
                //             this._brokerStorage.saveBrokerState(state);
                //         });
                //
                // } else {
                //     this.selectedBroker = null;
                // }
            });

    }

    constructor(private _brokerService: BrokerService,
        @Inject(TradingTranslateService) private _tradingTranslateService: TranslateService,
        //private _tradingTranslateService:TradingTranslateService,        
        private _dialog: MatDialog,
        protected _injector: Injector) {
            super(_injector);
    }

    ngOnInit() {
        super.setTitle(
            this._tradingTranslateService.stream('tradeManagerComponentName')
        );
        this._brokerService.activeBroker$
        .subscribe((broker) => {
            if (broker){
                this._brokerConnected=true;
            } else{
                this._brokerConnected=false;
            }

        });        
    }

    placeOrder() {
        this._dialog.open(ForexOrderConfiguratorModalComponent);
    }
}