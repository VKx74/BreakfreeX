import {ChangeDetectionStrategy, Component, EventEmitter, Input} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTPosition } from 'modules/Trading/models/forex/mt/mt.models';

@Component({
    selector: 'mt-positions',
    templateUrl: './mt-positions.component.html',
    styleUrls: ['./mt-positions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTPositionsComponent extends MTItemsComponent<MTPosition> {
    protected get _defaultHiddenColumns(): string[] {
        return ['Net Risk'];
    }
    
    protected get componentKey(): string {
        return "MTPositionsComponent";
    }

    protected loadItems(): Observable<MTPosition[]> {
        return of(this._mtBroker.positions);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onPositionsUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    closePosition(position: MTPosition) {
        if (position) {
            this.raisePositionClose(position);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
