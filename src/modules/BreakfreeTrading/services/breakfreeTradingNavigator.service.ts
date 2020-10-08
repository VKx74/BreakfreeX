import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IBFTAlgoParameters } from '@app/services/algo.service';
import { BreakfreeTradingService } from './breakfreeTrading.service';

export interface INavigatorItem {
    parameters: IBFTAlgoParameters;
    indicatorId: string;
    data: any;
}

@Injectable()
export class BreakfreeTradingNavigatorService {

    public Items: INavigatorItem[] = [];

    public onItemAdded: Subject<INavigatorItem> = new Subject<INavigatorItem>();
    public onItemRemoved: Subject<INavigatorItem> = new Subject<INavigatorItem>();
    public onItemUpdated: Subject<INavigatorItem> = new Subject<INavigatorItem>();

    constructor(private bftService: BreakfreeTradingService) {
        
    }

    public indicatorDataLoaded(parameters: IBFTAlgoParameters, indicatorId: string, data: any) {
        let existing;

        for (const item of this.Items) {
            if (item.indicatorId === indicatorId) {
                existing = item;
                break;
            }
        }

        if (!existing) {
            const newItem = {
                data: data,
                indicatorId: indicatorId,
                parameters: parameters
            };
            this.Items.push(newItem);
            this.onItemAdded.next(newItem);
            return;
        }

        existing.data = data;
        existing.parameters = parameters;
        this.onItemUpdated.next(existing);
    }

    indicatorRemoved(indicatorId: string) {
        for (let i = 0; i < this.Items.length; i++) {
            const item = this.Items[i];
            if (item.indicatorId === indicatorId) {
                this.Items.splice(i, 1);
                this.onItemRemoved.next(item);
                return;
            }
        }
    }
}