import { Subject } from "rxjs";
import { BaseGoldenLayoutItemComponent } from "./base-golden-layout-item.component";

export class GoldenLayoutItemTracker {
    private _activeTab: BaseGoldenLayoutItemComponent;

    public activeTabChanged: Subject<void> = new Subject();

    public get activeTab(): BaseGoldenLayoutItemComponent {
        return this._activeTab;
    }

    public setActiveTab(element: BaseGoldenLayoutItemComponent) {
        this._activeTab = element;
        this.activeTabChanged.next();
    }
}
