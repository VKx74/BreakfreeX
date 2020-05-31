/* tslint:disable */

import { Component, EventEmitter, Input, Output, Injector, Inject } from '@angular/core';
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";
import { BreakfreeTradingNavigatorService } from 'modules/BreakfreeTrading/services/breakfreeTradingNavigator.service';
import {GoldenLayoutItemState, LayoutManagerService} from "angular-golden-layout";
import { TranslateService } from '@ngx-translate/core';
import { BreakfreeTradingTranslateService } from 'modules/BreakfreeTrading/localization/token';

export interface IBFTNavigatorComponentState {
}

@Component({
    selector: 'BreakfreeTradingNavigator',
    templateUrl: './breakfreeTradingNavigator.component.html',
    styleUrls: ['./breakfreeTradingNavigator.component.scss']
})
export class BreakfreeTradingNavigatorComponent extends BaseLayoutItemComponent {

    
    

    static componentName = 'BreakfreeTradingNavigator';

    static previewImgClass = 'crypto-icon-watchlist';
    
    constructor(@Inject(GoldenLayoutItemState) protected _state: IBFTNavigatorComponentState, 
        @Inject(BreakfreeTradingTranslateService) private _bftTranslateService: TranslateService,
        protected _bftService: BreakfreeTradingNavigatorService, protected _injector: Injector) {
        super(_injector);

        if (_state) {
            this._loadState(_state);
        }
    }

    
    objective: string;
    status: string;
    suggestedrisk: string;
    positionsize: string;
    pas: string;
    macrotrend: string;
    n_currencySymbol: string;

    ngOnInit() {
        // component visible and UI elements accessible
        super.setTitle(
            this._bftTranslateService.stream('breakfreeTradingNavigatorComponentName')
        );

        // this.objective = "No trade zone";
        // this.status = "No trade zone";
        // this.suggestedrisk = "0% capital";
        // this.positionsize = "0 : split 0";
        // this.pas = "Market is neutral";
        // this.macrotrend = "Bullish uptrend";

        this.InitWebSocket();

        this.socket.onmessage = (event) => {
            console.log(`Data received:`, event.data);

            if(event.data === 'string'){

                let d = JSON.parse(event.data);
                this.objective = d.objective;
                this.status = d.status;
                this.suggestedrisk = d.suggestedrisk;
                this.positionsize = d.positionsize;
                this.pas = d.pas;
                this.macrotrend = d.macrotrend;
                this.n_currencySymbol = d.n_currencySymbol;
            }
            //
            
            // this.objective = "No trade zone";
            // this.status = "No trade zone";
            // this.suggestedrisk = "0% capital";
            // this.positionsize = "0 : split 0";
            // this.pas = "Market is neutral";
            // this.macrotrend = "Bullish uptrend";
        };

        this.socket.onopen = (event) => {
            this.socket.send("info");
        };


        
    }

    getComponentState(): IBFTNavigatorComponentState {
        // save your state
        return {
        };
    }

    private _loadState(state: IBFTNavigatorComponentState) {
        if (state) {
            // restore your state
        }
    }

    //private websocketAddress : string = "ws://127.0.0.1:2000"; //test
    private websocketAddress : string = "wss://fb.breakfreetrading.com"; //production
    private socket : WebSocket;
    private InitWebSocket(){
        
        if(!this.socket){
            console.log("Nav Connecting");
            this.socket = new WebSocket(this.websocketAddress);
        }
        else {
            if (this.socket.readyState === WebSocket.CLOSED){
                console.log("Nav Reconnecting");
                this.socket = new WebSocket(this.websocketAddress);
            }
        }

        this.socket.onopen = function(e) {
            console.log("Nav Connection established");
        };
        
        this.socket.onclose = (event) => {
            if (event.wasClean) {
                console.log(`Nav Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log("Nav Connection died.");
                //this.InitWebSocket();
                this.socket = new WebSocket(this.websocketAddress);
            }
        };
        
        this.socket.onerror = function(error) {
            console.log(`Nav ${error}`);
        };
    }
}