import { Component } from '@angular/core';
import { LoadLayoutAction, OpenNewLayoutAction, SaveLayoutAsNewAction, SaveStateAction } from '@app/store/actions/platform.actions';
import { Store } from "@ngrx/store";
import { AppState } from '@app/store/reducer';
import { LayoutStorageService } from '@app/services/layout-storage.service';

@Component({
    selector: 'layout-management-menu',
    templateUrl: './layout-management-menu.component.html',
    styleUrls: ['./layout-management-menu.component.scss']
})
export class LayoutManagementMenuComponent {

    public get layoutName() {
        return this._layoutStorageService.currentDashboardName || "Default";
    }
    
    constructor(private _store: Store<AppState>, private _layoutStorageService: LayoutStorageService) {
    }

    saveLayout() {
        this._store.dispatch(new SaveStateAction());
    }

    saveLayoutAsNew() {
        this._store.dispatch(new SaveLayoutAsNewAction());
    }
    
    newLayout() {
        this._store.dispatch(new OpenNewLayoutAction());
    }
    
    loadLayout() {
        this._store.dispatch(new LoadLayoutAction());
    }
}
