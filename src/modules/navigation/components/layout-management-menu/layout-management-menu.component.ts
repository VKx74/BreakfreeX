import { Component } from '@angular/core';
import { LoadLayoutAction, OpenNewLayoutAction, SaveLayoutAsNewAction, SaveStateAction } from '@app/store/actions/platform.actions';
import { Store } from "@ngrx/store";
import { AppState } from '@app/store/reducer';

@Component({
    selector: 'layout-management-menu',
    templateUrl: './layout-management-menu.component.html',
    styleUrls: ['./layout-management-menu.component.scss']
})
export class LayoutManagementMenuComponent {

    constructor(private _store: Store<AppState>) {
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
