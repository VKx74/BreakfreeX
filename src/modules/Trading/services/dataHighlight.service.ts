import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { TradeManagerTab } from "../models/models";

export interface ITradePanelDataHighlight {
    ActivateTab: TradeManagerTab;
    Data: any[];
}

@Injectable()
export class DataHighlightService {
    public onTradePanelDataHighlight: Subject<ITradePanelDataHighlight> = new Subject();

    constructor() {

    }

    public HighlightDataInTradePanel(tab: TradeManagerTab, data: any[]) {
        this.onTradePanelDataHighlight.next({
            ActivateTab: tab,
            Data: data
        });
    }
}